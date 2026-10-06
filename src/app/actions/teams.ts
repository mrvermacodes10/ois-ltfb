"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { refreshPublicPages } from "@/lib/revalidate";
import { revalidatePath } from "next/cache";

export async function createTeam(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Team name is required." };
  const logoUrl = String(formData.get("logoUrl") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  try {
    await prisma.team.create({ data: { name, logoUrl, description } });
  } catch {
    return { ok: false, error: "A team with that name already exists." };
  }
  await logActivity("Created team", name);
  revalidatePath("/admin/teams");
  refreshPublicPages();
  return { ok: true };
}

export async function updateTeam(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Team name is required." };
  const logoUrl = String(formData.get("logoUrl") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const active = formData.get("active") === "on";
  await prisma.team.update({ where: { id }, data: { name, logoUrl, description, active } });
  await logActivity("Edited team", name);
  revalidatePath("/admin/teams");
  refreshPublicPages();
  return { ok: true };
}

export async function deleteTeam(id: string) {
  await requireAdmin();
  const team = await prisma.team.findUnique({ where: { id } });
  const playerCount = await prisma.player.count({ where: { teamId: id } });
  if (playerCount > 0) {
    return { ok: false, error: `This team still has ${playerCount} player(s) assigned. Reassign them first.` };
  }
  try {
    await prisma.team.delete({ where: { id } });
  } catch {
    return { ok: false, error: "This team can't be deleted — it's still referenced by a match or award." };
  }
  await logActivity("Deleted team", team?.name ?? id);
  revalidatePath("/admin/teams");
  refreshPublicPages();
  return { ok: true };
}
