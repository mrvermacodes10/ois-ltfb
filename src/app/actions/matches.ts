"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { refreshPublicPages } from "@/lib/revalidate";
import { revalidatePath } from "next/cache";
import { isMatchStatus } from "@/lib/enums";

export async function createMatch(formData: FormData) {
  await requireAdmin();
  const seasonId = String(formData.get("seasonId") ?? "");
  const teamAId = String(formData.get("teamAId") ?? "");
  const teamBId = String(formData.get("teamBId") ?? "");
  const dateRaw = String(formData.get("date") ?? "");
  if (!seasonId || !teamAId || !teamBId || !dateRaw) return { ok: false, error: "Season, both teams, and a date are required." };
  if (teamAId === teamBId) return { ok: false, error: "A match needs two different teams." };
  const time = String(formData.get("time") ?? "").trim() || null;

  await prisma.match.create({ data: { seasonId, teamAId, teamBId, date: new Date(dateRaw), time } });
  await logActivity("Created match");
  revalidatePath("/admin/matches");
  refreshPublicPages();
  return { ok: true };
}

export async function updateMatch(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const dateRaw = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const photoUrl = String(formData.get("photoUrl") ?? "").trim() || null;
  await prisma.match.update({
    where: { id },
    data: { date: dateRaw ? new Date(dateRaw) : undefined, time, notes, photoUrl },
  });
  revalidatePath("/admin/matches");
  refreshPublicPages();
  return { ok: true };
}

// The fast path: score + status, one save.
export async function enterResult(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const scoreARaw = String(formData.get("scoreA") ?? "");
  const scoreBRaw = String(formData.get("scoreB") ?? "");
  const statusRaw = String(formData.get("status") ?? "COMPLETED");
  const status = isMatchStatus(statusRaw) ? statusRaw : "COMPLETED";
  const scoreA = scoreARaw === "" ? null : parseInt(scoreARaw, 10);
  const scoreB = scoreBRaw === "" ? null : parseInt(scoreBRaw, 10);
  if (status === "COMPLETED" && (scoreA === null || scoreB === null || isNaN(scoreA) || isNaN(scoreB))) {
    return { ok: false, error: "Enter both scores to mark this match completed." };
  }
  await prisma.match.update({ where: { id }, data: { scoreA, scoreB, status } });
  await logActivity("Entered match result", scoreA !== null ? `${scoreA} – ${scoreB}` : undefined);
  revalidatePath("/admin/matches");
  refreshPublicPages();
  return { ok: true };
}

export async function deleteMatch(id: string) {
  await requireAdmin();
  await prisma.match.delete({ where: { id } }); // events/motms cascade
  await logActivity("Deleted match");
  revalidatePath("/admin/matches");
  refreshPublicPages();
}

export async function addStatEvent(matchId: string, playerId: string, type: "GOAL" | "ASSIST") {
  await requireAdmin();
  await prisma.matchEvent.create({ data: { matchId, playerId, type } });
  revalidatePath("/admin/matches");
  refreshPublicPages();
}

export async function removeLastStatEvent(matchId: string, playerId: string, type: "GOAL" | "ASSIST") {
  await requireAdmin();
  const last = await prisma.matchEvent.findFirst({ where: { matchId, playerId, type }, orderBy: { createdAt: "desc" } });
  if (last) await prisma.matchEvent.delete({ where: { id: last.id } });
  revalidatePath("/admin/matches");
  refreshPublicPages();
}

export async function toggleMotm(matchId: string, playerId: string) {
  await requireAdmin();
  const existing = await prisma.matchMotm.findUnique({ where: { matchId_playerId: { matchId, playerId } } });
  if (existing) {
    await prisma.matchMotm.delete({ where: { id: existing.id } });
    await logActivity("Removed MOTM");
  } else {
    await prisma.matchMotm.create({ data: { matchId, playerId } });
    await logActivity("Set MOTM");
  }
  revalidatePath("/admin/matches");
  revalidatePath("/admin/motm");
  refreshPublicPages();
}
