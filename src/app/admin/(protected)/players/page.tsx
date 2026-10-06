import { prisma } from "@/lib/prisma";
import PlayersAdmin from "@/components/admin/PlayersAdmin";

export default async function AdminPlayersPage() {
  const [players, teams] = await Promise.all([
    prisma.player.findMany({ include: { team: true }, orderBy: { name: "asc" } }),
    prisma.team.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <PlayersAdmin
      teams={teams.map((t) => ({ id: t.id, name: t.name }))}
      players={players.map((p) => ({
        id: p.id, name: p.name, ltfbId: p.ltfbId, position: p.position, photoUrl: p.photoUrl,
        bio: p.bio, active: p.active, teamId: p.teamId, teamName: p.team?.name ?? null,
      }))}
    />
  );
}
