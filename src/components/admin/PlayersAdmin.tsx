"use client";

import { useState, useTransition } from "react";
import { createPlayer, updatePlayer, deletePlayer } from "@/app/actions/players";

type Player = {
  id: string; name: string; ltfbId: string | null; position: string | null;
  photoUrl: string | null; bio: string | null; active: boolean; teamId: string | null; teamName: string | null;
};
type Team = { id: string; name: string };
const inputCls = "input";

export default function PlayersAdmin({ players, teams }: { players: Player[]; teams: Team[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Players</h1>
        <button className="btn-primary" onClick={() => setShowAdd((v) => !v)}>{showAdd ? "Close" : "+ Add player"}</button>
      </div>

      {showAdd && (
        <form action={(fd) => startTransition(async () => { await createPlayer(fd); setShowAdd(false); })}
          className="panel p-4 mb-5 grid sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div><label className="label">Name</label><input name="name" required className={inputCls + " mt-1.5"} /></div>
          <div><label className="label">Player ID</label><input name="ltfbId" className={inputCls + " mt-1.5"} placeholder="optional" /></div>
          <div><label className="label">Team</label>
            <select name="teamId" className={inputCls + " mt-1.5"}>
              <option value="">— Unassigned —</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div><label className="label">Position</label><input name="position" className={inputCls + " mt-1.5"} placeholder="optional" /></div>
          <div><label className="label">Photo URL</label><input name="photoUrl" className={inputCls + " mt-1.5"} placeholder="optional" /></div>
          <div className="sm:col-span-2 md:col-span-3"><label className="label">Bio</label><input name="bio" className={inputCls + " mt-1.5"} placeholder="optional" /></div>
          <div><button className="btn-primary" disabled={isPending}>{isPending ? "Adding…" : "Add player"}</button></div>
        </form>
      )}

      {message && <div className="rounded-md px-3 py-2 text-sm mb-4 bg-red-500/10 text-red-300">{message}</div>}

      <div className="panel overflow-x-auto">
        <table className="w-full text-sm min-w-[780px]">
          <thead><tr className="border-b border-chalk/10 text-left label">
            <th className="px-4 py-3">Name</th><th className="px-4 py-3">Player ID</th><th className="px-4 py-3">Team</th>
            <th className="px-4 py-3">Position</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {players.map((p) => (
              <PlayerRow key={p.id} player={p} teams={teams} editing={editingId === p.id}
                onEdit={() => setEditingId(editingId === p.id ? null : p.id)}
                onError={(t) => setMessage(t)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlayerRow({ player, teams, editing, onEdit, onError }: { player: Player; teams: Team[]; editing: boolean; onEdit: () => void; onError: (t: string) => void; }) {
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <tr className="border-b border-chalk/10 last:border-0">
        <td className="px-4 py-2.5 font-medium">{player.name}</td>
        <td className="px-4 py-2.5 text-chalk/60">{player.ltfbId ?? "—"}</td>
        <td className="px-4 py-2.5 text-chalk/60">{player.teamName ?? "Unassigned"}</td>
        <td className="px-4 py-2.5 text-chalk/60">{player.position ?? "—"}</td>
        <td className="px-4 py-2.5">
          <span className={`badge-status ${player.active ? "bg-green-lunch/15 text-green-lunch" : "bg-chalk/10 text-chalk/50"}`}>{player.active ? "ACTIVE" : "INACTIVE"}</span>
        </td>
        <td className="px-4 py-2.5 text-right space-x-3">
          <button onClick={onEdit} className="text-sm font-medium underline">Edit</button>
          <button onClick={() => { if (confirm(`Delete ${player.name}?`)) startTransition(async () => { const res = await deletePlayer(player.id); if (res && !res.ok) onError(res.error ?? "Couldn't delete player."); }); }}
            disabled={isPending} className="text-sm font-medium text-red-400 underline">Delete</button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-chalk/10 last:border-0 bg-chalk/5">
      <td colSpan={6} className="px-4 py-4">
        <form action={(fd) => startTransition(async () => { const res = await updatePlayer(fd); if (res && !res.ok) onError(res.error ?? "Couldn't save."); else onEdit(); })}
          className="grid sm:grid-cols-3 md:grid-cols-6 gap-3 items-end">
          <input type="hidden" name="id" value={player.id} />
          <div><label className="label">Name</label><input name="name" defaultValue={player.name} className={inputCls + " mt-1.5"} /></div>
          <div><label className="label">Player ID</label><input name="ltfbId" defaultValue={player.ltfbId ?? ""} className={inputCls + " mt-1.5"} /></div>
          <div><label className="label">Team</label>
            <select name="teamId" defaultValue={player.teamId ?? ""} className={inputCls + " mt-1.5"}>
              <option value="">— Unassigned —</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div><label className="label">Position</label><input name="position" defaultValue={player.position ?? ""} className={inputCls + " mt-1.5"} /></div>
          <div><label className="label">Photo URL</label><input name="photoUrl" defaultValue={player.photoUrl ?? ""} className={inputCls + " mt-1.5"} /></div>
          <div><label className="label">Bio</label><input name="bio" defaultValue={player.bio ?? ""} className={inputCls + " mt-1.5"} /></div>
          <label className="flex items-center gap-1.5 text-sm pb-2"><input type="checkbox" name="active" defaultChecked={player.active} /> Active</label>
          <div className="flex gap-2 md:col-span-6">
            <button className="btn-primary" disabled={isPending}>{isPending ? "Saving…" : "Save"}</button>
            <button type="button" onClick={onEdit} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </td>
    </tr>
  );
}
