import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const sqlPath = path.join(process.cwd(), "supabase", "telecalling_mvp.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

function splitSqlStatements(value) {
  const statements = [];
  let current = "";
  let inDollarQuote = false;

  for (let index = 0; index < value.length; index += 1) {
    const pair = value.slice(index, index + 2);
    if (pair === "$$") {
      inDollarQuote = !inDollarQuote;
      current += pair;
      index += 1;
      continue;
    }

    const char = value[index];
    if (char === ";" && !inDollarQuote) {
      if (current.trim()) statements.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) statements.push(current.trim());
  return statements;
}

const statements = splitSqlStatements(sql);

for (const statement of statements) {
  try {
    await prisma.$executeRawUnsafe(statement);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("already exists")) {
      throw error;
    }
  }
}

await prisma.$disconnect();
console.log("Telecalling RLS SQL applied.");
