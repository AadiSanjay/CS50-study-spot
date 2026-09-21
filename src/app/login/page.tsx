"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createSupabaseBrowserClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl}/auth/confirm` },
    });

    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-3xl mb-2">Sign in</h1>
      <p className="text-ink-soft mb-6">
        We&apos;ll email you a magic link — no password needed.
      </p>

      {status === "sent" ? (
        <div className="card p-5">
          <p className="font-medium text-perch-700">Check your inbox</p>
          <p className="text-sm text-ink-soft mt-1">
            We sent a sign-in link to {email}.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="netid@illinois.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-perch-400"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-xl bg-perch-600 text-cream-50 py-3 font-medium hover:bg-perch-700 transition-colors disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>
          {status === "error" && (
            <p className="text-sm text-clay">
              Something went wrong. Try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
