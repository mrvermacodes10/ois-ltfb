import { getSettings } from "@/lib/data";
import NavBar from "@/components/NavBar";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <div className="min-h-screen flex flex-col bg-pitch-black text-chalk">
      <NavBar leagueShortName={settings.shortName} visibility={{ showAwards: settings.showAwards, showHistory: settings.showHistory, show2v2: settings.show2v2, showAnnouncements: settings.showAnnouncements }} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-chalk/10 pitch-texture">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="font-display font-extrabold">{settings.leagueName.toUpperCase()}</div>
            <p className="text-sm text-chalk/50 mt-1">{settings.footerText}</p>
          </div>
          <p className="text-xs text-chalk/30">{settings.currentSeasonLabel}</p>
        </div>
      </footer>
    </div>
  );
}
