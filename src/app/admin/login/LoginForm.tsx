"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "@/app/actions/auth";

const initialState = { ok: false, error: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label">Username</label>
        <input name="username" required autoFocus className="input mt-1.5" />
      </div>
      <div>
        <label className="label">Password</label>
        <input type="password" name="password" required className="input mt-1.5" />
      </div>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
