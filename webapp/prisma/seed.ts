import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({ url: "file:dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("changeme123", 12);

  await prisma.user.upsert({
    where: { email: "admin@byui.edu" },
    update: {},
    create: {
      email: "admin@byui.edu",
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "advisor@byui.edu" },
    update: {},
    create: {
      email: "advisor@byui.edu",
      name: "Pre-Health Advisor",
      password: hashedPassword,
      role: "ADVISOR",
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: "student@byui.edu" },
    update: {},
    create: {
      email: "student@byui.edu",
      name: "Demo Student",
      password: hashedPassword,
      role: "STUDENT",
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      track: "Pre-Med",
      gpa: 3.72,
      scienceGpa: 3.65,
      examType: "MCAT",
      examScore: 511,
      shadowingHours: 65,
      clinicalHours: 180,
      serviceHours: 120,
      leadershipHours: 45,
      researchHours: 80,
    },
  });

  console.log("Seed complete. Login credentials:");
  console.log("  Admin:   admin@byui.edu   / changeme123");
  console.log("  Advisor: advisor@byui.edu / changeme123");
  console.log("  Student: student@byui.edu / changeme123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
