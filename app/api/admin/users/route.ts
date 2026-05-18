import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { isValidRole } from "@/lib/rbac";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUserFromRequest(request);

  if (!currentUser || !["Super Admin", "Admin"].includes(currentUser.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    email?: string;
    name?: string;
    password?: string;
    role?: string;
    staffCode?: string;
  };

  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim();
  const password = body.password ?? "";
  const role = body.role?.trim() || "Admin";

  if (!email || !name || password.length < 6) {
    return NextResponse.json({ error: "Name, valid email aur 6+ character password required hai." }, { status: 400 });
  }

  if (!isValidRole(role)) {
    return NextResponse.json({ error: "Valid role select karein." }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashPassword(password),
      role,
      staffCode: body.staffCode?.trim() || null
    },
    select: {
      email: true,
      id: true,
      name: true,
      role: true,
      status: true
    }
  });

  return NextResponse.json({ user }, { status: 201 });
}
