export type AgentMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolCallId?: string;
};

export type AgentToolCall = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
};

export type AgentLoopResult = {
  messages: AgentMessage[];
  toolCalls: AgentToolCall[];
};

export type AgentLoopInput = {
  messages: AgentMessage[];
  tools: string[];
};

export async function runAgentLoop(input: AgentLoopInput): Promise<AgentLoopResult> {
  const { messages, tools } = input;

  void messages;
  void tools;

  return {
    messages: [],
    toolCalls: [],
  };
}
