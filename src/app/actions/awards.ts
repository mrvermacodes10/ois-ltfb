"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { refreshPublicPages } from "@/lib/revalidate";
import { revalidatePath } from "next/cache";

function parseAwardFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    playerId: String(formData.get("playerId") ?? "") || null,
    teamId: String(formData.get("teamId") ?? "") || null,
    seasonId: String(formData.get("seasonId") ?? "") || null,
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
    date: formData.get("date") ? new Date(String(formData.get("date"))) : new Date(),
  };
}

export async function createAward(formData: FormData) {
  await requireAdmin();
  const data = parseAwardFields(formData);
  if (!data.name) return { ok: false, error: "Award name is required." };
  await prisma.award.create({ data });
  await logActivity("Created award", data.name);
  revalidatePath("/admin/awards");
  refreshPublicPages();
  return { ok: true };
}

export async function updateAward(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const data = parseAwardFields(formData);
  if (!data.name) return { ok: false, error: "Award name is required." };
  await prisma.award.update({ where: { id }, data });
  revalidatePath("/admin/awards");
  refreshPublicPages();
  return { ok: true };
}

export async function deleteAward(id: string) {
  await requireAdmin();
  await prisma.award.delete({ where: { id } });
  revalidatePath("/admin/awards");
  refreshPublicPages();
}
