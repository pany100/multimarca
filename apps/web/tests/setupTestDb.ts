import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { config } from "dotenv";
import { resolve } from "path";
const result = config({
  path: resolve(process.cwd(), ".env.test"),
  override: true,
});

if (result.error) {
  console.error("Error loading .env.test file:", result.error);
} else {
  console.log(".env.test file loaded successfully");
  console.log("Loaded environment variables:", result.parsed);
}

Object.assign(process.env, result.parsed);

async function setupTestDb() {
  try {
    console.log("DATABASE_URL:", process.env.DATABASE_URL);

    console.log("Running Prisma migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("Migrations completed successfully.");

    // Verificar si las tablas se crearon
    const prisma = new PrismaClient();
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    console.log("Tables in the database:", tables);

    // Intenta crear una tabla de prueba
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS test_table (id INT PRIMARY KEY)`;
    console.log("Test table created successfully.");

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error setting up test database:", error);
    process.exit(1);
  }
}

setupTestDb().catch(console.error);
