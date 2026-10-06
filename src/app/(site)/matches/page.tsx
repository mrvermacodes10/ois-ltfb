import { prisma } from "@/lib/prisma";
import { getCurrentSeason } from "@/lib/data";
import ScoreLine from "@/components/ScoreLine";

export default async function MatchesPage() {
  const season = await getCurrentSeason();
  const matches = await prisma.match.findMany({
    where: season ? { seasonId: season.id } : {},
    include: { teamA: true, teamB: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Matches</h1>
      <p className="text-chalk/50 mt-2">{season?.name ?? "All"} fixtures and results.</p>
      <div className="space-y-3 mt-8">
        {matches.length === 0 && <div className="panel p-6 text-center text-sm text-chalk/50">No matches yet.</div>}
        {matches.map((m) => (
          <ScoreLine key={m.id} id={m.id} teamAName={m.teamA.name} teamBName={m.teamB.name} scoreA={m.scoreA} scoreB={m.scoreB} status={m.status}
            meta={[new Date(m.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }), m.time].filter(Boolean).join(" · ")} />
        ))}
      </div>
    </div>
  );
}
