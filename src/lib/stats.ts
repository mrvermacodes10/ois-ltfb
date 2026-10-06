import { prisma } from "./prisma";

// Nothing here is cached or stored redundantly — every function recomputes
// from Match/MatchEvent/MatchMotm/TwoVTwoResult rows every call. Editing a
// past result and re-rendering any page immediately reflects the change.

export async function getCompletedMatches(seasonId?: string) {
  return prisma.match.findMany({
    where: { status: "COMPLETED", scoreA: { not: null }, scoreB: { not: null }, seasonId },
    include: { teamA: true, teamB: true },
    orderBy: { date: "asc" },
  });
}

export type TeamRecord = {
  teamId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
};

function emptyTeamRecord(teamId: string): TeamRecord {
  return { teamId, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0 };
}

export function computeStandings(
  matches: Awaited<ReturnType<typeof getCompletedMatches>>,
  teamIds: string[],
  points: { win: number; draw: number; loss: number }
): TeamRecord[] {
  const records = new Map<string, TeamRecord>();
  for (const id of teamIds) records.set(id, emptyTeamRecord(id));

  for (const m of matches) {
    if (m.scoreA == null || m.scoreB == null) continue;
    const a = records.get(m.teamAId);
    const b = records.get(m.teamBId);
    if (!a || !b) continue;
    a.played++;
    b.played++;
    a.goalsFor += m.scoreA;
    a.goalsAgainst += m.scoreB;
    b.goalsFor += m.scoreB;
    b.goalsAgainst += m.scoreA;
    if (m.scoreA > m.scoreB) {
      a.wins++;
      b.losses++;
    } else if (m.scoreA < m.scoreB) {
      b.wins++;
      a.losses++;
    } else {
      a.draws++;
      b.draws++;
    }
  }

  for (const r of records.values()) {
    r.goalDiff = r.goalsFor - r.goalsAgainst;
    r.points = r.wins * points.win + r.draws * points.draw + r.losses * points.loss;
  }

  return [...records.values()].sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
}

export type PlayerStatline = {
  playerId: string;
  goals: number;
  assists: number;
  motms: number;
  appearances: number;
};

export async function getPlayerStatlines(seasonId?: string): Promise<Map<string, PlayerStatline>> {
  const matchWhere = seasonId ? { seasonId } : {};

  const [goalCounts, assistCounts, motmCounts, matches] = await Promise.all([
    prisma.matchEvent.groupBy({
      by: ["playerId"],
      where: { type: "GOAL", playerId: { not: null }, match: matchWhere },
      _count: { playerId: true },
    }),
    prisma.matchEvent.groupBy({
      by: ["playerId"],
      where: { type: "ASSIST", playerId: { not: null }, match: matchWhere },
      _count: { playerId: true },
    }),
    prisma.matchMotm.groupBy({
      by: ["playerId"],
      where: { match: matchWhere },
      _count: { playerId: true },
    }),
    prisma.match.findMany({
      where: { status: "COMPLETED", ...matchWhere },
      include: { teamA: { include: { players: true } }, teamB: { include: { players: true } } },
    }),
  ]);

  const appearances = new Map<string, number>();
  for (const m of matches) {
    for (const p of [...m.teamA.players, ...m.teamB.players]) {
      appearances.set(p.id, (appearances.get(p.id) ?? 0) + 1);
    }
  }

  const map = new Map<string, PlayerStatline>();
  function ensure(id: string) {
    if (!map.has(id)) map.set(id, { playerId: id, goals: 0, assists: 0, motms: 0, appearances: appearances.get(id) ?? 0 });
    return map.get(id)!;
  }
  for (const g of goalCounts) if (g.playerId) ensure(g.playerId).goals = g._count.playerId;
  for (const a of assistCounts) if (a.playerId) ensure(a.playerId).assists = a._count.playerId;
  for (const mo of motmCounts) ensure(mo.playerId).motms = mo._count.playerId;
  for (const [id, count] of appearances) ensure(id).appearances = count;

  return map;
}

export type PairRecord = {
  pairId: string;
  appearances: number;
  wins: number;
  losses: number;
  winPercent: number;
  currentStreak: number;
  bestStreak: number;
  totalDailyWins: number;
};

function emptyPairRecord(pairId: string): PairRecord {
  return { pairId, appearances: 0, wins: 0, losses: 0, winPercent: 0, currentStreak: 0, bestStreak: 0, totalDailyWins: 0 };
}

// "Appearances" and win % are only meaningful for days where BOTH the
// winner and who-they-beat were recorded (opponentPairId set). A result
// logged with just a winner (the fast path) still counts as a win/total
// daily win, but doesn't count as an "appearance" for either pair, since we
// don't know who else played that day.
export async function computePairRecords(seasonId?: string): Promise<Map<string, PairRecord>> {
  const results = await prisma.twoVTwoResult.findMany({
    where: seasonId ? { seasonId } : {},
    orderBy: { date: "asc" },
  });
  const pairs = await prisma.twoVTwoPair.findMany();

  const map = new Map<string, PairRecord>();
  for (const p of pairs) map.set(p.id, emptyPairRecord(p.id));

  const resultsByPair = new Map<string, ("W" | "L")[]>();
  for (const p of pairs) resultsByPair.set(p.id, []);

  for (const r of results) {
    const winner = map.get(r.winningPairId);
    if (winner) {
      winner.totalDailyWins++;
      winner.wins++;
    }
    if (r.opponentPairId) {
      const loser = map.get(r.opponentPairId);
      if (winner) winner.appearances++;
      if (loser) {
        loser.appearances++;
        loser.losses++;
      }
      resultsByPair.get(r.winningPairId)?.push("W");
      resultsByPair.get(r.opponentPairId)?.push("L");
    }
  }

  for (const [pairId, rec] of map) {
    rec.winPercent = rec.appearances > 0 ? Math.round((rec.wins / rec.appearances) * 1000) / 10 : 0;
    const history = resultsByPair.get(pairId) ?? [];
    if (history.length > 0) {
      const last = history[history.length - 1];
      let count = 0;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i] === last) count++;
        else break;
      }
      rec.currentStreak = last === "W" ? count : 0;
    }
    let best = 0,
      running = 0;
    for (const h of history) {
      if (h === "W") {
        running++;
        best = Math.max(best, running);
      } else running = 0;
    }
    rec.bestStreak = best;
  }

  return map;
}
