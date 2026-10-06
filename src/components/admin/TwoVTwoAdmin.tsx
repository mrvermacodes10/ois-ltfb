"use client";

import { useState, useTransition } from "react";
import { createPair, updatePair, deletePair, recordResult, updateResult, deleteResult } from "@/app/actions/twoVTwo";

type Pair = { id: string; name: string | null; player1Id: string; player2Id: string; player1Name: string; player2Name: string; active: boolean };
type PlayerOption = { id: string; name: string };
type Result = { id: string; date: string; winningPairId: string; winningPairLabel: string; opponentPairId: string | null; opponentPairLabel: string | null; scoreNote: string | null; mvpPlayerId: string | null; mvpPlayerName: string | null; notes: string | null };
type Season = { id: string; name: string };

const inputCls = "input";

export default function TwoVTwoAdmin({ pairs, players, results, seasons }: { pairs: Pair[]; players: PlayerOption[]; results: Result[]; seasons: Season[] }) {
  const [showAddPair, setShowAddPair] = useState(false);
  const [showRecord, setShowRecord] = useState(false);
  const [editingPairId, setEditingPairId] = useState<string | null>(null);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-1">2v2 League</h1>
      <p className="text-sm text-chalk/50 mb-6">A real lunchtime 2v2 competition — not fantasy football.</p>

      {message && <div className="rounded-md px-3 py-2 text-sm mb-4 bg-red-500/10 text-red-300">{message}</div>}

      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h2 className="font-display text-lg font-bold">Pairs</h2>
        <button className="btn-secondary" onClick={() => setShowAddPair((v) => !v)}>{showAddPair ? "Close" : "+ Create pair"}</button>
      </div>

      {showAddPair && (
        <form action={(fd) => startTransition(async () => { const res = await createPair(fd); if (res.ok) setShowAddPair(false); else setMessage(res.error ?? "Couldn't create pair."); })}
          className="panel p-4 mb-5 grid sm:grid-cols-3 gap-3 items-end">
          <div><label className="label">Pair name</label><input name="name" placeholder="optional" className={inputCls + " mt-1.5"} /></div>
          <div><label className="label">Player 1</label><select name="player1Id" required className={inputCls + " mt-1.5"}>{players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div><label className="label">Player 2</label><select name="player2Id" required className={inputCls + " mt-1.5"} defaultValue={players[1]?.id}>{players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="sm:col-span-3"><button className="btn-primary" disabled={isPending}>Create pair</button></div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {pairs.length === 0 && <div className="panel p-6 text-center text-sm text-chalk/50 sm:col-span-3">No pairs yet.</div>}
        {pairs.map((pair) => editingPairId === pair.id ? (
          <form key={pair.id} action={(fd) => startTransition(async () => { const res = await updatePair(fd); if (res.ok) setEditingPairId(null); else setMessage(res.error ?? "Couldn't save."); })}
            className="panel p-4 space-y-2">
            <input type="hidden" name="id" value={pair.id} />
            <input name="name" defaultValue={pair.name ?? ""} placeholder="Pair name" className={inputCls} />
            <select name="player1Id" defaultValue={pair.player1Id} className={inputCls}>{players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <select name="player2Id" defaultValue={pair.player2Id} className={inputCls}>{players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" name="active" defaultChecked={pair.active} /> Active</label>
            <div className="flex gap-2"><button className="btn-primary text-xs" disabled={isPending}>Save</button><button type="button" onClick={() => setEditingPairId(null)} className="btn-secondary text-xs">Cancel</button></div>
          </form>
        ) : (
          <div key={pair.id} className="panel p-4">
            <div className="font-display font-bold">{pair.name ?? `${pair.player1Name} & ${pair.player2Name}`}</div>
            <div className="text-xs text-chalk/50 mt-0.5">{pair.player1Name} &amp; {pair.player2Name}</div>
            <span className={`badge-status mt-2 inline-block ${pair.active ? "bg-green-lunch/15 text-green-lunch" : "bg-chalk/10 text-chalk/50"}`}>{pair.active ? "ACTIVE" : "INACTIVE"}</span>
            <div className="mt-3 flex gap-3">
              <button onClick={() => setEditingPairId(pair.id)} className="text-sm font-medium underline">Edit</button>
              <button onClick={() => { if (confirm("Delete this pair?")) startTransition(async () => { const res = await deletePair(pair.id); if (!res.ok) setMessage(res.error ?? "Couldn't delete."); }); }}
                disabled={isPending} className="text-sm font-medium text-red-400 underline">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h2 className="font-display text-lg font-bold">Daily winners</h2>
        <button className="btn-primary" onClick={() => setShowRecord((v) => !v)}>{showRecord ? "Close" : "Record 2v2 winner"}</button>
      </div>

      {showRecord && (
        <form action={(fd) => startTransition(async () => { const res = await recordResult(fd); if (res.ok) setShowRecord(false); else setMessage(res.error ?? "Couldn't record."); })}
          className="panel p-4 mb-5 grid sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
          <div><label className="label">Season</label><select name="seasonId" required className={inputCls + " mt-1.5"}>{seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><label className="label">Date</label><input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={inputCls + " mt-1.5"} /></div>
          <div><label className="label">Winner</label><select name="winningPairId" required className={inputCls + " mt-1.5"}>{pairs.map((p) => <option key={p.id} value={p.id}>{p.name ?? `${p.player1Name} & ${p.player2Name}`}</option>)}</select></div>
          <div><label className="label">Beat (optional)</label><select name="opponentPairId" className={inputCls + " mt-1.5"}><option value="">— Not recorded —</option>{pairs.map((p) => <option key={p.id} value={p.id}>{p.name ?? `${p.player1Name} & ${p.player2Name}`}</option>)}</select></div>
          <div><label className="label">Score (optional)</label><input name="scoreNote" placeholder="e.g. 5-3" className={inputCls + " mt-1.5"} /></div>
          <div><label className="label">MVP (optional)</label><select name="mvpPlayerId" className={inputCls + " mt-1.5"}><option value="">— None —</option>{players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="md:col-span-3"><label className="label">Notes</label><input name="notes" placeholder="optional" className={inputCls + " mt-1.5"} /></div>
          <div className="md:col-span-3"><button className="btn-primary" disabled={isPending}>Save winner</button></div>
        </form>
      )}

      <div className="space-y-3">
        {results.length === 0 && <div className="panel p-6 text-center text-sm text-chalk/50">No 2v2 results yet.</div>}
        {results.map((r) => editingResultId === r.id ? (
          <form key={r.id} action={(fd) => startTransition(async () => { const res = await updateResult(fd); if (res.ok) setEditingResultId(null); else setMessage(res.error ?? "Couldn't save."); })}
            className="panel p-4 grid sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
            <input type="hidden" name="id" value={r.id} />
            <div><label className="label">Date</label><input name="date" type="date" defaultValue={r.date.slice(0, 10)} className={inputCls} /></div>
            <div><label className="label">Winner</label><select name="winningPairId" defaultValue={r.winningPairId} className={inputCls}>{pairs.map((p) => <option key={p.id} value={p.id}>{p.name ?? `${p.player1Name} & ${p.player2Name}`}</option>)}</select></div>
            <div><label className="label">Beat</label><select name="opponentPairId" defaultValue={r.opponentPairId ?? ""} className={inputCls}><option value="">— Not recorded —</option>{pairs.map((p) => <option key={p.id} value={p.id}>{p.name ?? `${p.player1Name} & ${p.player2Name}`}</option>)}</select></div>
            <div><label className="label">Score</label><input name="scoreNote" defaultValue={r.scoreNote ?? ""} className={inputCls} /></div>
            <div><label className="label">MVP</label><select name="mvpPlayerId" defaultValue={r.mvpPlayerId ?? ""} className={inputCls}><option value="">— None —</option>{players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            <div><label className="label">Notes</label><input name="notes" defaultValue={r.notes ?? ""} className={inputCls} /></div>
            <div className="flex gap-2"><button className="btn-primary" disabled={isPending}>Save</button><button type="button" onClick={() => setEditingResultId(null)} className="btn-secondary">Cancel</button></div>
          </form>
        ) : (
          <div key={r.id} className="panel p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs text-chalk/50">{new Date(r.date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</div>
              <div className="font-display font-bold">{r.winningPairLabel} {r.opponentPairLabel && <span className="text-chalk/40 font-normal text-sm">beat {r.opponentPairLabel}</span>}</div>
              {r.mvpPlayerName && <div className="text-xs text-gold mt-0.5">MVP: {r.mvpPlayerName}</div>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingResultId(r.id)} className="text-sm font-medium underline">Edit</button>
              <button onClick={() => { if (confirm("Delete this result?")) startTransition(() => deleteResult(r.id)); }} disabled={isPending} className="text-sm font-medium text-red-400 underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
