"use client";

import { useState, useTransition } from "react";
import { createSeason, setCurrentSeason, deleteSeason } from "@/app/actions/seasons";

type Season = { id: string; name: string; isCurrent: boolean; matchCount: number };
const inputCls = "input";

export default function SeasonsAdmin({ seasons }: { seasons: Season[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Seasons</h1>
        <button className="btn-primary" onClick={() => setShowAdd((v) => !v)}>{showAdd ? "Close" : "+ Create season"}</button>
      </div>
      <p className="text-sm text-chalk/50 mb-4">Starting a new season never deletes history — old matches, awards and 2v2 results stay exactly where they are.</p>

      {showAdd && (
        <form action={(fd) => startTransition(async () => { const res = await createSeason(fd); if (res.ok) setShowAdd(false); else setMessage(res.error ?? "Couldn't create."); })}
          className="panel p-4 mb-5 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]"><label className="label">Season name</label><input name="name" required placeholder="e.g. 2027/28" className={inputCls + " mt-1.5"} /></div>
          <label className="flex items-center gap-1.5 text-sm pb-2.5"><input type="checkbox" name="makeCurrent" /> Make current</label>
          <button className="btn-primary" disabled={isPending}>Create</button>
        </form>
      )}

      {message && <div className="rounded-md px-3 py-2 text-sm mb-4 bg-red-500/10 text-red-300">{message}</div>}

      <div className="panel divide-y divide-chalk/10">
        {seasons.map((s) => (
          <div key={s.id} className="p-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold">{s.name}</span>
              {s.isCurrent && <span className="badge-status bg-green-lunch/15 text-green-lunch">CURRENT</span>}
              <span className="text-xs text-chalk/40">{s.matchCount} match{s.matchCount === 1 ? "" : "es"}</span>
            </div>
            <div className="flex gap-3">
              {!s.isCurrent && <button onClick={() => startTransition(() => setCurrentSeason(s.id))} className="btn-secondary text-xs">Make current</button>}
              <button onClick={() => { if (confirm(`Delete ${s.name}?`)) startTransition(async () => { const res = await deleteSeason(s.id); if (!res.ok) setMessage(res.error ?? "Couldn't delete."); }); }}
                disabled={isPending} className="text-sm font-medium text-red-400 underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
