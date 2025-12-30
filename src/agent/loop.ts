import type { AgentInput, AgentOutput } from "./types.js";
import type { ToolRegistry } from "../tools/types.js";

// TODO: Implement agent loop with streaming and tool dispatch.
export async function runAgentLoop(
  input: AgentInput,
  tools: ToolRegistry
): Promise<AgentOutput> {
  // TODO: Implement streaming, tool calls, and stateless flow.
  return {
    text: "",
    toolCalls: [],
  };
}
