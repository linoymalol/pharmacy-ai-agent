import http from "node:http";

export type ServerOptions = {
  port: number;
};

export function startServer({ port }: ServerOptions) {
  const server = http.createServer((req, res) => {
    void req;

    res.writeHead(501, { "Content-Type": "text/plain" });
    res.end("Not implemented");
  });

  server.listen(port, () => {
    // Placeholder for startup logging.
  });

  return server;
}
