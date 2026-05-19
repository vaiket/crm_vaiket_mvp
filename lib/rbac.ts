export const rolePermissions: Record<string, string[]> = {
  super_admin: [
    "/dashboard",
    "/leads",
    "/lead-distribution",
    "/user-management",
    "/telecallers",
    "/performance",
    "/clients",
    "/sales",
    "/finance/dashboard",
    "/appointments",
    "/team",
    "/roles",
    "/call-center",
    "/call-logs",
    "/followups",
    "/whatsapp",
    "/email",
    "/tasks",
    "/reports",
    "/documents",
    "/support",
    "/notifications",
    "/chat",
    "/settings",
    "/super-admin"
  ],
  admin: [
    "/admin/dashboard",
    "/leads",
    "/lead-distribution",
    "/telecallers",
    "/appointments",
    "/reports",
    "/call-logs",
    "/followups"
  ],
  finance: ["/finance/dashboard", "/reports", "/documents"],
  telecaller: ["/telecaller/dashboard", "/telecaller/leads", "/telecaller/followups", "/telecaller/call-history", "/telecaller/performance", "/telecaller/profile"],
  "Super Admin": [
    "/",
    "/leads",
    "/clients",
    "/sales",
    "/appointments",
    "/team",
    "/roles",
    "/call-center",
    "/whatsapp",
    "/email",
    "/tasks",
    "/reports",
    "/documents",
    "/support",
    "/notifications",
    "/chat",
    "/settings",
    "/super-admin"
  ],
  Admin: [
    "/",
    "/leads",
    "/clients",
    "/sales",
    "/appointments",
    "/team",
    "/roles",
    "/call-center",
    "/whatsapp",
    "/email",
    "/tasks",
    "/reports",
    "/documents",
    "/support",
    "/notifications",
    "/chat",
    "/settings"
  ],
  "Sales Manager": ["/", "/leads", "/clients", "/sales", "/appointments", "/team", "/call-center", "/whatsapp", "/email", "/tasks", "/reports", "/chat"],
  "Sales Executive": ["/", "/leads", "/clients", "/sales", "/appointments", "/call-center", "/whatsapp", "/email", "/tasks", "/chat"],
  Telecaller: ["/", "/leads", "/appointments", "/call-center", "/whatsapp", "/tasks", "/notifications", "/chat"],
  "Appointment Setter": ["/", "/leads", "/appointments", "/call-center", "/whatsapp", "/tasks", "/notifications", "/chat"],
  "Support Agent": ["/", "/clients", "/support", "/whatsapp", "/email", "/tasks", "/notifications", "/chat"],
  Finance: ["/finance/dashboard", "/reports", "/documents"],
  HR: ["/", "/team", "/tasks", "/reports", "/notifications", "/chat"]
};

const roles = Object.keys(rolePermissions);

function getRoleKey(role: string) {
  const normalized = role.trim().toLowerCase().replaceAll(" ", "_");

  if (normalized in rolePermissions) return normalized;
  if (role in rolePermissions) return role;

  return "telecaller";
}

export function isValidRole(role: string) {
  const normalized = role.trim().toLowerCase().replaceAll(" ", "_");
  return roles.includes(normalized) || roles.includes(role);
}

export function getAllowedPaths(role: string) {
  return rolePermissions[getRoleKey(role)];
}

export function canAccessPath(role: string, pathname: string) {
  const allowedPaths = getAllowedPaths(role);

  return allowedPaths.some((path) => pathname === path || (path !== "/" && pathname.startsWith(`${path}/`)));
}

export function getDefaultPath(role: string) {
  return getAllowedPaths(role)[0] ?? "/";
}
