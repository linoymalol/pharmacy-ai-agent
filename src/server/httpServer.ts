import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { runAgentLoop } from "../agent/agentLoop.js";
import { toolDefinitions } from "../tools/definitions.js";
import { toolHandlers } from "../tools/handlers.js";
import type { AgentResponseChunk } from "../types/shared.js";
import { createLogger, truncateLogValue } from "../utils/logger.js";
import { validateAgentRequest } from "../utils/validation.js";

const setSseHeaders = (res: Response): void => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
};

const writeSseData = (res: Response, payload: unknown): void => {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
  const resWithFlush = res as Response & { flush?: () => void };
  if (typeof resWithFlush.flush === "function") {
    resWithFlush.flush();
  }
};

const endSseStream = (res: Response): void => {
  try {
    res.write("data: [DONE]\n\n");
  } finally {
    res.end();
  }
};

export function createServer(port: number = 3000): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.static("public"));

  // Health check endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // SSE endpoint for streaming agent responses
  app.post("/api/chat", async (req: Request, res: Response) => {
    const requestId = randomUUID();
    const logger = createLogger(requestId);
    try {
      const validation = validateAgentRequest(req.body);
      if (!validation.ok) {
        res.status(400).json({ error: validation.error });
        return;
      }
      const { input } = validation.value;
      logger.info("Request start", {
        path: req.path,
        method: req.method,
        inputPreview: truncateLogValue(input),
        inputLength: input.length,
      });

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: "OpenAI API key is not configured" });
        return;
      }

      // Set up SSE headers
      setSseHeaders(res);
      try {
        for await (const chunk of runAgentLoop(validation.value, {
          tools: toolDefinitions,
          handlers: toolHandlers,
          apiKey,
          logger,
        })) {
          // Format as SSE
          writeSseData(res, chunk);
        }

        // Send end marker
        endSseStream(res);
      } catch (error) {
        logger.error("Error in agent loop", { message: error instanceof Error ? error.message : "Unknown error" });
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        const errorChunk: AgentResponseChunk = {
          type: "message",
          content: `Error: ${errorMessage}`,
        };
        try {
          writeSseData(res, errorChunk);
          endSseStream(res);
        } catch (writeError) {
          logger.error("Error writing error response", {
            message: writeError instanceof Error ? writeError.message : "Unknown error",
          });
          if (!res.headersSent) {
            res.status(500).json({ error: errorMessage });
          }
        }
      }
    } catch (error) {
      logger.error("Error in /api/chat endpoint", { message: error instanceof Error ? error.message : "Unknown error" });
      if (!res.headersSent) {
        res.status(500).json({
          error: error instanceof Error ? error.message : "Unknown error occurred",
        });
      } else {
        try {
          endSseStream(res);
        } catch (finalizeError) {
          logger.error("Failed to finalize SSE stream", {
            message: finalizeError instanceof Error ? finalizeError.message : "Unknown error",
          });
        }
      }
    }
  });

  // Start server
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  return app;
}
