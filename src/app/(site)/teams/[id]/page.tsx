import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLeagueData } from "@/lib/leagueData";
import ScoreLine from "@/components/ScoreLine";

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  const [team, data] = await Promise.all([
    prisma.team.findUnique({ where: { id: params.id }, include: { players: { where: { active: true }, orderBy: { name: "asc" } } } }),
    getLeagueData(),
  ]);
  if (!team) notFound();

  const record = data.standings.find((s) => s.teamId === team.id);
  const teamMatches = data.matches.filter((m) => m.teamAId === team.id || m.teamBId === team.id);
  const teamNameById = new Map(data.activeTeams.map((t) => [t.id, t.name]));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <Link href="/teams" className="text-sm text-chalk/50 hover:text-chalk">‹ Back to teams</Link>
      <div className="mt-4 panel p-6 sm:p-8 pitch-texture">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold">{team.name}</h1>
        {team.description && <p className="text-chalk/50 mt-3 max-w-xl">{team.description}</p>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {[
          { label: "Played", value: record?.played ?? 0 }, { label: "Won", value: record?.wins ?? 0 },
          { label: "Drawn", value: record?.draws ?? 0 }, { label: "Lost", value: record?.losses ?? 0 },
          { label: "Goals for", value: record?.goalsFor ?? 0 }, { label: "Goals against", value: record?.goalsAgainst ?? 0 },
          { label: "Goal difference", value: record?.goalDiff ?? 0 }, { label: "Points", value: record?.points ?? 0 },
        ].map((s) => (
          <div key={s.label} className="panel p-4"><div className="label">{s.label}</div><div className="scoreboard-digit font-display text-2xl font-extrabold mt-1">{s.value}</div></div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-xl font-bold mb-3">Squad</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {team.players.length === 0 && <p className="text-sm text-chalk/50">No players assigned yet.</p>}
          {team.players.map((p) => (
            <Link key={p.id} href={`/players/${p.id}`} className="panel p-3 text-sm font-medium hover:text-green-lunch">{p.name}</Link>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-xl font-bold mb-3">Match history</h2>
        <div className="space-y-3">
          {teamMatches.length === 0 && <p className="text-sm text-chalk/50">No matches played yet.</p>}
          {[...teamMatches].reverse().map((m) => (
            <ScoreLine key={m.id} id={m.id} teamAName={teamNameById.get(m.teamAId) ?? "Unknown"} teamBName={teamNameById.get(m.teamBId) ?? "Unknown"} scoreA={m.scoreA} scoreB={m.scoreB} status={m.status} meta={new Date(m.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })} />
          ))}
        </div>
      </div>
    </div>
  );
}
