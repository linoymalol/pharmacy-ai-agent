import type { ToolDefinition, ToolRegistry } from "./types.js";

// TODO: Define tool schemas and register handlers.
const definitions: ToolDefinition[] = [];

export function getToolRegistry(): ToolRegistry {
  // TODO: Return tool registry with definitions and handlers.
  return {
    definitions,
    handlers: {},
  };
}
