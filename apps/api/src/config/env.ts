import { z } from 'zod';

/**
 * Environment validation for the control-plane API. The process refuses to
 * start with an invalid environment — the same fail-fast pattern ForgeStack
 * generates into every project it produces.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:3100'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
});

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    // eslint-disable-next-line no-console
    console.error(`\n✖ Invalid environment configuration:\n${issues}\n`);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();

/** CORS origins parsed into an array (supports comma-separated values). */
export const corsOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
