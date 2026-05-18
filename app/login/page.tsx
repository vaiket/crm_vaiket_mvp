import { BadgeCheck, ShieldCheck, Zap } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const nextPath = (await searchParams).next || "/";

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-lg border border-border/80 bg-ink-950/72 shadow-panel backdrop-blur-xl lg:grid-cols-[1fr_440px]">
        <div className="relative hidden min-h-[640px] overflow-hidden border-r border-border/80 bg-[radial-gradient(circle_at_30%_20%,rgba(22,199,143,0.20),transparent_30%),radial-gradient(circle_at_75%_70%,rgba(21,151,211,0.18),transparent_32%),rgba(10,16,25,0.92)] p-8 lg:block">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_12px_28px_rgba(20,184,166,0.18)]">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Vaiket CRM</p>
              <p className="text-xs text-muted-foreground">Super admin workspace</p>
            </div>
          </div>

          <div className="mt-20 max-w-xl">
            <p className="mb-3 inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              Demo frontend access
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white">Login karke admin control panel open karein.</h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
              Demo ID aur password already fill hai, sirf Login button dabate hi Super Admin page par UI preview khul jayega.
            </p>
          </div>

          <div className="absolute bottom-8 left-8 right-8 grid gap-3 md:grid-cols-3">
            {["Role access", "User creation", "Audit control"].map((item) => (
              <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4" key={item}>
                <BadgeCheck className="mb-3 text-primary" size={18} />
                <p className="text-sm font-bold text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Zap size={18} fill="currentColor" />
              </div>
              <div>
                <p className="font-semibold text-white">Vaiket CRM</p>
                <p className="text-xs text-muted-foreground">Demo login</p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <ShieldCheck size={23} />
            </div>
            <h2 className="text-2xl font-semibold text-white">CRM Login</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Supabase Auth ke through role-wise workspace open hoga.</p>
          </div>

          <LoginForm nextPath={nextPath} />
        </div>
      </section>
    </main>
  );
}
