import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/data";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const [settings, players, teams] = await Promise.all([
    getSettings(),
    prisma.player.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.team.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-4">Settings</h1>
      <SettingsForm settings={settings} players={players.map((p) => ({ id: p.id, name: p.name }))} teams={teams.map((t) => ({ id: t.id, name: t.name }))} />
    </div>
  );
}
