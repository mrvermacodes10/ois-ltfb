"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { refreshPublicPages } from "@/lib/revalidate";
import { revalidatePath } from "next/cache";

export async function createPair(formData: FormData) {
  await requireAdmin();
  const player1Id = String(formData.get("player1Id") ?? "");
  const player2Id = String(formData.get("player2Id") ?? "");
  if (!player1Id || !player2Id) return { ok: false, error: "Select two players." };
  if (player1Id === player2Id) return { ok: false, error: "A pair needs two different players." };
  const name = String(formData.get("name") ?? "").trim() || null;
  await prisma.twoVTwoPair.create({ data: { name, player1Id, player2Id } });
  await logActivity("Created 2v2 pair");
  revalidatePath("/admin/2v2");
  refreshPublicPages();
  return { ok: true };
}

export async function updatePair(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const player1Id = String(formData.get("player1Id") ?? "");
  const player2Id = String(formData.get("player2Id") ?? "");
  if (player1Id && player2Id && player1Id === player2Id) return { ok: false, error: "A pair needs two different players." };
  const name = String(formData.get("name") ?? "").trim() || null;
  const active = formData.get("active") === "on";
  await prisma.twoVTwoPair.update({ where: { id }, data: { name, player1Id: player1Id || undefined, player2Id: player2Id || undefined, active } });
  revalidatePath("/admin/2v2");
  refreshPublicPages();
  return { ok: true };
}

export async function deletePair(id: string) {
  await requireAdmin();
  const resultCount = await prisma.twoVTwoResult.count({ where: { OR: [{ winningPairId: id }, { opponentPairId: id }] } });
  if (resultCount > 0) {
    return { ok: false, error: `This pair has ${resultCount} result(s) recorded. Deactivate instead, to keep history intact.` };
  }
  try {
    await prisma.twoVTwoPair.delete({ where: { id } });
  } catch {
    return { ok: false, error: "This pair can't be deleted — it's still referenced somewhere." };
  }
  await logActivity("Deleted 2v2 pair");
  revalidatePath("/admin/2v2");
  refreshPublicPages();
  return { ok: true };
}

export async function recordResult(formData: FormData) {
  await requireAdmin();
  const seasonId = String(formData.get("seasonId") ?? "");
  const winningPairId = String(formData.get("winningPairId") ?? "");
  const dateRaw = String(formData.get("date") ?? "");
  if (!seasonId || !winningPairId || !dateRaw) return { ok: false, error: "Season, winner, and date are required." };
  const opponentPairId = String(formData.get("opponentPairId") ?? "") || null;
  if (opponentPairId === winningPairId) return { ok: false, error: "Winner and opponent must be different pairs." };
  const scoreNote = String(formData.get("scoreNote") ?? "").trim() || null;
  const mvpPlayerId = String(formData.get("mvpPlayerId") ?? "") || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await prisma.twoVTwoResult.create({
    data: { seasonId, winningPairId, opponentPairId, date: new Date(dateRaw), scoreNote, mvpPlayerId, notes },
  });
  await logActivity("Recorded 2v2 winner");
  revalidatePath("/admin/2v2");
  refreshPublicPages();
  return { ok: true };
}

export async function updateResult(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const winningPairId = String(formData.get("winningPairId") ?? "");
  const dateRaw = String(formData.get("date") ?? "");
  const opponentPairId = String(formData.get("opponentPairId") ?? "") || null;
  if (opponentPairId && opponentPairId === winningPairId) return { ok: false, error: "Winner and opponent must be different pairs." };
  const scoreNote = String(formData.get("scoreNote") ?? "").trim() || null;
  const mvpPlayerId = String(formData.get("mvpPlayerId") ?? "") || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await prisma.twoVTwoResult.update({
    where: { id },
    data: { winningPairId: winningPairId || undefined, opponentPairId, date: dateRaw ? new Date(dateRaw) : undefined, scoreNote, mvpPlayerId, notes },
  });
  revalidatePath("/admin/2v2");
  refreshPublicPages();
  return { ok: true };
}

export async function deleteResult(id: string) {
  await requireAdmin();
  await prisma.twoVTwoResult.delete({ where: { id } });
  await logActivity("Deleted 2v2 result");
  revalidatePath("/admin/2v2");
  refreshPublicPages();
}
