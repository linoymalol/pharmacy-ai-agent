import type { IncomingMessage, ServerResponse } from "node:http";

// TODO: Keep routing minimal; handle health check and SSE stream.
export function registerRoutes(req: IncomingMessage, res: ServerResponse): void {
  // TODO: Implement minimal routing logic.
  res.statusCode = 404;
  res.end();
}
