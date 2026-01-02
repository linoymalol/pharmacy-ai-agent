import pino from "pino";

export type LogMeta = Record<string, unknown>;

export type Logger = {
  info: (message: string, meta?: LogMeta) => void;
  warn: (message: string, meta?: LogMeta) => void;
  error: (message: string, meta?: LogMeta) => void;
};

const MAX_LOG_STRING_LENGTH = 200;

const truncateString = (value: string, maxLength: number = MAX_LOG_STRING_LENGTH): string =>
  value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;

const sanitizeMeta = (meta?: LogMeta): LogMeta | undefined => {
  if (!meta) {
    return undefined;
  }

  const sanitized: LogMeta = {};
  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === "string") {
      sanitized[key] = truncateString(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

const baseLogger = pino({
  level: process.env.LOG_LEVEL || "info",
});

export const createLogger = (requestId?: string): Logger => {
  const logger = requestId ? baseLogger.child({ requestId }) : baseLogger;

  return {
    info: (message, meta) => {
      logger.info(sanitizeMeta(meta), message);
    },
    warn: (message, meta) => {
      logger.warn(sanitizeMeta(meta), message);
    },
    error: (message, meta) => {
      logger.error(sanitizeMeta(meta), message);
    },
  };
};

export const createGlobalLogger = (): Logger =>
  createLogger(undefined);


export const truncateLogValue = truncateString;
