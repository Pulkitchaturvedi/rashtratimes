import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().url().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  NEXT_PUBLIC_API_URL: z.string().optional(),
  REVALIDATION_SECRET: z.string().optional(),
  HTTP_PORT: z.coerce.number().default(3333)
});

export type AppConfig = z.infer<typeof configSchema>;

export default () => {
  const result = configSchema.safeParse(process.env);
  if (!result.success) {
    console.error(result.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }
  const env = result.data;
  return {
    env: env.NODE_ENV,
    http: {
      port: env.HTTP_PORT
    },
    database: {
      url: env.DATABASE_URL
    },
    jwt: {
      secret: env.JWT_SECRET
    },
    redis: {
      url: env.REDIS_URL
    },
    storage: {
      bucket: env.S3_BUCKET,
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      accessKey: env.S3_ACCESS_KEY,
      secretKey: env.S3_SECRET_KEY
    },
    next: {
      siteUrl: env.NEXT_PUBLIC_SITE_URL,
      apiUrl: env.NEXT_PUBLIC_API_URL,
      revalidationSecret: env.REVALIDATION_SECRET
    }
  } as const;
};
