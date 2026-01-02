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

const formatMessage = (requestId: string | undefined, message: string, meta?: LogMeta): string => {
  const prefix = requestId ? `[${requestId}] ` : "";
  const sanitizedMeta = sanitizeMeta(meta);
  if (!sanitizedMeta || Object.keys(sanitizedMeta).length === 0) {
    return `${prefix}${message}`;
  }
  return `${prefix}${message} ${JSON.stringify(sanitizedMeta)}`;
};

export const createLogger = (requestId?: string): Logger => ({
  info: (message, meta) => {
    console.log(formatMessage(requestId, message, meta));
  },
  warn: (message, meta) => {
    console.warn(formatMessage(requestId, message, meta));
  },
  error: (message, meta) => {
    console.error(formatMessage(requestId, message, meta));
  },
});

export const createNullLogger = (): Logger => ({
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
});

export const truncateLogValue = truncateString;
