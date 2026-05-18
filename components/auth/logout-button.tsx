"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenuItem
      onSelect={(event) => {
        event.preventDefault();
        startTransition(async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.replace("/login");
          router.refresh();
        });
      }}
    >
      <LogOut className="mr-2 h-4 w-4" /> {isPending ? "Logging out..." : "Logout"}
    </DropdownMenuItem>
  );
}
