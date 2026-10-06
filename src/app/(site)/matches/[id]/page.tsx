import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      teamA: { include: { players: true } },
      teamB: { include: { players: true } },
      events: { include: { player: true }, orderBy: { createdAt: "asc" } },
      motms: { include: { player: true } },
    },
  });
  if (!match) notFound();

  const previousMeetings = await prisma.match.findMany({
    where: {
      id: { not: match.id },
      status: "COMPLETED",
      OR: [{ teamAId: match.teamAId, teamBId: match.teamBId }, { teamAId: match.teamBId, teamBId: match.teamAId }],
    },
    orderBy: { date: "desc" },
    take: 5,
  });

  const goals = match.events.filter((e) => e.type === "GOAL");
  const assists = match.events.filter((e) => e.type === "ASSIST");

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <Link href="/matches" className="text-sm text-chalk/50 hover:text-chalk">‹ Back to matches</Link>

      <div className="mt-4 panel p-6 sm:p-10 pitch-texture text-center">
        <div className="flex items-center justify-center gap-3 mb-6"><StatusBadge status={match.status} /></div>
        <div className="flex items-center justify-center gap-6 sm:gap-12">
          <div className="flex-1 text-right"><Link href={`/teams/${match.teamAId}`} className="font-display text-xl sm:text-2xl font-extrabold hover:text-green-lunch">{match.teamA.name}</Link></div>
          <div className="scoreboard-digit text-5xl sm:text-7xl font-extrabold">{match.scoreA ?? "–"} <span className="text-chalk/30">:</span> {match.scoreB ?? "–"}</div>
          <div className="flex-1 text-left"><Link href={`/teams/${match.teamBId}`} className="font-display text-xl sm:text-2xl font-extrabold hover:text-green-lunch">{match.teamB.name}</Link></div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-chalk/50">
          {match.time && <span>{match.time}</span>}
          <span>{new Date(match.date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>

      {match.motms.length > 0 && (
        <div className="mt-6 panel p-4 text-center border-gold/20">
          <span className="label text-gold">Man of the Match{match.motms.length > 1 ? "es" : ""}</span>
          <div className="font-display font-bold text-lg mt-1">{match.motms.map((m) => m.player.name).join(" / ")}</div>
        </div>
      )}

      {(goals.length > 0 || assists.length > 0) && (
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {goals.length > 0 && (
            <div><h2 className="font-display text-lg font-bold mb-3">Goals</h2>
              <div className="panel divide-y divide-chalk/10">{goals.map((e) => <div key={e.id} className="p-3 text-sm">{e.player?.name ?? "Unknown"}</div>)}</div>
            </div>
          )}
          {assists.length > 0 && (
            <div><h2 className="font-display text-lg font-bold mb-3">Assists</h2>
              <div className="panel divide-y divide-chalk/10">{assists.map((e) => <div key={e.id} className="p-3 text-sm">{e.player?.name ?? "Unknown"}</div>)}</div>
            </div>
          )}
        </div>
      )}

      {match.notes && <div className="mt-6"><h2 className="font-display text-lg font-bold mb-2">Match notes</h2><p className="text-sm text-chalk/60">{match.notes}</p></div>}

      {previousMeetings.length > 0 && (
        <div className="mt-6"><h2 className="font-display text-lg font-bold mb-3">Previous meetings</h2>
          <div className="panel divide-y divide-chalk/10">
            {previousMeetings.map((m) => (
              <div key={m.id} className="p-3 text-sm flex items-center justify-between">
                <span>{m.teamAId === match.teamAId ? match.teamA.name : match.teamB.name}</span>
                <span className="scoreboard-digit font-bold">{m.scoreA} – {m.scoreB}</span>
                <span>{m.teamBId === match.teamBId ? match.teamB.name : match.teamA.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
