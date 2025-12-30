export type AgentInput = {
  // TODO: Include user message, locale, and request metadata.
  message: string;
};

export type AgentOutput = {
  // TODO: Include streamed text chunks or final response.
  text: string;
  toolCalls: Array<{
    name: string;
    arguments: Record<string, unknown>;
  }>;
};
