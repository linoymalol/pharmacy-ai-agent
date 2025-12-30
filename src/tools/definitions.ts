export type ToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type ToolHandler = (input: unknown) => Promise<unknown>;

export type ToolHandlerMap = Record<string, ToolHandler>;

export const toolDefinitions: ToolDefinition[] = [
  // TODO: define tool schemas
];
