import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

await prisma.user.upsert({
  create: {
    email: "superadmin@teamforce.in",
    name: "Rajesh Kumar",
    passwordHash: hashPassword("Admin@123"),
    role: "Super Admin",
    staffCode: "TF-SA-0001",
    status: "Active"
  },
  update: {
    name: "Rajesh Kumar",
    role: "Super Admin",
    status: "Active"
  },
  where: {
    email: "superadmin@teamforce.in"
  }
});

await prisma.$disconnect();
