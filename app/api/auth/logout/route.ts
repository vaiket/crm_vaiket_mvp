import { NextResponse } from "next/server";
import { activityCookieName, impersonationCookieName } from "@/lib/auth-config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(impersonationCookieName);
  response.cookies.delete(activityCookieName);
  return response;
}
