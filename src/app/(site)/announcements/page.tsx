import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/data";

export default async function AnnouncementsPage() {
  const settings = await getSettings();
  if (!settings.showAnnouncements) notFound();

  const announcements = await prisma.announcement.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { date: "desc" }] });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">News &amp; Announcements</h1>
      {announcements.length === 0 ? <div className="panel p-8 text-center text-chalk/50 mt-8">No announcements yet.</div> : (
        <div className="mt-8 space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className={`panel p-6 ${a.featured ? "border-green-lunch/30" : ""}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-xl font-bold">{a.title}</h2>
                {a.featured && <span className="badge-status bg-green-lunch/15 text-green-lunch">FEATURED</span>}
              </div>
              <p className="text-xs text-chalk/40 mt-1">{new Date(a.date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</p>
              <p className="text-chalk/70 mt-3 whitespace-pre-wrap">{a.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
