import prisma from "./prisma.js";

const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("🐘 PostgreSQL Connected via Prisma");
  } catch (error) {
    console.error("❌ Database Connection Failed:", error);
    process.exit(1);
  }
};

export default connectDB;
