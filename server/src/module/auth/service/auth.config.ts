import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { prisma } from "@/prisma/db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.BASE_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || "atoai_super_secret_auth_key_2026",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    bearer(),
  ],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    ...(process.env.ADMIN_URL
      ? [
          process.env.ADMIN_URL.trim().replace(/\/+$/, ""),
          `${process.env.ADMIN_URL.trim().replace(/\/+$/, "")}/`,
        ]
      : ["http://localhost:3001"]),
  ],
});
