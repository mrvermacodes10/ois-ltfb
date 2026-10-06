import { prisma } from "@/lib/prisma";
import MatchesAdmin from "@/components/admin/MatchesAdmin";

export default async function AdminMatchesPage() {
  const [matches, teams, seasons, players] = await Promise.all([
    prisma.match.findMany({
      include: { teamA: true, teamB: true, events: true, motms: true },
      orderBy: { date: "desc" },
    }),
    prisma.team.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.season.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.player.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <MatchesAdmin
      teams={teams.map((t) => ({ id: t.id, name: t.name }))}
      seasons={seasons.map((s) => ({ id: s.id, name: s.name }))}
      players={players.map((p) => ({ id: p.id, name: p.name, teamId: p.teamId }))}
      matches={matches.map((m) => {
        const goalCounts: Record<string, number> = {};
        const assistCounts: Record<string, number> = {};
        for (const e of m.events) {
          if (!e.playerId) continue;
          if (e.type === "GOAL") goalCounts[e.playerId] = (goalCounts[e.playerId] ?? 0) + 1;
          if (e.type === "ASSIST") assistCounts[e.playerId] = (assistCounts[e.playerId] ?? 0) + 1;
        }
        return {
          id: m.id,
          teamAId: m.teamAId,
          teamBId: m.teamBId,
          teamAName: m.teamA.name,
          teamBName: m.teamB.name,
          scoreA: m.scoreA,
          scoreB: m.scoreB,
          status: m.status,
          date: m.date.toISOString(),
          time: m.time,
          notes: m.notes,
          goalCounts,
          assistCounts,
          motmIds: m.motms.map((mo) => mo.playerId),
        };
      })}
    />
  );
}
