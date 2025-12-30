export type ToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

export type ToolRegistryEntry = {
  definition: ToolDefinition;
  handler: ToolHandler;
};

export const toolRegistry: ToolRegistryEntry[] = [];
