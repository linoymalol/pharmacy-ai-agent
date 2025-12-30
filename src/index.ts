import { runAgentLoop } from "./agent/agentLoop";
import { toolDefinitions } from "./tools/definitions";
import { toolHandlers } from "./tools/handlers";

void runAgentLoop({ input: "", locale: "en" }, { tools: toolDefinitions, handlers: toolHandlers });
