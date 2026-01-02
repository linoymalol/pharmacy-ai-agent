export type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AgentRequest = {
  input: string;
  locale: "en" | "he";
  history?: ChatHistoryMessage[];
};

export type AgentResponseChunk =
  | { type: "message"; content: string }
  | { type: "tool_call"; name: string; arguments: unknown }
  | { type: "tool_result"; name: string; result: unknown };
