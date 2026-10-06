import { prisma } from "@/lib/prisma";
import SeasonsAdmin from "@/components/admin/SeasonsAdmin";

export default async function AdminSeasonsPage() {
  const seasons = await prisma.season.findMany({ include: { _count: { select: { matches: true } } }, orderBy: { createdAt: "desc" } });
  return <SeasonsAdmin seasons={seasons.map((s) => ({ id: s.id, name: s.name, isCurrent: s.isCurrent, matchCount: s._count.matches }))} />;
}
