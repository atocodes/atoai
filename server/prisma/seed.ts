import "dotenv/config";
import { auth } from "../src/module/auth/service/auth.config";
import { prisma } from "@/lib/db/prisma";

async function main() {
  const email = process.env.INITIAL_ADMIN_EMAIL;
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const name = process.env.INITIAL_ADMIN_NAME || "Master Admin";

  if (!email || !password) {
    console.error(
      "[Seed] Error: Both INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD environment variables are required."
    );
    process.exit(1);
  }

  console.log(`[Seed] Checking if admin user exists (${email})...`);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`[Seed] User ${email} already exists. Removing old user and associated records...`);
    await prisma.user.delete({
      where: { id: existingUser.id },
    });
    console.log(`[Seed] ✓ Successfully removed previous user record.`);
  }

  console.log(`[Seed] Creating fresh admin user (${email})...`);

  try {
    const res = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (res && res.user) {
      await prisma.user.update({
        where: { id: res.user.id },
        data: { role: "admin" },
      });

      console.log(`\n========================================`);
      console.log(`✓ Admin User Seeded Successfully`);
      console.log(`========================================`);
      console.log(`Email:    ${email}`);
      console.log(`Password: ********`);
      console.log(`Role:     admin`);
      console.log(`User ID:  ${res.user.id}`);
      console.log(`========================================\n`);
    } else {
      console.error("[Seed] Failed to create admin user: response was empty.");
    }
  } catch (error: any) {
    console.error("[Seed] Error registering admin with Better Auth:", error.message || error);
    throw error;
  }
}

main()
  .catch((err) => {
    console.error("[Seed] Fatal error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
