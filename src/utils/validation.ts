import { defaultLocale, isLocale, supportedLocales } from "../config/locale.js";
import type { AgentRequest, ChatHistoryMessage } from "../types/shared.js";

type ValidationResult =
  | { ok: true; value: AgentRequest }
  | { ok: false; error: string };

type HistoryInputItem = { role?: unknown; content?: unknown };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isChatRole = (value: unknown): value is ChatHistoryMessage["role"] =>
  value === "user" || value === "assistant";

const validateHistory = (history: unknown): ChatHistoryMessage[] | string => {
  if (!Array.isArray(history)) {
    return "Invalid history: must be an array";
  }

  const sanitized: ChatHistoryMessage[] = [];
  for (const [index, item] of history.entries()) {
    if (!isRecord(item)) {
      return `Invalid history item at index ${index}: must be an object`;
    }
    const { role, content } = item as HistoryInputItem;
    if (!isChatRole(role)) {
      return `Invalid history item at index ${index}: role must be 'user' or 'assistant'`;
    }
    if (typeof content !== "string") {
      return `Invalid history item at index ${index}: content must be a string`;
    }
    if (content.length === 0) {
      continue;
    }
    sanitized.push({ role, content });
  }

  return sanitized;
};

export const validateAgentRequest = (body: unknown): ValidationResult => {
  if (!isRecord(body)) {
    return { ok: false, error: "Invalid request body: expected a JSON object" };
  }

  const input = body.input;
  if (typeof input !== "string" || input.trim().length === 0) {
    return { ok: false, error: "Invalid input: 'input' is required and must be a string" };
  }

  let locale = defaultLocale;
  if (body.locale !== undefined) {
    if (!isLocale(body.locale)) {
      return {
        ok: false,
        error: `Invalid locale: must be one of ${supportedLocales.join(", ")}`,
      };
    }
    locale = body.locale;
  }

  let history: ChatHistoryMessage[] | undefined;
  if (body.history !== undefined) {
    const validated = validateHistory(body.history);
    if (typeof validated === "string") {
      return { ok: false, error: validated };
    }
    history = validated.length > 0 ? validated : undefined;
  }

  return {
    ok: true,
    value: {
      input,
      locale,
      history,
    },
  };
};
