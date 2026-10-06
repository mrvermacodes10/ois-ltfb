import Link from "next/link";
import { getLeagueData } from "@/lib/leagueData";

export default async function StandingsPage() {
  const { standings, activeTeams, settings } = await getLeagueData();
  const teamNameById = new Map(activeTeams.map((t) => [t.id, t.name]));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Standings</h1>
      <p className="text-chalk/50 mt-2">{settings.pointsForWin} points for a win · {settings.pointsForDraw} for a draw · {settings.pointsForLoss} for a loss.</p>
      <div className="panel overflow-x-auto mt-8">
        <table className="w-full text-sm min-w-[720px]">
          <thead><tr className="border-b border-chalk/10 text-left label">
            <th className="px-4 py-3">Position</th><th className="px-4 py-3">Team</th><th className="px-4 py-3 text-right">P</th><th className="px-4 py-3 text-right">W</th>
            <th className="px-4 py-3 text-right">D</th><th className="px-4 py-3 text-right">L</th><th className="px-4 py-3 text-right">GF</th><th className="px-4 py-3 text-right">GA</th>
            <th className="px-4 py-3 text-right">GD</th><th className="px-4 py-3 text-right">Pts</th>
          </tr></thead>
          <tbody>
            {standings.length === 0 && <tr><td colSpan={10} className="px-4 py-10 text-center text-chalk/50">No results recorded yet.</td></tr>}
            {standings.map((r, i) => (
              <tr key={r.teamId} className={`border-b border-chalk/10 last:border-0 ${i === 0 ? "bg-gold/5" : ""}`}>
                <td className="px-4 py-3"><span className={`scoreboard-digit font-extrabold ${i === 0 ? "gold-text" : ""}`}>{i + 1}</span></td>
                <td className="px-4 py-3 font-medium"><Link href={`/teams/${r.teamId}`} className="hover:text-green-lunch">{teamNameById.get(r.teamId)}</Link></td>
                <td className="px-4 py-3 text-right">{r.played}</td><td className="px-4 py-3 text-right text-green-lunch">{r.wins}</td>
                <td className="px-4 py-3 text-right">{r.draws}</td><td className="px-4 py-3 text-right text-red-400">{r.losses}</td>
                <td className="px-4 py-3 text-right">{r.goalsFor}</td><td className="px-4 py-3 text-right">{r.goalsAgainst}</td>
                <td className="px-4 py-3 text-right">{r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}</td>
                <td className="px-4 py-3 text-right font-extrabold scoreboard-digit">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
