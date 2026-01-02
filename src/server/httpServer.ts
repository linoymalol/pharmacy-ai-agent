import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import { runAgentLoop } from "../agent/agentLoop.js";
import { toolDefinitions } from "../tools/definitions.js";
import { toolHandlers } from "../tools/handlers.js";
import type { AgentRequest, AgentResponseChunk } from "../types/shared.js";

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
    try {
      const { input, locale = "en" } = req.body as {
        input?: string;
        locale?: "en" | "he";
      };

      if (!input || typeof input !== "string") {
        res.status(400).json({ error: "Invalid input: 'input' is required and must be a string" });
        return;
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: "OpenAI API key is not configured" });
        return;
      }

      // Set up SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

      const request: AgentRequest = {
        input,
        locale: locale === "he" ? "he" : "en",
      };

      try {
        for await (const chunk of runAgentLoop(request, {
          tools: toolDefinitions,
          handlers: toolHandlers,
          apiKey,
        })) {
          // Format as SSE
          const data = JSON.stringify(chunk);
          res.write(`data: ${data}\n\n`);

          // Flush the response to ensure immediate delivery (if available)
          const resWithFlush = res as Response & { flush?: () => void };
          if (typeof resWithFlush.flush === "function") {
            resWithFlush.flush();
          }
        }

        // Send end marker
        res.write("data: [DONE]\n\n");
        res.end();
      } catch (error) {
        console.error("Error in agent loop:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        const errorChunk: AgentResponseChunk = {
          type: "message",
          content: `Error: ${errorMessage}`,
        };
        try {
          res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
          res.write("data: [DONE]\n\n");
          res.end();
        } catch (writeError) {
          console.error("Error writing error response:", writeError);
          if (!res.headersSent) {
            res.status(500).json({ error: errorMessage });
          }
        }
      }
    } catch (error) {
      console.error("Error in /api/chat endpoint:", error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: error instanceof Error ? error.message : "Unknown error occurred" 
        });
      }
    }
  });

  // Start server
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  return app;
}
