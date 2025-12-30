import type { ToolDefinition, ToolHandlerMap } from "../tools/definitions";
import type { AgentRequest, AgentResponseChunk } from "../types/shared";

export interface AgentLoopOptions {
  tools: ToolDefinition[];
  handlers: ToolHandlerMap;
}

export async function* runAgentLoop(
  _request: AgentRequest,
  _options: AgentLoopOptions
): AsyncGenerator<AgentResponseChunk> {
  // TODO: implement stateless agent loop with streaming support
  yield { type: "message", content: "TODO" };
}
