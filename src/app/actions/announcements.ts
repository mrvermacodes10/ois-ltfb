"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { refreshPublicPages } from "@/lib/revalidate";
import { revalidatePath } from "next/cache";

function parseFields(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
    date: formData.get("date") ? new Date(String(formData.get("date"))) : new Date(),
  };
}

export async function createAnnouncement(formData: FormData) {
  await requireAdmin();
  const data = parseFields(formData);
  if (!data.title || !data.body) return { ok: false, error: "Title and body are required." };
  await prisma.announcement.create({ data });
  await logActivity("Posted announcement", data.title);
  revalidatePath("/admin/announcements");
  refreshPublicPages();
  return { ok: true };
}

export async function updateAnnouncement(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const data = parseFields(formData);
  if (!data.title || !data.body) return { ok: false, error: "Title and body are required." };
  await prisma.announcement.update({ where: { id }, data });
  revalidatePath("/admin/announcements");
  refreshPublicPages();
  return { ok: true };
}

export async function deleteAnnouncement(id: string) {
  await requireAdmin();
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/admin/announcements");
  refreshPublicPages();
}
