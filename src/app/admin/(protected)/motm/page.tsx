import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminMotmPage() {
  const motms = await prisma.matchMotm.findMany({
    include: { player: true, match: { include: { teamA: true, teamB: true } } },
    orderBy: { match: { date: "desc" } },
  });

  const countByPlayer = new Map<string, { name: string; count: number }>();
  for (const m of motms) {
    const cur = countByPlayer.get(m.playerId) ?? { name: m.player.name, count: 0 };
    cur.count++;
    countByPlayer.set(m.playerId, cur);
  }
  const leaderboard = [...countByPlayer.values()].sort((a, b) => b.count - a.count);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-1">MOTM history</h1>
      <p className="text-sm text-chalk/50 mb-6">
        To change a match's MOTM, open it from{" "}
        <Link href="/admin/matches" className="underline">Admin → Matches</Link> → "Goals / Assists / MOTM".
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-display text-lg font-bold mb-3">Most MOTMs</h2>
          <div className="panel divide-y divide-chalk/10">
            {leaderboard.length === 0 && <p className="p-4 text-sm text-chalk/50">No MOTMs recorded yet.</p>}
            {leaderboard.map((l, i) => (
              <div key={l.name} className="p-3 flex items-center justify-between text-sm">
                <span><span className="scoreboard-digit text-chalk/40 mr-2">{i + 1}</span>{l.name}</span>
                <span className="scoreboard-digit font-bold text-gold">{l.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold mb-3">All MOTM records</h2>
          <div className="panel divide-y divide-chalk/10 max-h-[480px] overflow-y-auto">
            {motms.length === 0 && <p className="p-4 text-sm text-chalk/50">None yet.</p>}
            {motms.map((m) => (
              <div key={m.id} className="p-3 text-sm flex items-center justify-between">
                <span className="text-chalk/50 text-xs">{new Date(m.match.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
                <span className="font-medium">{m.player.name}</span>
                <span className="text-chalk/40 text-xs">{m.match.teamA.name} v {m.match.teamB.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
