import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function MotmPage() {
  const motms = await prisma.matchMotm.findMany({
    include: { player: true, match: { include: { teamA: true, teamB: true } } },
    orderBy: { match: { date: "desc" } },
  });

  const countByPlayer = new Map<string, { id: string; name: string; count: number }>();
  for (const m of motms) {
    const cur = countByPlayer.get(m.playerId) ?? { id: m.playerId, name: m.player.name, count: 0 };
    cur.count++;
    countByPlayer.set(m.playerId, cur);
  }
  const leaderboard = [...countByPlayer.values()].sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Man of the Match</h1>
      <p className="text-chalk/50 mt-2">Every MOTM, and who's won the most.</p>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <div>
          <h2 className="font-display text-xl font-bold mb-3">Most MOTMs</h2>
          <div className="panel divide-y divide-chalk/10">
            {leaderboard.length === 0 && <p className="p-4 text-sm text-chalk/50">No MOTMs recorded yet.</p>}
            {leaderboard.map((l, i) => (
              <Link key={l.id} href={`/players/${l.id}`} className="p-3 flex items-center justify-between text-sm hover:text-green-lunch">
                <span><span className="scoreboard-digit text-chalk/40 mr-2">{i + 1}</span>{l.name}</span>
                <span className="scoreboard-digit font-bold text-gold">{l.count}</span>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-xl font-bold mb-3">Full history</h2>
          <div className="panel divide-y divide-chalk/10 max-h-[560px] overflow-y-auto">
            {motms.length === 0 && <p className="p-4 text-sm text-chalk/50">None yet.</p>}
            {motms.map((m) => (
              <Link key={m.id} href={`/matches/${m.matchId}`} className="p-3 text-sm flex items-center justify-between hover:text-green-lunch">
                <span className="text-xs text-chalk/50">{new Date(m.match.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
                <span className="font-medium text-gold">{m.player.name}</span>
                <span className="text-xs text-chalk/40">{m.match.teamA.name} v {m.match.teamB.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
