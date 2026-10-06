"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { refreshPublicPages } from "@/lib/revalidate";
import { revalidatePath } from "next/cache";

export async function createPlayer(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };
  const ltfbId = String(formData.get("ltfbId") ?? "").trim() || null;
  const teamId = String(formData.get("teamId") ?? "") || null;
  const position = String(formData.get("position") ?? "").trim() || null;
  const photoUrl = String(formData.get("photoUrl") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;

  await prisma.player.create({ data: { name, ltfbId, teamId, position, photoUrl, bio } });
  await logActivity("Created player", name);
  revalidatePath("/admin/players");
  refreshPublicPages();
  return { ok: true };
}

export async function updatePlayer(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };
  const ltfbId = String(formData.get("ltfbId") ?? "").trim() || null;
  const teamId = String(formData.get("teamId") ?? "") || null;
  const position = String(formData.get("position") ?? "").trim() || null;
  const photoUrl = String(formData.get("photoUrl") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const active = formData.get("active") === "on";

  await prisma.player.update({ where: { id }, data: { name, ltfbId, teamId, position, photoUrl, bio, active } });
  await logActivity("Edited player", name);
  revalidatePath("/admin/players");
  refreshPublicPages();
  return { ok: true };
}

export async function deletePlayer(id: string) {
  await requireAdmin();
  const player = await prisma.player.findUnique({ where: { id } });
  try {
    await prisma.player.delete({ where: { id } });
  } catch {
    return { ok: false, error: "This player can't be deleted — they're still referenced (match events, MOTMs, a 2v2 pair, etc.). Deactivate them instead." };
  }
  await logActivity("Deleted player", player?.name ?? id);
  revalidatePath("/admin/players");
  refreshPublicPages();
  return { ok: true };
}
