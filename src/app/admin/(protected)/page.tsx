import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings, getCurrentSeason } from "@/lib/data";

export default async function AdminDashboard() {
  const [settings, season, playerCount, teamCount, recentMatches, recentAnnouncements, pairCount, recentResults, recentActivity] =
    await Promise.all([
      getSettings(),
      getCurrentSeason(),
      prisma.player.count({ where: { active: true } }),
      prisma.team.count({ where: { active: true } }),
      prisma.match.findMany({ orderBy: { date: "desc" }, take: 5, include: { teamA: true, teamB: true, motms: { include: { player: true } } } }),
      prisma.announcement.findMany({ orderBy: { date: "desc" }, take: 3 }),
      prisma.twoVTwoPair.count({ where: { active: true } }),
      prisma.twoVTwoResult.findMany({ orderBy: { date: "desc" }, take: 5, include: { winningPair: true } }),
      prisma.adminActivity.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    ]);

  const stats = [
    { label: "Current season", value: season?.name ?? "None set" },
    { label: "Active players", value: playerCount },
    { label: "Active teams", value: teamCount },
    { label: "Active 2v2 pairs", value: pairCount },
    { label: "Matches recorded", value: await prisma.match.count() },
    { label: "Announcements", value: await prisma.announcement.count({ where: { published: true } }) },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Dashboard</h1>
      <p className="text-sm text-chalk/50 mt-1">{settings.leagueName} ({settings.shortName}) · {settings.currentSeasonLabel}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {stats.map((s) => (
          <div key={s.label} className="panel p-4">
            <div className="label">{s.label}</div>
            <div className="mt-1 font-display text-2xl font-extrabold scoreboard-digit">{s.value}</div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-lg font-bold mt-8 mb-3">Quick actions</h2>
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/players" className="btn-secondary">+ Add player</Link>
        <Link href="/admin/teams" className="btn-secondary">+ Add team</Link>
        <Link href="/admin/matches" className="btn-primary">+ Add match / record result</Link>
        <Link href="/admin/awards" className="btn-secondary">+ Add award</Link>
        <Link href="/admin/announcements" className="btn-secondary">+ Post announcement</Link>
        <Link href="/admin/2v2" className="btn-secondary">+ Record 2v2 winner</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div>
          <h2 className="font-display text-lg font-bold mb-3">Recent matches &amp; MOTMs</h2>
          <div className="panel divide-y divide-chalk/10">
            {recentMatches.length === 0 && <p className="p-4 text-sm text-chalk/50">No matches yet.</p>}
            {recentMatches.map((m) => (
              <div key={m.id} className="p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>{m.teamA.name}</span>
                  <span className="scoreboard-digit font-bold text-green-lunch">{m.scoreA ?? "–"} – {m.scoreB ?? "–"}</span>
                  <span>{m.teamB.name}</span>
                </div>
                {m.motms.length > 0 && <div className="text-xs text-gold mt-1">MOTM: {m.motms.map((mo) => mo.player.name).join(", ")}</div>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold mb-3">Recent 2v2 winners</h2>
          <div className="panel divide-y divide-chalk/10">
            {recentResults.length === 0 && <p className="p-4 text-sm text-chalk/50">No 2v2 results yet.</p>}
            {recentResults.map((r) => (
              <div key={r.id} className="p-3 text-sm flex items-center justify-between">
                <span>{new Date(r.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
                <span className="font-medium">{r.winningPair.name ?? "Unnamed pair"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <h2 className="font-display text-lg font-bold mb-3">Recent announcements</h2>
          <div className="panel divide-y divide-chalk/10">
            {recentAnnouncements.length === 0 && <p className="p-4 text-sm text-chalk/50">No announcements yet.</p>}
            {recentAnnouncements.map((a) => (
              <div key={a.id} className="p-3 text-sm font-medium">{a.title}</div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold mb-3">Recent admin activity</h2>
          <div className="panel divide-y divide-chalk/10">
            {recentActivity.length === 0 && <p className="p-4 text-sm text-chalk/50">No activity yet.</p>}
            {recentActivity.map((a) => (
              <div key={a.id} className="p-3 text-sm">
                <span className="font-medium">{a.action}</span>
                {a.detail && <span className="text-chalk/50"> — {a.detail}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
