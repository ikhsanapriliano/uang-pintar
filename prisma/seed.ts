import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error("ADMIN_USERNAME dan ADMIN_PASSWORD harus diisi di .env");
  }

  const count = await prisma.admin.count();
  if (count > 0) {
    console.log("Admin sudah ada, lewati seed admin.");
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.admin.create({ data: { username, password: hash } });
  console.log(`Admin "${username}" berhasil dibuat.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
