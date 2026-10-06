"use client";

import { useState, useTransition } from "react";
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/app/actions/announcements";

type Announcement = { id: string; title: string; body: string; imageUrl: string | null; published: boolean; featured: boolean; date: string };
const inputCls = "input";

export default function AnnouncementsAdmin({ announcements }: { announcements: Announcement[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Announcements</h1>
        <button className="btn-primary" onClick={() => setShowAdd((v) => !v)}>{showAdd ? "Close" : "+ Post announcement"}</button>
      </div>

      {showAdd && <AnnouncementForm
        onSubmit={(fd) => startTransition(async () => { const res = await createAnnouncement(fd); if (res.ok) setShowAdd(false); else setMessage(res.error ?? "Couldn't post."); })}
        submitLabel="Post" isPending={isPending} />}

      {message && <div className="rounded-md px-3 py-2 text-sm mb-4 bg-red-500/10 text-red-300">{message}</div>}

      <div className="space-y-4">
        {announcements.length === 0 && <div className="panel p-6 text-center text-sm text-chalk/50">No announcements yet.</div>}
        {announcements.map((a) => editingId === a.id ? (
          <div key={a.id} className="panel p-4">
            <AnnouncementForm announcement={a}
              onSubmit={(fd) => startTransition(async () => { const res = await updateAnnouncement(fd); if (res.ok) setEditingId(null); else setMessage(res.error ?? "Couldn't save."); })}
              submitLabel="Save" isPending={isPending} onCancel={() => setEditingId(null)} />
          </div>
        ) : (
          <div key={a.id} className="panel p-4">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <div className="font-display font-bold flex items-center gap-2">
                  {a.title}
                  {a.featured && <span className="badge-status bg-gold/20 text-gold">FEATURED</span>}
                  {!a.published && <span className="badge-status bg-chalk/10 text-chalk/50">UNPUBLISHED</span>}
                </div>
                <p className="text-sm text-chalk/60 mt-1 max-w-xl">{a.body}</p>
              </div>
              <span className="text-xs text-chalk/40">{new Date(a.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
            <div className="mt-3 flex gap-3">
              <button onClick={() => setEditingId(a.id)} className="text-sm font-medium underline">Edit</button>
              <button onClick={() => { if (confirm(`Delete "${a.title}"?`)) startTransition(() => deleteAnnouncement(a.id)); }} disabled={isPending} className="text-sm font-medium text-red-400 underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnnouncementForm({ announcement, onSubmit, submitLabel, isPending, onCancel }: {
  announcement?: Announcement; onSubmit: (fd: FormData) => void; submitLabel: string; isPending: boolean; onCancel?: () => void;
}) {
  return (
    <form action={onSubmit} className={announcement ? "space-y-3" : "panel p-4 mb-5 space-y-3"}>
      {announcement && <input type="hidden" name="id" value={announcement.id} />}
      <div><label className="label">Title</label><input name="title" defaultValue={announcement?.title ?? ""} required className={inputCls + " mt-1.5"} /></div>
      <div><label className="label">Body</label><textarea name="body" defaultValue={announcement?.body ?? ""} required rows={3} className={inputCls + " mt-1.5"} /></div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Image URL</label><input name="imageUrl" defaultValue={announcement?.imageUrl ?? ""} className={inputCls + " mt-1.5"} /></div>
        <div><label className="label">Date</label><input name="date" type="date" defaultValue={(announcement?.date ?? new Date().toISOString()).slice(0, 10)} className={inputCls + " mt-1.5"} /></div>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" name="published" defaultChecked={announcement?.published ?? true} /> Published</label>
        <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" name="featured" defaultChecked={announcement?.featured ?? false} /> Featured on homepage</label>
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" disabled={isPending}>{isPending ? "Saving…" : submitLabel}</button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
      </div>
    </form>
  );
}
