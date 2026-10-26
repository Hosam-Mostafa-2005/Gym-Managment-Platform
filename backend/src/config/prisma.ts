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

const pool =
  global.pgPoolInstance ||
  new Pool({
    connectionString: env.DATABASE_URL || process.env.DATABASE_URL,
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
