"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings";

type Settings = {
  leagueName: string; shortName: string; currentSeasonLabel: string;
  heroTitle: string; heroSubtitle: string; announcementBanner: string | null; footerText: string;
  pointsForWin: number; pointsForDraw: number; pointsForLoss: number;
  playerIdInfo: string | null;
  showAwards: boolean; showHistory: boolean; show2v2: boolean; showAnnouncements: boolean;
  featuredPlayerId: string | null; featuredTeamId: string | null;
};
type Option = { id: string; name: string };
const inputCls = "input";

export default function SettingsForm({ settings, players, teams }: { settings: Settings; players: Option[]; teams: Option[] }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form action={(fd) => startTransition(async () => { await updateSettings(fd); setSaved(true); setTimeout(() => setSaved(false), 2500); })} className="space-y-6 max-w-3xl">
      <section className="panel p-5 space-y-4">
        <h2 className="font-display font-bold">League identity</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">League name</label><input name="leagueName" defaultValue={settings.leagueName} className={inputCls + " mt-1.5"} /></div>
          <div><label className="label">Short name</label><input name="shortName" defaultValue={settings.shortName} className={inputCls + " mt-1.5"} /></div>
          <div><label className="label">Current season label</label><input name="currentSeasonLabel" defaultValue={settings.currentSeasonLabel} className={inputCls + " mt-1.5"} /></div>
        </div>
      </section>

      <section className="panel p-5 space-y-4">
        <h2 className="font-display font-bold">Homepage content</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Hero title</label><input name="heroTitle" defaultValue={settings.heroTitle} className={inputCls + " mt-1.5"} /></div>
          <div><label className="label">Hero subtitle</label><input name="heroSubtitle" defaultValue={settings.heroSubtitle} className={inputCls + " mt-1.5"} /></div>
        </div>
        <div><label className="label">Announcement banner</label><input name="announcementBanner" defaultValue={settings.announcementBanner ?? ""} placeholder="Leave blank to hide" className={inputCls + " mt-1.5"} /></div>
        <div><label className="label">Footer text</label><input name="footerText" defaultValue={settings.footerText} className={inputCls + " mt-1.5"} /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Featured player</label>
            <select name="featuredPlayerId" defaultValue={settings.featuredPlayerId ?? ""} className={inputCls + " mt-1.5"}>
              <option value="">— None —</option>{players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><label className="label">Featured team</label>
            <select name="featuredTeamId" defaultValue={settings.featuredTeamId ?? ""} className={inputCls + " mt-1.5"}>
              <option value="">— None —</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="panel p-5 space-y-4">
        <h2 className="font-display font-bold">Standings scoring</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className="label">Points for win</label><input name="pointsForWin" type="number" defaultValue={settings.pointsForWin} className={inputCls + " mt-1.5"} /></div>
          <div><label className="label">Points for draw</label><input name="pointsForDraw" type="number" defaultValue={settings.pointsForDraw} className={inputCls + " mt-1.5"} /></div>
          <div><label className="label">Points for loss</label><input name="pointsForLoss" type="number" defaultValue={settings.pointsForLoss} className={inputCls + " mt-1.5"} /></div>
        </div>
      </section>

      <section className="panel p-5 space-y-4">
        <h2 className="font-display font-bold">Player ID / registration info</h2>
        <textarea name="playerIdInfo" defaultValue={settings.playerIdInfo ?? ""} rows={4} className={inputCls} placeholder="Registration instructions, Player ID info, etc." />
      </section>

      <section className="panel p-5 space-y-3">
        <h2 className="font-display font-bold">Page visibility</h2>
        {[
          ["showAwards", "Show Awards page", settings.showAwards],
          ["showHistory", "Show History page", settings.showHistory],
          ["show2v2", "Show 2v2 League", settings.show2v2],
          ["showAnnouncements", "Show Announcements", settings.showAnnouncements],
        ].map(([name, label, checked]) => (
          <label key={name as string} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name={name as string} defaultChecked={checked as boolean} /> {label as string}
          </label>
        ))}
      </section>

      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={isPending}>{isPending ? "Saving…" : "Save settings"}</button>
        {saved && <span className="text-sm text-green-lunch">Saved.</span>}
      </div>
    </form>
  );
}
