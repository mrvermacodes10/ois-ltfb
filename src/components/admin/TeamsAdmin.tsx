"use client";

import { useState, useTransition } from "react";
import { createTeam, updateTeam, deleteTeam } from "@/app/actions/teams";

type Team = { id: string; name: string; logoUrl: string | null; description: string | null; active: boolean; playerCount: number };
const inputCls = "input";

export default function TeamsAdmin({ teams }: { teams: Team[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Teams</h1>
        <button className="btn-primary" onClick={() => setShowAdd((v) => !v)}>{showAdd ? "Close" : "+ Add team"}</button>
      </div>

      {showAdd && (
        <form action={(fd) => startTransition(async () => { const res = await createTeam(fd); if (res.ok) setShowAdd(false); else setMessage(res.error ?? "Couldn't create team."); })}
          className="panel p-4 mb-5 grid sm:grid-cols-3 gap-3 items-end">
          <div><label className="label">Team name</label><input name="name" required className={inputCls + " mt-1.5"} /></div>
          <div><label className="label">Logo URL</label><input name="logoUrl" className={inputCls + " mt-1.5"} placeholder="optional" /></div>
          <div><label className="label">Description</label><input name="description" className={inputCls + " mt-1.5"} placeholder="optional" /></div>
          <div className="sm:col-span-3"><button className="btn-primary" disabled={isPending}>Create team</button></div>
        </form>
      )}

      {message && <div className="rounded-md px-3 py-2 text-sm mb-4 bg-red-500/10 text-red-300">{message}</div>}

      <div className="grid sm:grid-cols-2 gap-4">
        {teams.length === 0 && <div className="panel p-6 text-center text-sm text-chalk/50 sm:col-span-2">No teams yet.</div>}
        {teams.map((t) => editingId === t.id ? (
          <form key={t.id} action={(fd) => startTransition(async () => { const res = await updateTeam(fd); if (res.ok) setEditingId(null); else setMessage(res.error ?? "Couldn't save."); })}
            className="panel p-4 space-y-3">
            <input type="hidden" name="id" value={t.id} />
            <div><label className="label">Team name</label><input name="name" defaultValue={t.name} className={inputCls + " mt-1.5"} /></div>
            <div><label className="label">Logo URL</label><input name="logoUrl" defaultValue={t.logoUrl ?? ""} className={inputCls + " mt-1.5"} /></div>
            <div><label className="label">Description</label><input name="description" defaultValue={t.description ?? ""} className={inputCls + " mt-1.5"} /></div>
            <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" name="active" defaultChecked={t.active} /> Active</label>
            <div className="flex gap-2">
              <button className="btn-primary" disabled={isPending}>Save</button>
              <button type="button" onClick={() => setEditingId(null)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        ) : (
          <div key={t.id} className="panel p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display font-bold text-lg">{t.name}</div>
                <div className="text-sm text-chalk/50 mt-0.5">{t.playerCount} player{t.playerCount === 1 ? "" : "s"}</div>
              </div>
              <span className={`badge-status ${t.active ? "bg-green-lunch/15 text-green-lunch" : "bg-chalk/10 text-chalk/50"}`}>{t.active ? "ACTIVE" : "INACTIVE"}</span>
            </div>
            {t.description && <p className="text-sm text-chalk/50 mt-2">{t.description}</p>}
            <div className="mt-3 flex gap-3">
              <button onClick={() => setEditingId(t.id)} className="text-sm font-medium underline">Edit</button>
              <button onClick={() => { if (confirm(`Delete ${t.name}?`)) startTransition(async () => { const res = await deleteTeam(t.id); if (!res.ok) setMessage(res.error ?? "Couldn't delete team."); }); }}
                disabled={isPending} className="text-sm font-medium text-red-400 underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
