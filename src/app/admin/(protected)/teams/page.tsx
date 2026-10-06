import { prisma } from "@/lib/prisma";
import TeamsAdmin from "@/components/admin/TeamsAdmin";

export default async function AdminTeamsPage() {
  const teams = await prisma.team.findMany({ include: { _count: { select: { players: true } } }, orderBy: { name: "asc" } });
  return <TeamsAdmin teams={teams.map((t) => ({ id: t.id, name: t.name, logoUrl: t.logoUrl, description: t.description, active: t.active, playerCount: t._count.players }))} />;
}
