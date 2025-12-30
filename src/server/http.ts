import { createServer } from "node:http";
import { loadEnv } from "../config/env.js";
import { registerRoutes } from "./routes.js";

// TODO: Initialize HTTP server and SSE endpoint.
const env = loadEnv();

const server = createServer((req, res) => {
  // TODO: Delegate to minimal router.
  registerRoutes(req, res);
});

server.listen(env.port, () => {
  // TODO: Add lightweight startup logging if desired.
});
