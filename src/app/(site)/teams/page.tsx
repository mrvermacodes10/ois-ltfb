import Link from "next/link";
import { getLeagueData } from "@/lib/leagueData";

export default async function TeamsPage() {
  const { activeTeams, standings } = await getLeagueData();
  const standingByTeam = new Map(standings.map((s) => [s.teamId, s]));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Teams</h1>
      <p className="text-chalk/50 mt-2">Every active LTFB team.</p>
      {activeTeams.length === 0 ? <div className="panel p-8 text-center text-chalk/50 mt-8">No teams yet.</div> : (
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          {activeTeams.map((t) => {
            const r = standingByTeam.get(t.id);
            return (
              <Link key={t.id} href={`/teams/${t.id}`} className="panel p-5 hover:border-green-lunch/40 transition-colors">
                <div className="font-display font-extrabold text-xl">{t.name}</div>
                <div className="text-sm text-chalk/50 mt-0.5">{t.players.length} player{t.players.length === 1 ? "" : "s"}</div>
                {r && (
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div><div className="scoreboard-digit font-extrabold text-lg">{r.played}</div><div className="text-[10px] text-chalk/40 uppercase">Played</div></div>
                    <div><div className="scoreboard-digit font-extrabold text-lg text-green-lunch">{r.wins}</div><div className="text-[10px] text-chalk/40 uppercase">Wins</div></div>
                    <div><div className="scoreboard-digit font-extrabold text-lg">{r.points}</div><div className="text-[10px] text-chalk/40 uppercase">Points</div></div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
