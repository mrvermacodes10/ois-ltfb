import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/data";

export default async function HistoryPage() {
  const settings = await getSettings();
  if (!settings.showHistory) notFound();

  const seasons = await prisma.season.findMany({
    include: {
      matches: { include: { teamA: true, teamB: true }, orderBy: { date: "desc" } },
      awards: { include: { player: true, team: true } },
      twoVTwoResults: { include: { winningPair: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">History</h1>
      <p className="text-chalk/50 mt-2">The full LTFB archive, by season. Starting a new season never deletes what came before.</p>

      {seasons.length === 0 ? <div className="panel p-8 text-center text-chalk/50 mt-8">No seasons recorded yet.</div> : (
        <div className="mt-8 space-y-6">
          {seasons.map((s) => {
            const completed = s.matches.filter((m) => m.status === "COMPLETED");
            return (
              <div key={s.id} className="panel p-5 sm:p-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="font-display text-xl font-bold">{s.name}</h2>
                  {s.isCurrent && <span className="badge-status bg-green-lunch/15 text-green-lunch">CURRENT</span>}
                </div>
                <p className="text-xs text-chalk/40 mt-1">{completed.length} completed match{completed.length === 1 ? "" : "es"} · {s.awards.length} award{s.awards.length === 1 ? "" : "s"} · {s.twoVTwoResults.length} 2v2 result{s.twoVTwoResults.length === 1 ? "" : "s"}</p>

                {completed.length > 0 && (
                  <div className="mt-4">
                    <div className="label mb-2">Results</div>
                    <div className="space-y-1.5">
                      {completed.slice(0, 8).map((m) => (
                        <Link key={m.id} href={`/matches/${m.id}`} className="flex items-center justify-between text-sm hover:text-green-lunch">
                          <span>{m.teamA.name}</span><span className="scoreboard-digit font-bold">{m.scoreA} – {m.scoreB}</span><span>{m.teamB.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {s.awards.length > 0 && (
                  <div className="mt-4">
                    <div className="label mb-2">Awards</div>
                    <div className="flex flex-wrap gap-1.5">
                      {s.awards.map((a) => <span key={a.id} className="text-xs bg-chalk/10 rounded-full px-2.5 py-1">{a.name}: {a.player?.name ?? a.team?.name ?? "TBD"}</span>)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
