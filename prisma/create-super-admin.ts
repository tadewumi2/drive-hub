import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("SuperAdmin1!", 12);
  const user = await prisma.user.upsert({
    where: { email: "superadmin@drivehub.com" },
    update: { role: "SUPER_ADMIN" as "ADMIN" },
    create: {
      name: "Super Admin",
      email: "superadmin@drivehub.com",
      password,
      role: "SUPER_ADMIN" as "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Super admin created:", user.email, "| Role:", user.role);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
