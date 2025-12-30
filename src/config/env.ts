export type Env = {
  port: number;
  // TODO: Add OpenAI API key and other config fields.
};

export function loadEnv(): Env {
  // TODO: Validate environment variables.
  return {
    port: Number(process.env.PORT ?? 3000),
  };
}
