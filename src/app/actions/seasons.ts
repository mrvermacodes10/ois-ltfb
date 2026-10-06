"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { refreshPublicPages } from "@/lib/revalidate";
import { revalidatePath } from "next/cache";

// Creating a new season NEVER deletes anything — old Matches/Awards/2v2
// results keep pointing at their original Season, preserving history.
export async function createSeason(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Season name is required." };
  const makeCurrent = formData.get("makeCurrent") === "on";

  if (makeCurrent) {
    await prisma.season.updateMany({ data: { isCurrent: false }, where: {} });
  }
  try {
    await prisma.season.create({ data: { name, isCurrent: makeCurrent } });
  } catch {
    return { ok: false, error: "A season with that name already exists." };
  }
  await logActivity("Created season", name);
  revalidatePath("/admin/seasons");
  refreshPublicPages();
  return { ok: true };
}

export async function setCurrentSeason(id: string) {
  await requireAdmin();
  await prisma.$transaction([
    prisma.season.updateMany({ data: { isCurrent: false }, where: {} }),
    prisma.season.update({ where: { id }, data: { isCurrent: true } }),
  ]);
  revalidatePath("/admin/seasons");
  refreshPublicPages();
}

export async function deleteSeason(id: string) {
  await requireAdmin();
  const matchCount = await prisma.match.count({ where: { seasonId: id } });
  if (matchCount > 0) {
    return { ok: false, error: `This season has ${matchCount} match(es) recorded. It can't be deleted — this preserves history.` };
  }
  await prisma.season.delete({ where: { id } });
  revalidatePath("/admin/seasons");
  refreshPublicPages();
  return { ok: true };
}
