import Link from "next/link";
import { getLeagueData } from "@/lib/leagueData";

export default async function PlayersPage() {
  const { activePlayers, playerStats } = await getLeagueData();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Players</h1>
      <p className="text-chalk/50 mt-2">All registered LTFB players.</p>
      {activePlayers.length === 0 ? <div className="panel p-8 text-center text-chalk/50 mt-8">No players yet.</div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {activePlayers.map((p) => {
            const stats = playerStats.get(p.id);
            return (
              <Link key={p.id} href={`/players/${p.id}`} className="panel p-5 hover:border-green-lunch/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-chalk/10 flex items-center justify-center font-display font-extrabold text-lg">{p.name.charAt(0)}</div>
                  <div><div className="font-display font-bold">{p.name}</div><div className="text-xs text-chalk/40">{p.team?.name ?? "Unassigned"}{p.ltfbId && ` · ID ${p.ltfbId}`}</div></div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div><div className="scoreboard-digit font-extrabold">{stats?.goals ?? 0}</div><div className="text-[10px] text-chalk/40 uppercase">Goals</div></div>
                  <div><div className="scoreboard-digit font-extrabold">{stats?.assists ?? 0}</div><div className="text-[10px] text-chalk/40 uppercase">Assists</div></div>
                  <div><div className="scoreboard-digit font-extrabold text-gold">{stats?.motms ?? 0}</div><div className="text-[10px] text-chalk/40 uppercase">MOTMs</div></div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
