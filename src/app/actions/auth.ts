"use server";

import { verifyAdminLogin, createSession, destroySession } from "@/lib/auth";
import { logActivity } from "@/lib/data";
import { redirect } from "next/navigation";

export async function loginAction(
  _prevState: { ok: boolean; error: string },
  formData: FormData
): Promise<{ ok: boolean; error: string }> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const admin = await verifyAdminLogin(username, password);
  if (!admin) return { ok: false, error: "Incorrect username or password." };
  await createSession(admin.id);
  await logActivity("Admin signed in", username);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
