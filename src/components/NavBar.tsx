"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const BASE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/teams", label: "Teams" },
  { href: "/players", label: "Players" },
  { href: "/matches", label: "Matches" },
  { href: "/standings", label: "Standings" },
  { href: "/top-scorers", label: "Top Scorers" },
  { href: "/motm", label: "MOTM" },
];

export default function NavBar({ leagueShortName, visibility }: { leagueShortName: string; visibility: { showAwards: boolean; showHistory: boolean; show2v2: boolean; showAnnouncements: boolean }; }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    ...BASE_LINKS,
    ...(visibility.show2v2 ? [{ href: "/2v2", label: "2v2 League" }] : []),
    ...(visibility.showAwards ? [{ href: "/awards", label: "Awards" }] : []),
    ...(visibility.showAnnouncements ? [{ href: "/announcements", label: "News" }] : []),
    ...(visibility.showHistory ? [{ href: "/history", label: "History" }] : []),
    { href: "/player-id", label: "Player ID" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-pitch-black border-b border-chalk/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-extrabold tracking-tight text-sm sm:text-base">{leagueShortName.toUpperCase()}</Link>
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return <Link key={l.href} href={l.href} className={`px-3 py-2 rounded-full text-sm font-semibold transition-colors ${active ? "bg-green-lunch text-pitch-black" : "text-chalk/70 hover:text-chalk"}`}>{l.label}</Link>;
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/admin/login" className="hidden sm:inline-flex btn-secondary text-xs py-1.5 px-3">Admin</Link>
          <button onClick={() => setOpen((v) => !v)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-chalk/15" aria-label="Open menu">
            <div className="space-y-1"><div className="w-4 h-0.5 bg-chalk" /><div className="w-4 h-0.5 bg-chalk" /><div className="w-4 h-0.5 bg-chalk" /></div>
          </button>
        </div>
      </div>
      {open && (
        <nav className="lg:hidden border-t border-chalk/10 px-4 py-3 flex flex-col gap-1 bg-pitch-black">
          {links.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`px-3 py-2.5 rounded-lg text-sm font-semibold ${pathname === l.href ? "bg-green-lunch text-pitch-black" : "text-chalk/80"}`}>{l.label}</Link>)}
          <Link href="/admin/login" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-semibold text-chalk/60">Admin</Link>
        </nav>
      )}
    </header>
  );
}
