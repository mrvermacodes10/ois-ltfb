import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/data";

export default async function PlayerIdPage() {
  const [settings, players] = await Promise.all([
    getSettings(),
    prisma.player.findMany({ where: { active: true, NOT: { ltfbId: null } }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Player ID</h1>
      <p className="text-chalk/50 mt-2">Registered under the OIS LTFB ID system.</p>

      {settings.playerIdInfo && (
        <div className="panel p-6 mt-6 whitespace-pre-wrap text-chalk/70 text-sm">{settings.playerIdInfo}</div>
      )}

      <div className="mt-8">
        <h2 className="font-display text-xl font-bold mb-3">Registered Player IDs</h2>
        <div className="panel divide-y divide-chalk/10">
          {players.length === 0 && <p className="p-4 text-sm text-chalk/50">No Player IDs on record yet — add them via Admin → Players.</p>}
          {players.map((p) => (
            <div key={p.id} className="p-3 flex items-center justify-between text-sm">
              <span className="font-medium">{p.name}</span>
              <span className="scoreboard-digit text-chalk/60">{p.ltfbId}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
