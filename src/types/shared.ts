export type AgentRequest = {
  input: string;
  locale: "en" | "he";
};

export type AgentResponseChunk =
  | { type: "message"; content: string }
  | { type: "tool_call"; name: string; arguments: unknown }
  | { type: "tool_result"; name: string; result: unknown };
