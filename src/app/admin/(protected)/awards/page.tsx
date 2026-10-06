import { prisma } from "@/lib/prisma";
import AwardsAdmin from "@/components/admin/AwardsAdmin";

export default async function AdminAwardsPage() {
  const [awards, players, teams, seasons] = await Promise.all([
    prisma.award.findMany({ include: { player: true, team: true }, orderBy: { date: "desc" } }),
    prisma.player.findMany({ orderBy: { name: "asc" } }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.season.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  return (
    <AwardsAdmin
      players={players.map((p) => ({ id: p.id, name: p.name }))}
      teams={teams.map((t) => ({ id: t.id, name: t.name }))}
      seasons={seasons.map((s) => ({ id: s.id, name: s.name }))}
      awards={awards.map((a) => ({
        id: a.id, name: a.name, category: a.category, description: a.description,
        playerId: a.playerId, playerName: a.player?.name ?? null, teamId: a.teamId, teamName: a.team?.name ?? null,
        date: a.date.toISOString(),
      }))}
    />
  );
}
