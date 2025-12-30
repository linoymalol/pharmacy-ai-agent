import type { IncomingMessage, ServerResponse } from "http";

export type RequestHandler = (
  _req: IncomingMessage,
  _res: ServerResponse
) => void;

export function createServer(_handler: RequestHandler): void {
  // TODO: implement HTTP server and SSE routes
}
