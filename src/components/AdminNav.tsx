"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/players", label: "Players" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/matches", label: "Matches" },
  { href: "/admin/motm", label: "MOTMs" },
  { href: "/admin/awards", label: "Awards" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/2v2", label: "2v2 League" },
  { href: "/admin/seasons", label: "Seasons" },
  { href: "/admin/activity", label: "Activity log" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav({ username }: { username: string }) {
  const pathname = usePathname();
  return (
    <aside className="w-full sm:w-56 sm:min-h-screen bg-[#0A0D0B] border-r border-chalk/10 sm:sticky sm:top-0 sm:self-start flex sm:flex-col">
      <div className="p-5 hidden sm:block">
        <div className="font-display font-extrabold tracking-tight">LTFB ADMIN</div>
        <div className="text-xs text-chalk/50 mt-0.5">Signed in as {username}</div>
      </div>
      <nav className="flex sm:flex-col gap-1 p-3 overflow-x-auto sm:overflow-visible flex-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-green-lunch text-pitch-black" : "text-chalk/70 hover:bg-chalk/10 hover:text-chalk"}`}>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAction} className="p-3 hidden sm:block">
        <button className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-chalk/60 hover:bg-chalk/10 hover:text-chalk transition-colors">Sign out</button>
      </form>
    </aside>
  );
}
