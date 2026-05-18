import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentProfile } from "@/lib/current-user";
import { canAccessPath, getAllowedPaths, getDefaultPath } from "@/lib/rbac";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vaiket Enterprise CRM",
  description: "Premium internal enterprise CRM frontend"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/";
  const isLoginPage = pathname === "/login";
  const isAuthApi = pathname.startsWith("/api/auth/");
  const currentUser = isLoginPage || isAuthApi ? null : await getCurrentProfile();

  if (!currentUser && !isLoginPage && !isAuthApi) {
    redirect(`/login?next=${encodeURIComponent(pathname)}`);
  }

  if (currentUser && !canAccessPath(currentUser.role, pathname)) {
    redirect(getDefaultPath(currentUser.role));
  }

  return (
    <html lang="en">
      <body>
        <AppShell allowedPaths={currentUser ? getAllowedPaths(currentUser.role) : []} currentUser={currentUser ? { email: currentUser.email, name: currentUser.name, role: currentUser.role } : null}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
