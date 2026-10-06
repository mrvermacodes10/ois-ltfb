import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/data";

export default async function AwardsPage() {
  const settings = await getSettings();
  if (!settings.showAwards) notFound();

  const awards = await prisma.award.findMany({ include: { player: true, team: true, season: true }, orderBy: [{ date: "desc" }] });
  const byCategory = new Map<string, typeof awards>();
  for (const a of awards) {
    const key = a.category ?? "Other awards";
    byCategory.set(key, [...(byCategory.get(key) ?? []), a]);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Awards</h1>
      <p className="text-chalk/50 mt-2">Every LTFB award — including the real Semester Award categories.</p>
      {awards.length === 0 ? <div className="panel p-8 text-center text-chalk/50 mt-8">No awards yet.</div> : (
        <div className="mt-8 space-y-8">
          {[...byCategory.entries()].map(([category, list]) => (
            <div key={category}>
              <h2 className="font-display text-xl font-bold mb-3">{category.toUpperCase()}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((a) => (
                  <div key={a.id} className="panel p-5 border-l-2 border-l-gold">
                    <div className="font-display font-bold gold-text">{a.name}</div>
                    <div className="text-sm text-chalk/70 mt-1">
                      {a.player ? <Link href={`/players/${a.playerId}`} className="hover:text-green-lunch">{a.player.name}</Link>
                        : a.team ? <Link href={`/teams/${a.teamId}`} className="hover:text-green-lunch">{a.team.name}</Link>
                        : <span className="text-chalk/40">TBD</span>}
                    </div>
                    {a.description && <p className="text-sm text-chalk/50 mt-2">{a.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
