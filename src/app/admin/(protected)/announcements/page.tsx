import { prisma } from "@/lib/prisma";
import AnnouncementsAdmin from "@/components/admin/AnnouncementsAdmin";

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({ orderBy: { date: "desc" } });
  return <AnnouncementsAdmin announcements={announcements.map((a) => ({ ...a, date: a.date.toISOString() }))} />;
}
