import { prisma } from "./prisma";
import { getSettings, getCurrentSeason } from "./data";
import { getCompletedMatches, computeStandings, getPlayerStatlines } from "./stats";

export async function getLeagueData() {
  const [settings, season, teams, players] = await Promise.all([
    getSettings(),
    getCurrentSeason(),
    prisma.team.findMany({ include: { players: true }, orderBy: { name: "asc" } }),
    prisma.player.findMany({ include: { team: true }, orderBy: { name: "asc" } }),
  ]);

  const activeTeams = teams.filter((t) => t.active);
  const activePlayers = players.filter((p) => p.active);

  const matches = await getCompletedMatches(season?.id);
  const standings = computeStandings(
    matches,
    activeTeams.map((t) => t.id),
    { win: settings.pointsForWin, draw: settings.pointsForDraw, loss: settings.pointsForLoss }
  );
  const playerStats = await getPlayerStatlines(season?.id);

  return { settings, season, teams, activeTeams, players, activePlayers, matches, standings, playerStats };
}

export type LeagueData = Awaited<ReturnType<typeof getLeagueData>>;
