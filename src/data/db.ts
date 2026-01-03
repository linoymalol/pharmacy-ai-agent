import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync, rmSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { seedDatabase } from "./seed.js";

type DatabaseType = Database.Database;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..", "..");
const dataDir = join(projectRoot, "src", "data");
const dbPath = join(dataDir, "pharmacy.db");
const schemaPath = join(__dirname, "schema.sql");

function initializeDatabase(): DatabaseType {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  if (existsSync(dbPath)) {
    rmSync(dbPath);
  }
  
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");

  const schema = readFileSync(schemaPath, "utf-8");
  db.exec(schema);
  seedDatabase(db);

  return db;
}

export const db: DatabaseType = initializeDatabase();
