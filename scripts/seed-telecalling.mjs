import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const prisma = new PrismaClient();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Supabase URL and service role key are required.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: WebSocket }
});

async function ensureAuthUser(email, password, metadata) {
  const { data: created, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata
  });

  if (!error && created.user) return created.user;

  const { data } = await supabase.auth.admin.listUsers();
  const existing = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (!existing) throw error;

  await supabase.auth.admin.updateUserById(existing.id, { password, user_metadata: metadata });
  return existing;
}

const superAdmin = await ensureAuthUser("superadmin@teamforce.in", "Admin@123", {
  name: "Rajesh Kumar",
  role: "super_admin"
});

await prisma.profile.upsert({
  create: {
    authUserId: superAdmin.id,
    email: "superadmin@teamforce.in",
    name: "Rajesh Kumar",
    phone: "+91 90000 00001",
    role: "super_admin"
  },
  update: {
    isActive: true,
    name: "Rajesh Kumar",
    role: "super_admin"
  },
  where: { authUserId: superAdmin.id }
});

const sampleLeads = [
  ["Meera Nair", "+91 98765 21031", "meera@astrafinserv.in", "LinkedIn Ads"],
  ["Vikram Desai", "+91 99882 11106", "vikram@northstar.co", "Website"],
  ["Ananya Kapoor", "+91 90155 77109", "ananya@urbanclinic.in", "Referral"],
  ["Sahil Reddy", "+91 90909 44481", "sahil@kriyaedutech.com", "Webinar"],
  ["Karan Malhotra", "+91 98888 67021", "karan@mintleafretail.in", "Cold Calling"],
  ["Lakshmi Iyer", "+91 90030 11842", "lakshmi@bluepeak.io", "Partner"]
];

for (const [name, phone, email, source] of sampleLeads) {
  const exists = await prisma.lead.findFirst({ where: { phone } });
  if (!exists) {
    await prisma.lead.create({ data: { email, name, phone, source } });
  }
}

await prisma.$disconnect();
console.log("Telecalling MVP seed complete.");
