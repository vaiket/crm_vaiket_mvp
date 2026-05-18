import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/current-user";

export async function GET() {
  const user = await getCurrentProfile();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      email: user.email,
      id: user.id,
      name: user.name,
      role: user.role
    }
  });
}
