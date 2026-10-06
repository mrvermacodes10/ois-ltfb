import { prisma } from "@/lib/prisma";
import TwoVTwoAdmin from "@/components/admin/TwoVTwoAdmin";

export default async function Admin2v2Page() {
  const [pairs, players, results, seasons] = await Promise.all([
    prisma.twoVTwoPair.findMany({ include: { player1: true, player2: true }, orderBy: { createdAt: "desc" } }),
    prisma.player.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.twoVTwoResult.findMany({
      include: {
        winningPair: { include: { player1: true, player2: true } },
        opponentPair: { include: { player1: true, player2: true } },
        mvpPlayer: true,
      },
      orderBy: { date: "desc" },
    }),
    prisma.season.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  function pairLabel(p: { name: string | null; player1: { name: string }; player2: { name: string } }) {
    return p.name ?? `${p.player1.name} & ${p.player2.name}`;
  }

  return (
    <TwoVTwoAdmin
      players={players.map((p) => ({ id: p.id, name: p.name }))}
      seasons={seasons.map((s) => ({ id: s.id, name: s.name }))}
      pairs={pairs.map((p) => ({
        id: p.id, name: p.name, player1Id: p.player1Id, player2Id: p.player2Id,
        player1Name: p.player1.name, player2Name: p.player2.name, active: p.active,
      }))}
      results={results.map((r) => ({
        id: r.id,
        date: r.date.toISOString(),
        winningPairId: r.winningPairId,
        winningPairLabel: pairLabel(r.winningPair),
        opponentPairId: r.opponentPairId,
        opponentPairLabel: r.opponentPair ? pairLabel(r.opponentPair) : null,
        scoreNote: r.scoreNote,
        mvpPlayerId: r.mvpPlayerId,
        mvpPlayerName: r.mvpPlayer?.name ?? null,
        notes: r.notes,
      }))}
    />
  );
}
