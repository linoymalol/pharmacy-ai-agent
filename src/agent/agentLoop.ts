import OpenAI from "openai";
import type {
  EasyInputMessage,
  FunctionTool,
  ResponseFunctionToolCall,
  ResponseInputItem,
} from "openai/resources/responses/responses";
import type { ToolDefinition, ToolHandlerMap } from "../tools/definitions.js";
import type { AgentRequest, AgentResponseChunk } from "../types/shared.js";
import { systemPrompt } from "./systemPrompt.js";

export interface AgentLoopOptions {
  tools: ToolDefinition[];
  handlers: ToolHandlerMap;
  apiKey: string;
}

function convertToolsToOpenAIFormat(tools: ToolDefinition[]): FunctionTool[] {
  return tools.map((tool) => ({
    type: "function",
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
    strict: true,
  }));
}

function createInputMessage(role: EasyInputMessage["role"], content: string): EasyInputMessage {
  return {
    role,
    content,
    type: "message",
  };
}

export async function* runAgentLoop(
  request: AgentRequest,
  options: AgentLoopOptions
): AsyncGenerator<AgentResponseChunk> {
  const { input, locale, history = [] } = request;
  const { tools, handlers, apiKey } = options;

  if (!apiKey) {
    yield {
      type: "message",
      content: "Error: OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.",
    };
    return;
  }

  const openai = new OpenAI({
    apiKey,
  });

  const openaiTools = convertToolsToOpenAIFormat(tools);
  const messages: ResponseInputItem[] = [
    createInputMessage("system", systemPrompt),
    createInputMessage("system", `The customer's preferred language is ${locale}. Respond in ${locale}.`),
  ];
  for (const pastMessage of history) {
    messages.push(createInputMessage(pastMessage.role, pastMessage.content));
  }
  messages.push(createInputMessage("user", input));

  let maxIterations = 10; // Prevent infinite loops
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    try {
      const stream = await openai.responses.create({
        model: "gpt-4o", // Using GPT-4o as GPT-5 is not available
        input: messages,
        tools: openaiTools.length > 0 ? openaiTools : undefined,
        tool_choice: openaiTools.length > 0 ? "auto" : undefined,
        stream: true,
        temperature: 0.7,
      }).catch((error) => {
        console.error("OpenAI API error:", error);
        throw error;
      });

      let assistantMessage: EasyInputMessage = createInputMessage("assistant", "");
      const toolCallsById = new Map<string, ResponseFunctionToolCall>();

      const getOrCreateToolCall = (id: string, name?: string) => {
        if (!id) {
          return null;
        }
        const existing = toolCallsById.get(id);
        if (existing) {
          if (name && !existing.name) {
            existing.name = name;
          }
          return existing;
        }
        const toolCall: ResponseFunctionToolCall = {
          type: "function_call",
          call_id: id,
          name: name ?? "",
          arguments: "",
        };
        toolCallsById.set(id, toolCall);
        return toolCall;
      };

      const appendToolCallArguments = (id: string, delta: string) => {
        const toolCall = getOrCreateToolCall(id);
        if (!toolCall) {
          return;
        }
        toolCall.arguments += delta;
      };

      for await (const chunk of stream) {
        const event = chunk as {
          type?: string;
          delta?: string;
          item?: {
            id?: string;
            type?: string;
            name?: string;
            arguments?: string;
            call_id?: string;
          };
          call_id?: string;
          name?: string;
          item_id?: string;
          text?: string;
        };

        if (event.type === "response.output_text.delta") {
          const delta = event.delta ?? "";
          if (delta) {
            assistantMessage.content = `${assistantMessage.content}${delta}`;
            yield {
              type: "message",
              content: delta,
            };
          }
          continue;
        }

        if (event.type === "response.output_item.added" && event.item) {
          const item = event.item;
          if (item.type === "tool_call" || item.type === "function_call") {
            const id = item.call_id ?? item.id ?? "";
            const name = item.name ?? "";
            const toolCall = getOrCreateToolCall(id, name);
            if (toolCall && item.arguments) {
              toolCall.arguments = item.arguments;
            }
          }
          continue;
        }

        if (event.type === "response.output_item.delta" && event.item) {
          const item = event.item;
          if ((item.type === "tool_call" || item.type === "function_call") && item.arguments) {
            const id = item.call_id ?? item.id ?? "";
            appendToolCallArguments(id, item.arguments);
          }
          continue;
        }

        if (event.type === "response.output_item.done" && event.item) {
          const item = event.item;
          if (item.type === "function_call") {
            const id = item.call_id ?? item.id ?? "";
            const toolCall = getOrCreateToolCall(id, item.name);
            if (toolCall) {
              toolCall.name = item.name ?? toolCall.name;
              toolCall.arguments = item.arguments ?? toolCall.arguments;
            }
          }
          continue;
        }

        if (event.type === "response.function_call_arguments.delta") {
          const id = event.call_id ?? event.item_id ?? "";
          if (!id) continue;
          const toolCall = getOrCreateToolCall(id, event.name);
          if (!toolCall) {
            continue;
          }
          toolCall.arguments += event.delta ?? "";
          continue;
        }

        if (event.type === "response.function_call_arguments.done") {
          const id = event.call_id ?? event.item_id ?? "";
          if (!id) continue;
          const toolCall = getOrCreateToolCall(id, event.name);
          if (!toolCall) {
            continue;
          }
          toolCall.arguments = event.item?.arguments ?? toolCall.arguments;
          continue;
        }

        if (event.type === "response.output_text.done") {
          const text = event.text ?? "";
          if (text && !assistantMessage.content) {
            assistantMessage.content = text;
          }
        }
      }

      // Add tool calls to assistant message if any
      if (assistantMessage.content) {
        messages.push(assistantMessage);
      }

      const toolCalls = Array.from(toolCallsById.values()).filter(
        (toolCall) => toolCall.name && toolCall.call_id
      );
      if (toolCalls.length > 0) {
        for (const toolCall of toolCalls) {
          messages.push(toolCall);
        }
      }

      // Execute tool calls if any
      if (toolCalls.length > 0) {
        for (const toolCall of toolCalls) {
          const toolName = toolCall.name;
          let toolArgs: unknown = {};
          try {
            toolArgs = JSON.parse(toolCall.arguments || "{}");
          } catch (error) {
            const errorResult = {
              success: false,
              error: `Invalid tool arguments for '${toolName}': ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            };
            messages.push({
              type: "function_call_output",
              call_id: toolCall.call_id,
              output: JSON.stringify(errorResult),
            });
            yield {
              type: "tool_result",
              name: toolName,
              result: errorResult,
            };
            continue;
          }

          yield {
            type: "tool_call",
            name: toolName,
            arguments: toolArgs,
          };

          const handler = handlers[toolName];
          if (!handler) {
            const errorResult = {
              success: false,
              error: `Tool handler '${toolName}' not found`,
            };
            messages.push({
              type: "function_call_output",
              call_id: toolCall.call_id,
              output: JSON.stringify(errorResult),
            });
            yield {
              type: "tool_result",
              name: toolName,
              result: errorResult,
            };
            continue;
          }

          try {
            const result = await handler(toolArgs);
            const resultString = JSON.stringify(result);
            messages.push({
              type: "function_call_output",
              call_id: toolCall.call_id,
              output: resultString,
            });
            yield {
              type: "tool_result",
              name: toolName,
              result,
            };
          } catch (error) {
            const errorResult = {
              success: false,
              error: `Error executing tool: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
            messages.push({
              type: "function_call_output",
              call_id: toolCall.call_id,
              output: JSON.stringify(errorResult),
            });
            yield {
              type: "tool_result",
              name: toolName,
              result: errorResult,
            };
          }
        }
        // Continue the loop to get the assistant's response after tool execution
        continue;
      } else {
        // No tool calls, conversation is complete
        break;
      }
    } catch (error) {
      console.error("Error in agent loop iteration:", error);
      let errorMessage = "Unknown error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        // Check for OpenAI API specific errors
        if (error.message.includes("API key")) {
          errorMessage = "OpenAI API key is invalid or missing. Please check your OPENAI_API_KEY environment variable.";
        } else if (error.message.includes("rate limit")) {
          errorMessage = "OpenAI API rate limit exceeded. Please try again later.";
        } else if (error.message.includes("model")) {
          errorMessage = "OpenAI model error. Please check the model name.";
        }
      }
      
      yield {
        type: "message",
        content: `Error: ${errorMessage}`,
      };
      break;
    }
  }

  if (iteration >= maxIterations) {
    yield {
      type: "message",
      content: "Maximum iteration limit reached. Please try again with a simpler query.",
    };
  }
}
