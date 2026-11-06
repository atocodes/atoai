import z from "zod";

const envSchema = z.object({
    EMBEDDING_PROVIDER: z.string().default("ollama"),
    EMBEDDING_DIMENSIONS: z.coerce.number().default(768),
    DATABASE_URL: z.string().min(1, "DATABASE_URL required"),

    // Telegram Environemt Secrets
    TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN required"),
    WEBHOOK_SECRET: z.string().min(1, "WEBHOOK_SECRET required"),
    TELEGRAM_CHANNEL_ID: z.string().min(1, "TELEGRAM_CHANNEL_ID required"),
    TELEGRAM_WEBHOOK_URL: z.string().min(1, "TELEGRAM_WEBHOOK_URL required"),


    // AI Provider Environment Secrets
    OLLAMA_API_KEY: z.string().min(1, "OLLAMA_API_KEY required"),
    CLOUD_OLLAMA_MODEL: z.string().min(1, "CLOUD_OLLAMA_MODEL required"),
    GEMINI_API_KEY: z.string().nullable().optional(),
    GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
    JINA_API_KEY: z.string().min(1, "JINA_API_KEY required"),
    JINA_EMBEDDING_MODEL: z.string().default("jina-embeddings-v4"),
    LOCAL_OLLAMA_HOST: z.string().default("http://localhost:11434"),
    OLLAMA_EMBEDDING_MODEL: z.string().default("embeddinggemma"),
})

export type ENV = z.infer<typeof envSchema>;

function validateEnv(): ENV {
    const result = envSchema.safeParse(process.env)

    if (!result.success) {
        console.error("==================ERRORS==============")
        for (const issue of result.error.issues) {
            console.error(`[${issue.path.join(".")}] : ${issue.message}`)
        }
        console.error("======================================")
        throw new Error("Environment validation failed")
    }

    return result.data
}

export const env = validateEnv()
