import Link from "next/link";
import { getLeagueData } from "@/lib/leagueData";

export default async function TopScorersPage() {
  const { playerStats, activePlayers } = await getLeagueData();
  const nameOf = (id: string) => activePlayers.find((p) => p.id === id)?.name ?? "—";
  const teamOf = (id: string) => activePlayers.find((p) => p.id === id)?.team?.name ?? "—";
  const rows = [...playerStats.values()].sort((a, b) => b.goals - a.goals || b.assists - a.assists);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Top Scorers</h1>
      <p className="text-chalk/50 mt-2">Goals and assists, calculated live from match data.</p>
      <div className="panel overflow-x-auto mt-8">
        <table className="w-full text-sm min-w-[600px]">
          <thead><tr className="border-b border-chalk/10 text-left label"><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Player</th><th className="px-4 py-3">Team</th><th className="px-4 py-3 text-right">Goals</th><th className="px-4 py-3 text-right">Assists</th><th className="px-4 py-3 text-right">Apps</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-chalk/50">No goals recorded yet.</td></tr>}
            {rows.map((p, i) => (
              <tr key={p.playerId} className="border-b border-chalk/10 last:border-0">
                <td className="px-4 py-3 scoreboard-digit font-bold">{i + 1}</td>
                <td className="px-4 py-3 font-medium"><Link href={`/players/${p.playerId}`} className="hover:text-green-lunch">{nameOf(p.playerId)}</Link></td>
                <td className="px-4 py-3 text-chalk/50">{teamOf(p.playerId)}</td>
                <td className="px-4 py-3 text-right font-extrabold scoreboard-digit">{p.goals}</td>
                <td className="px-4 py-3 text-right">{p.assists}</td>
                <td className="px-4 py-3 text-right">{p.appearances}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
