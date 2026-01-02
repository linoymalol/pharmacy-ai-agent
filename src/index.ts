import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createServer } from "./server/httpServer.js";

// Get the directory of the current module (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in the project root
// Go up from dist/ to project root
const envPath = join(__dirname, "..", ".env");
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("Error loading .env file:", result.error);
} else {
  console.log("✓ .env file loaded from:", envPath);
}

// Debug: Log if API key is loaded (without exposing the key)
if (process.env.OPENAI_API_KEY) {
  console.log("✓ OpenAI API key loaded from environment");
  console.log("  Key length:", process.env.OPENAI_API_KEY.length, "characters");
} else {
  console.warn("⚠ WARNING: OPENAI_API_KEY not found in environment variables");
  console.warn("  .env file path attempted:", envPath);
  console.warn("  Make sure you have a .env file in the project root with:");
  console.warn("  OPENAI_API_KEY=your-api-key-here");
}

const PORT = parseInt(process.env.PORT || "3000", 10);

createServer(PORT);
