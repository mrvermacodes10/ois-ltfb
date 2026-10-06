"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { refreshPublicPages } from "@/lib/revalidate";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  const data = {
    leagueName: String(formData.get("leagueName") ?? "").trim() || "OIS Lunchtime Footy",
    shortName: String(formData.get("shortName") ?? "").trim() || "LTFB",
    currentSeasonLabel: String(formData.get("currentSeasonLabel") ?? "").trim() || "2026/27",
    heroTitle: String(formData.get("heroTitle") ?? "").trim() || "OIS LUNCHTIME FOOTY",
    heroSubtitle: String(formData.get("heroSubtitle") ?? "").trim() || "The home of everything LTFB",
    announcementBanner: String(formData.get("announcementBanner") ?? "").trim() || null,
    footerText: String(formData.get("footerText") ?? "").trim() || "OIS Lunchtime Footy.",
    pointsForWin: parseInt(String(formData.get("pointsForWin") ?? "3"), 10) || 0,
    pointsForDraw: parseInt(String(formData.get("pointsForDraw") ?? "1"), 10) || 0,
    pointsForLoss: parseInt(String(formData.get("pointsForLoss") ?? "0"), 10) || 0,
    playerIdInfo: String(formData.get("playerIdInfo") ?? "").trim() || null,
    showAwards: formData.get("showAwards") === "on",
    showHistory: formData.get("showHistory") === "on",
    show2v2: formData.get("show2v2") === "on",
    showAnnouncements: formData.get("showAnnouncements") === "on",
    featuredPlayerId: String(formData.get("featuredPlayerId") ?? "") || null,
    featuredMatchId: String(formData.get("featuredMatchId") ?? "") || null,
    featuredTeamId: String(formData.get("featuredTeamId") ?? "") || null,
  };
  await prisma.siteSettings.upsert({ where: { id: "singleton" }, update: data, create: { id: "singleton", ...data } });
  await logActivity("Updated settings");
  revalidatePath("/admin/settings");
  refreshPublicPages();
  return { ok: true };
}
