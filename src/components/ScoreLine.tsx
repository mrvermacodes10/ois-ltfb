import Link from "next/link";
import StatusBadge from "./StatusBadge";

export default function ScoreLine({ id, teamAName, teamBName, scoreA, scoreB, status, meta }: {
  id: string; teamAName: string; teamBName: string; scoreA: number | null; scoreB: number | null; status: string; meta?: string;
}) {
  return (
    <Link href={`/matches/${id}`} className="panel p-4 flex items-center justify-between gap-3 hover:border-green-lunch/40 transition-colors">
      <span className="flex-1 text-sm sm:text-base font-medium text-right truncate">{teamAName}</span>
      <span className="scoreboard-digit text-xl sm:text-2xl font-extrabold text-chalk px-3 whitespace-nowrap">{scoreA ?? "–"} <span className="text-chalk/30">—</span> {scoreB ?? "–"}</span>
      <span className="flex-1 text-sm sm:text-base font-medium truncate">{teamBName}</span>
      <div className="hidden sm:flex flex-col items-end gap-1 ml-2"><StatusBadge status={status} />{meta && <span className="text-[11px] text-chalk/40">{meta}</span>}</div>
    </Link>
  );
}
