import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/data";
import { computePairRecords } from "@/lib/stats";

export default async function TwoVTwoPage() {
  const settings = await getSettings();
  if (!settings.show2v2) notFound();

  const [pairs, results, records] = await Promise.all([
    prisma.twoVTwoPair.findMany({ where: { active: true }, include: { player1: true, player2: true } }),
    prisma.twoVTwoResult.findMany({ include: { winningPair: { include: { player1: true, player2: true } }, opponentPair: { include: { player1: true, player2: true } }, mvpPlayer: true }, orderBy: { date: "desc" } }),
    computePairRecords(),
  ]);

  function pairLabel(p: { name: string | null; player1: { name: string }; player2: { name: string } }) {
    return p.name ?? `${p.player1.name} & ${p.player2.name}`;
  }

  const leaderboard = pairs
    .map((p) => ({ pair: p, record: records.get(p.id) }))
    .filter((x) => x.record)
    .sort((a, b) => (b.record?.totalDailyWins ?? 0) - (a.record?.totalDailyWins ?? 0));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">2v2 League</h1>
      <p className="text-chalk/50 mt-2">A real lunchtime 2v2 competition — not fantasy football.</p>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold mb-3">Current pairs</h2>
        {pairs.length === 0 ? <div className="panel p-6 text-center text-sm text-chalk/50">No pairs yet.</div> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pairs.map((p) => {
              const r = records.get(p.id);
              return (
                <div key={p.id} className="panel p-4">
                  <div className="font-display font-bold">{pairLabel(p)}</div>
                  <div className="text-xs text-chalk/50 mt-0.5">{p.player1.name} &amp; {p.player2.name}</div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div><div className="scoreboard-digit font-extrabold">{r?.totalDailyWins ?? 0}</div><div className="text-[9px] text-chalk/40 uppercase">Daily wins</div></div>
                    <div><div className="scoreboard-digit font-extrabold">{r?.winPercent ?? 0}%</div><div className="text-[9px] text-chalk/40 uppercase">Win %</div></div>
                    <div><div className="scoreboard-digit font-extrabold text-green-lunch">{r?.currentStreak ?? 0}</div><div className="text-[9px] text-chalk/40 uppercase">Streak</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {leaderboard.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-3">Most daily wins</h2>
          <div className="panel divide-y divide-chalk/10">
            {leaderboard.map((x, i) => (
              <div key={x.pair.id} className="p-3 flex items-center justify-between text-sm">
                <span><span className="scoreboard-digit text-chalk/40 mr-2">{i + 1}</span>{pairLabel(x.pair)}</span>
                <span className="scoreboard-digit font-bold text-gold">{x.record?.totalDailyWins}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold mb-3">Daily winners</h2>
        {results.length === 0 ? <div className="panel p-6 text-center text-sm text-chalk/50">No results yet.</div> : (
          <div className="space-y-3">
            {results.map((r) => (
              <div key={r.id} className="panel p-4">
                <div className="text-xs text-chalk/50 uppercase tracking-wide">{new Date(r.date).toLocaleDateString(undefined, { day: "numeric", month: "long" })}</div>
                <div className="font-display text-lg font-extrabold mt-1">{pairLabel(r.winningPair)}</div>
                <div className="text-sm text-chalk/50 mt-0.5">
                  WINNERS
                  {r.opponentPair && <span> · beat {pairLabel(r.opponentPair)}</span>}
                  {r.scoreNote && <span> · {r.scoreNote}</span>}
                </div>
                {r.mvpPlayer && <div className="text-xs text-gold mt-1">MVP: {r.mvpPlayer.name}</div>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
