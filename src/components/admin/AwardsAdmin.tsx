"use client";

import { useState, useTransition } from "react";
import { createAward, updateAward, deleteAward } from "@/app/actions/awards";
import { AWARD_NAMES } from "@/lib/enums";

type Award = { id: string; name: string; category: string | null; description: string | null; playerId: string | null; playerName: string | null; teamId: string | null; teamName: string | null; date: string; };
type Option = { id: string; name: string };
const inputCls = "input";

export default function AwardsAdmin({ awards, players, teams, seasons }: { awards: Award[]; players: Option[]; teams: Option[]; seasons: Option[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Awards</h1>
        <button className="btn-primary" onClick={() => setShowAdd((v) => !v)}>{showAdd ? "Close" : "+ Create award"}</button>
      </div>
      <p className="text-sm text-chalk/50 mb-4">Real LTFB categories: {AWARD_NAMES.join(" · ")} — or type any custom name.</p>

      {showAdd && <AwardForm players={players} teams={teams} seasons={seasons}
        onSubmit={(fd) => startTransition(async () => { const res = await createAward(fd); if (res.ok) setShowAdd(false); else setMessage(res.error ?? "Couldn't create award."); })}
        submitLabel="Create award" isPending={isPending} />}

      {message && <div className="rounded-md px-3 py-2 text-sm mb-4 bg-red-500/10 text-red-300">{message}</div>}

      <div className="grid sm:grid-cols-2 gap-4">
        {awards.length === 0 && <div className="panel p-6 text-center text-sm text-chalk/50 sm:col-span-2">No awards yet.</div>}
        {awards.map((a) => editingId === a.id ? (
          <div key={a.id} className="panel p-4">
            <AwardForm award={a} players={players} teams={teams} seasons={seasons}
              onSubmit={(fd) => startTransition(async () => { const res = await updateAward(fd); if (res.ok) setEditingId(null); else setMessage(res.error ?? "Couldn't save."); })}
              submitLabel="Save" isPending={isPending} onCancel={() => setEditingId(null)} />
          </div>
        ) : (
          <div key={a.id} className="panel p-4 border-l-2 border-l-gold">
            <div className="font-display font-bold gold-text">{a.name}</div>
            <div className="text-sm text-chalk/70 mt-1">{a.playerName ?? a.teamName ?? "TBD"}{a.category && <span className="text-chalk/40"> · {a.category}</span>}</div>
            {a.description && <p className="text-sm text-chalk/50 mt-2">{a.description}</p>}
            <div className="mt-3 flex gap-3">
              <button onClick={() => setEditingId(a.id)} className="text-sm font-medium underline">Edit</button>
              <button onClick={() => { if (confirm(`Delete "${a.name}"?`)) startTransition(() => deleteAward(a.id)); }} disabled={isPending} className="text-sm font-medium text-red-400 underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AwardForm({ award, players, teams, seasons, onSubmit, submitLabel, isPending, onCancel }: {
  award?: Award; players: Option[]; teams: Option[]; seasons: Option[]; onSubmit: (fd: FormData) => void; submitLabel: string; isPending: boolean; onCancel?: () => void;
}) {
  return (
    <form action={onSubmit} className={award ? "space-y-3" : "panel p-4 mb-5 space-y-3"}>
      {award && <input type="hidden" name="id" value={award.id} />}
      <div><label className="label">Award name</label>
        <input name="name" defaultValue={award?.name ?? ""} required list="award-suggestions" className={inputCls + " mt-1.5"} />
        <datalist id="award-suggestions">{AWARD_NAMES.map((n) => <option key={n} value={n} />)}</datalist>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Category (e.g. semester)</label><input name="category" defaultValue={award?.category ?? ""} className={inputCls + " mt-1.5"} /></div>
        <div><label className="label">Season</label>
          <select name="seasonId" defaultValue="" className={inputCls + " mt-1.5"}>
            <option value="">— None —</option>
            {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Player</label>
          <select name="playerId" defaultValue={award?.playerId ?? ""} className={inputCls + " mt-1.5"}>
            <option value="">— TBD —</option>
            {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div><label className="label">Team</label>
          <select name="teamId" defaultValue={award?.teamId ?? ""} className={inputCls + " mt-1.5"}>
            <option value="">— None —</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>
      <div><label className="label">Description</label><input name="description" defaultValue={award?.description ?? ""} className={inputCls + " mt-1.5"} /></div>
      <div className="flex gap-2">
        <button className="btn-gold" disabled={isPending}>{isPending ? "Saving…" : submitLabel}</button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
      </div>
    </form>
  );
}
