import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../../generated/prisma/client";
import "dotenv/config";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL or TURSO_DATABASE_URL is not set in environment variables");
  }

  const authToken = process.env.TURSO_AUTH_TOKEN;

  const adapter = new PrismaLibSql({
    url: url,
    authToken: authToken,
  });

  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as typeof globalThis & {
  prisma: PrismaClient | undefined;
};

const db = globalForPrisma.prisma ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
