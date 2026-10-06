import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLeagueData } from "@/lib/leagueData";
import ScoreLine from "@/components/ScoreLine";

export default async function HomePage() {
  const data = await getLeagueData();
  const { settings, season, activeTeams, standings, playerStats, activePlayers } = data;

  const [recentMatches, latestMotms, latestAnnouncements, featuredPlayer, featuredTeam, latestResults] = await Promise.all([
    prisma.match.findMany({ where: { status: "COMPLETED" }, orderBy: { date: "desc" }, take: 4, include: { teamA: true, teamB: true } }),
    prisma.matchMotm.findMany({ orderBy: { match: { date: "desc" } }, take: 3, include: { player: true, match: { include: { teamA: true, teamB: true } } } }),
    settings.showAnnouncements ? prisma.announcement.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { date: "desc" }], take: 3 }) : Promise.resolve([]),
    settings.featuredPlayerId ? prisma.player.findUnique({ where: { id: settings.featuredPlayerId }, include: { team: true } }) : Promise.resolve(null),
    settings.featuredTeamId ? prisma.team.findUnique({ where: { id: settings.featuredTeamId } }) : Promise.resolve(null),
    prisma.match.findMany({ where: { status: "COMPLETED" }, orderBy: { date: "desc" }, take: 4, include: { teamA: true, teamB: true } }),
  ]);

  const teamNameById = new Map(activeTeams.map((t) => [t.id, t.name]));
  const nameOf = (id: string) => activePlayers.find((p) => p.id === id)?.name ?? "—";
  const topScorers = [...playerStats.values()].sort((a, b) => b.goals - a.goals).slice(0, 5);

  return (
    <div>
      <section className="border-b border-chalk/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-12">
          <p className="text-xs font-semibold tracking-widest text-green-lunch mb-3 uppercase">{settings.currentSeasonLabel}{season && ` · ${season.name}`}</p>
          <h1 className="font-display font-extrabold tracking-tight text-3xl sm:text-4xl">{settings.heroTitle}</h1>
          <p className="text-base sm:text-lg text-chalk/60 mt-2">{settings.heroSubtitle}</p>

          {settings.announcementBanner && (
            <div className="mt-5 flex items-center gap-2 border border-chalk/10 bg-chalk/[0.02] rounded-md px-4 py-2.5 text-sm text-chalk/80 max-w-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-green-lunch flex-shrink-0" />{settings.announcementBanner}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/standings" className="btn-primary">View Standings</Link>
            <Link href="/matches" className="btn-secondary">View Matches</Link>
            <Link href="/2v2" className="btn-secondary">2v2 League</Link>
          </div>
        </div>
      </section>

      {latestResults.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl font-extrabold">Latest results</h2>
            <Link href="/matches" className="text-sm text-green-lunch font-semibold">All matches →</Link>
          </div>
          <div className="space-y-3">
            {latestResults.map((m) => <ScoreLine key={m.id} id={m.id} teamAName={m.teamA.name} teamBName={m.teamB.name} scoreA={m.scoreA} scoreB={m.scoreB} status={m.status} meta={new Date(m.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })} />)}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl font-extrabold">Current standings</h2>
          <Link href="/standings" className="text-sm text-green-lunch font-semibold">Full table →</Link>
        </div>
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead><tr className="border-b border-chalk/10 text-left label"><th className="px-4 py-3">#</th><th className="px-4 py-3">Team</th><th className="px-4 py-3 text-right">P</th><th className="px-4 py-3 text-right">GD</th><th className="px-4 py-3 text-right">Pts</th></tr></thead>
            <tbody>
              {standings.map((r, i) => (
                <tr key={r.teamId} className="border-b border-chalk/10 last:border-0">
                  <td className="px-4 py-3 scoreboard-digit font-bold">{i + 1}</td>
                  <td className="px-4 py-3 font-medium"><Link href={`/teams/${r.teamId}`} className="hover:text-green-lunch">{teamNameById.get(r.teamId)}</Link></td>
                  <td className="px-4 py-3 text-right">{r.played}</td>
                  <td className="px-4 py-3 text-right">{r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}</td>
                  <td className="px-4 py-3 text-right font-extrabold scoreboard-digit">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-baseline justify-between mb-4"><h2 className="font-display text-xl font-extrabold">Top scorers</h2><Link href="/top-scorers" className="text-sm text-green-lunch font-semibold">Full list →</Link></div>
          <div className="panel divide-y divide-chalk/10">
            {topScorers.length === 0 && <p className="p-4 text-sm text-chalk/50">No goals recorded yet.</p>}
            {topScorers.map((p, i) => (
              <Link key={p.playerId} href={`/players/${p.playerId}`} className="p-3 flex items-center justify-between text-sm hover:text-green-lunch">
                <span><span className="scoreboard-digit text-chalk/40 mr-2">{i + 1}</span>{nameOf(p.playerId)}</span>
                <span className="scoreboard-digit font-bold">{p.goals}</span>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between mb-4"><h2 className="font-display text-xl font-extrabold">Latest MOTM</h2><Link href="/motm" className="text-sm text-green-lunch font-semibold">Full history →</Link></div>
          <div className="panel divide-y divide-chalk/10">
            {latestMotms.length === 0 && <p className="p-4 text-sm text-chalk/50">No MOTMs recorded yet.</p>}
            {latestMotms.map((m) => (
              <div key={m.id} className="p-3 text-sm">
                <div className="font-medium text-gold">{m.player.name}</div>
                <div className="text-xs text-chalk/40">{m.match.teamA.name} v {m.match.teamB.name} · {new Date(m.match.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {(featuredPlayer || featuredTeam) && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid sm:grid-cols-2 gap-4">
          {featuredPlayer && (
            <Link href={`/players/${featuredPlayer.id}`} className="panel p-6 pitch-texture hover:border-green-lunch/40 transition-colors">
              <div className="label text-green-lunch">Featured player</div>
              <div className="font-display text-2xl font-extrabold mt-1">{featuredPlayer.name}</div>
              {featuredPlayer.team && <div className="text-sm text-chalk/50 mt-1">{featuredPlayer.team.name}</div>}
            </Link>
          )}
          {featuredTeam && (
            <Link href={`/teams/${featuredTeam.id}`} className="panel p-6 pitch-texture hover:border-green-lunch/40 transition-colors">
              <div className="label text-green-lunch">Featured team</div>
              <div className="font-display text-2xl font-extrabold mt-1">{featuredTeam.name}</div>
            </Link>
          )}
        </section>
      )}

      {settings.showAnnouncements && latestAnnouncements.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <div className="flex items-baseline justify-between mb-4"><h2 className="font-display text-2xl font-extrabold">Announcements</h2><Link href="/announcements" className="text-sm text-green-lunch font-semibold">All news →</Link></div>
          <div className="grid sm:grid-cols-3 gap-4">
            {latestAnnouncements.map((a) => (
              <div key={a.id} className="panel p-4">
                <div className="font-display font-bold">{a.title}</div>
                <p className="text-sm text-chalk/50 mt-1.5 line-clamp-3">{a.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
