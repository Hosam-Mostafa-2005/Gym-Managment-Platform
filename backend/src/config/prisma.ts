import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

const { Pool } = pg;

declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var pgPoolInstance: pg.Pool | undefined;
}

const isTestEnv = process.env.NODE_ENV === "test";

let connectionString: string | undefined;

if (isTestEnv) {
  const testDbUrl = process.env.TEST_DATABASE_URL;
  if (!testDbUrl) {
    throw new Error(
      "SAFETY VIOLATION: NODE_ENV is 'test' but TEST_DATABASE_URL is not set. Execution blocked to protect development/production database.",
    );
  }
  const prodUrl = env.DATABASE_URL || process.env.DATABASE_URL;
  if (prodUrl && testDbUrl.trim() === prodUrl.trim()) {
    throw new Error(
      "SAFETY VIOLATION: TEST_DATABASE_URL cannot be identical to DATABASE_URL. Execution blocked to protect the live database.",
    );
  }
  connectionString = testDbUrl;
} else {
  connectionString = env.DATABASE_URL || process.env.DATABASE_URL;
}

const pool =
  global.pgPoolInstance ||
  new Pool({
    connectionString,
  });

const adapter = new PrismaPg(pool);

export const prisma =
  global.prismaInstance ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prismaInstance = prisma;
  global.pgPoolInstance = pool;
}

export default prisma;
