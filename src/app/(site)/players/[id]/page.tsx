import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLeagueData } from "@/lib/leagueData";
import ScoreLine from "@/components/ScoreLine";

export default async function PlayerDetailPage({ params }: { params: { id: string } }) {
  const [player, data, motms, awards, achievements] = await Promise.all([
    prisma.player.findUnique({ where: { id: params.id }, include: { team: true } }),
    getLeagueData(),
    prisma.matchMotm.findMany({ where: { playerId: params.id }, include: { match: { include: { teamA: true, teamB: true } } }, orderBy: { match: { date: "desc" } } }),
    prisma.award.findMany({ where: { playerId: params.id }, orderBy: { date: "desc" } }),
    prisma.playerAchievement.findMany({ where: { playerId: params.id }, include: { achievement: true } }),
  ]);
  if (!player) notFound();

  const stats = data.playerStats.get(player.id);
  const teamNameById = new Map(data.activeTeams.map((t) => [t.id, t.name]));
  const recentMatches = player.teamId ? data.matches.filter((m) => m.teamAId === player.teamId || m.teamBId === player.teamId).slice(-6).reverse() : [];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <Link href="/players" className="text-sm text-chalk/50 hover:text-chalk">‹ Back to players</Link>
      <div className="mt-4 panel p-6 sm:p-8 pitch-texture flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-chalk/10 flex items-center justify-center font-display font-extrabold text-3xl flex-shrink-0">{player.name.charAt(0)}</div>
        <div>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold">{player.name}</h1>
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-chalk/60">
            {player.team && <Link href={`/teams/${player.team.id}`} className="text-green-lunch font-semibold hover:underline">{player.team.name}</Link>}
            {player.position && <span>{player.position}</span>}
            {player.ltfbId && <span>Player ID: {player.ltfbId}</span>}
          </div>
          {player.bio && <p className="text-chalk/50 mt-2 text-sm max-w-xl">{player.bio}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {[
          { label: "Appearances", value: stats?.appearances ?? 0 }, { label: "Goals", value: stats?.goals ?? 0 },
          { label: "Assists", value: stats?.assists ?? 0 }, { label: "MOTMs", value: stats?.motms ?? 0 },
        ].map((s) => <div key={s.label} className="panel p-4"><div className="label">{s.label}</div><div className="scoreboard-digit font-display text-2xl font-extrabold mt-1">{s.value}</div></div>)}
      </div>

      {achievements.length > 0 && (
        <div className="mt-8"><h2 className="font-display text-xl font-bold mb-3">Achievements</h2>
          <div className="flex flex-wrap gap-2">{achievements.map((a) => <span key={a.id} className="inline-flex items-center gap-1.5 bg-chalk/10 rounded-full px-3 py-1.5 text-sm">{a.achievement.icon} {a.achievement.name}</span>)}</div>
        </div>
      )}

      {awards.length > 0 && (
        <div className="mt-8"><h2 className="font-display text-xl font-bold mb-3">Awards</h2>
          <div className="grid sm:grid-cols-2 gap-3">{awards.map((a) => <div key={a.id} className="panel p-4 border-l-2 border-l-gold"><div className="font-display font-bold gold-text">{a.name}</div>{a.category && <div className="text-xs text-chalk/40 mt-0.5">{a.category}</div>}</div>)}</div>
        </div>
      )}

      {motms.length > 0 && (
        <div className="mt-8"><h2 className="font-display text-xl font-bold mb-3">MOTM history</h2>
          <div className="panel divide-y divide-chalk/10">{motms.map((m) => <div key={m.id} className="p-3 text-sm flex items-center justify-between"><span>{m.match.teamA.name} v {m.match.teamB.name}</span><span className="text-chalk/40 text-xs">{new Date(m.match.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span></div>)}</div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-display text-xl font-bold mb-3">Recent matches</h2>
        <div className="space-y-3">
          {recentMatches.length === 0 && <p className="text-chalk/50 text-sm">No matches played yet.</p>}
          {recentMatches.map((m) => <ScoreLine key={m.id} id={m.id} teamAName={teamNameById.get(m.teamAId) ?? "Unknown"} teamBName={teamNameById.get(m.teamBId) ?? "Unknown"} scoreA={m.scoreA} scoreB={m.scoreB} status={m.status} meta={new Date(m.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })} />)}
        </div>
      </div>
    </div>
  );
}
