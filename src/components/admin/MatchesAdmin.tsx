"use client";

import { useState, useTransition } from "react";
import { createMatch, updateMatch, enterResult, deleteMatch, addStatEvent, removeLastStatEvent, toggleMotm } from "@/app/actions/matches";
import { STATUS_LABELS } from "@/lib/enums";

type Team = { id: string; name: string };
type Season = { id: string; name: string };
type PlayerOption = { id: string; name: string; teamId: string | null };
type MatchRow = {
  id: string; teamAId: string; teamBId: string; teamAName: string; teamBName: string;
  scoreA: number | null; scoreB: number | null; status: string; date: string; time: string | null; notes: string | null;
  goalCounts: Record<string, number>; assistCounts: Record<string, number>; motmIds: string[];
};

const inputCls = "input";

export default function MatchesAdmin({ matches, teams, seasons, players }: { matches: MatchRow[]; teams: Team[]; seasons: Season[]; players: PlayerOption[]; }) {
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Matches</h1>
        <button className="btn-primary" onClick={() => setShowAdd((v) => !v)}>{showAdd ? "Close" : "+ Add match"}</button>
      </div>

      {showAdd && (
        <form action={(fd) => startTransition(async () => { await createMatch(fd); setShowAdd(false); })}
          className="panel p-4 mb-5 grid sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
          <div><label className="label">Season</label>
            <select name="seasonId" required className={inputCls + " mt-1.5"} defaultValue={seasons.find((s) => true)?.id}>
              {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="label">Team A</label>
            <select name="teamAId" required className={inputCls + " mt-1.5"}>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
          </div>
          <div><label className="label">Team B</label>
            <select name="teamBId" required className={inputCls + " mt-1.5"} defaultValue={teams[1]?.id}>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
          </div>
          <div><label className="label">Date</label><input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={inputCls + " mt-1.5"} /></div>
          <div><label className="label">Time</label><input name="time" placeholder="optional" className={inputCls + " mt-1.5"} /></div>
          <div className="md:col-span-5"><button className="btn-primary" disabled={isPending}>Add match</button></div>
        </form>
      )}

      <div className="space-y-4">
        {matches.length === 0 && <div className="panel p-6 text-center text-sm text-chalk/50">No matches yet.</div>}
        {matches.map((m) => <MatchRowAdmin key={m.id} match={m} players={players.filter((p) => p.teamId === m.teamAId || p.teamId === m.teamBId)} />)}
      </div>
    </div>
  );
}

function MatchRowAdmin({ match, players }: { match: MatchRow; players: PlayerOption[] }) {
  const [isPending, startTransition] = useTransition();
  const [showStats, setShowStats] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="font-display font-bold">{match.teamAName} <span className="text-chalk/40 font-normal">vs</span> {match.teamBName}</div>
        <div className="flex items-center gap-2 text-xs text-chalk/50">
          <span className={`badge-status ${match.status === "LIVE" ? "bg-red-500/15 text-red-300" : match.status === "COMPLETED" ? "bg-green-lunch/15 text-green-lunch" : "bg-chalk/10 text-chalk/60"}`}>{STATUS_LABELS[match.status]?.toUpperCase()}</span>
          <span>{new Date(match.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
          {match.time && <span>{match.time}</span>}
        </div>
      </div>

      <form action={(fd) => startTransition(async () => { await enterResult(fd); })} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="id" value={match.id} />
        <div><label className="label">{match.teamAName}</label>
          <input name="scoreA" type="number" min="0" defaultValue={match.scoreA ?? ""} className="input mt-1.5 w-20 scoreboard-digit text-lg text-center" />
        </div>
        <div className="pb-2.5 text-chalk/40 font-bold">–</div>
        <div><label className="label">{match.teamBName}</label>
          <input name="scoreB" type="number" min="0" defaultValue={match.scoreB ?? ""} className="input mt-1.5 w-20 scoreboard-digit text-lg text-center" />
        </div>
        <div><label className="label">Status</label>
          <select name="status" defaultValue={match.status} className="input mt-1.5">
            <option value="SCHEDULED">Scheduled</option><option value="LIVE">Live</option><option value="COMPLETED">Completed</option>
          </select>
        </div>
        <button className="btn-primary" disabled={isPending}>{isPending ? "Saving…" : "Save result"}</button>
        <button type="button" onClick={() => setShowStats((v) => !v)} className="btn-secondary">{showStats ? "Hide stats" : "Goals / Assists / MOTM"}</button>
        <button type="button" onClick={() => setShowEdit((v) => !v)} className="btn-secondary">{showEdit ? "Hide details" : "Edit details"}</button>
        <button type="button" onClick={() => { if (confirm("Delete this match?")) startTransition(() => deleteMatch(match.id)); }} disabled={isPending} className="text-sm font-medium text-red-400 underline ml-auto">Delete</button>
      </form>

      {showEdit && (
        <form action={(fd) => startTransition(async () => { await updateMatch(fd); })} className="mt-4 pt-4 border-t border-chalk/10 grid sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <input type="hidden" name="id" value={match.id} />
          <div><label className="label">Date</label><input name="date" type="date" defaultValue={match.date.slice(0, 10)} className={inputCls + " mt-1.5"} /></div>
          <div><label className="label">Time</label><input name="time" defaultValue={match.time ?? ""} className={inputCls + " mt-1.5"} /></div>
          <div className="sm:col-span-2"><label className="label">Notes</label><input name="notes" defaultValue={match.notes ?? ""} className={inputCls + " mt-1.5"} /></div>
          <div className="md:col-span-4"><button className="btn-secondary" disabled={isPending}>Save details</button></div>
        </form>
      )}

      {showStats && (
        <div className="mt-4 pt-4 border-t border-chalk/10 space-y-3">
          {players.length === 0 && <p className="text-sm text-chalk/40">Assign players to these teams first.</p>}
          {players.map((p) => (
            <div key={p.id} className="flex items-center gap-3 flex-wrap bg-chalk/5 rounded-xl px-3 py-2">
              <span className="text-sm font-medium min-w-[120px]">{p.name}</span>
              <StatCounter label="Goals" count={match.goalCounts[p.id] ?? 0}
                onAdd={() => startTransition(() => addStatEvent(match.id, p.id, "GOAL"))}
                onRemove={() => startTransition(() => removeLastStatEvent(match.id, p.id, "GOAL"))} />
              <StatCounter label="Assists" count={match.assistCounts[p.id] ?? 0}
                onAdd={() => startTransition(() => addStatEvent(match.id, p.id, "ASSIST"))}
                onRemove={() => startTransition(() => removeLastStatEvent(match.id, p.id, "ASSIST"))} />
              <button
                onClick={() => startTransition(() => toggleMotm(match.id, p.id))}
                className={`rounded-full px-3 py-1 text-xs font-bold ${match.motmIds.includes(p.id) ? "bg-gold text-pitch-black" : "bg-chalk/10 text-chalk/60"}`}
              >
                {match.motmIds.includes(p.id) ? "★ MOTM" : "Make MOTM"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCounter({ label, count, onAdd, onRemove }: { label: string; count: number; onAdd: () => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-chalk/40 w-12">{label}</span>
      <button onClick={onRemove} className="w-6 h-6 rounded-full bg-chalk/10 text-chalk text-xs font-bold flex items-center justify-center">−</button>
      <span className="scoreboard-digit text-sm font-bold w-4 text-center">{count}</span>
      <button onClick={onAdd} className="w-6 h-6 rounded-full bg-green-lunch text-pitch-black text-xs font-bold flex items-center justify-center">+</button>
    </div>
  );
}
