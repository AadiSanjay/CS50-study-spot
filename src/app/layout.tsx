import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Perch — UIUC cafés & study spots",
  description:
    "Find a good perch near UIUC: rate cafés and study spaces, and see how busy they are right now.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-10 bg-cream/90 backdrop-blur-sm border-b border-cream-300">
            <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">🪶</span>
                <span className="font-serif text-xl text-perch-700">
                  Perch
                </span>
              </Link>
              {user ? (
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="text-sm text-ink-soft hover:text-perch-700 transition-colors"
                  >
                    Sign out
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium text-perch-700 hover:text-perch-900 transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>
          </header>
          <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6">
            {children}
          </main>
          <footer className="mx-auto max-w-3xl px-4 py-8 text-xs text-ink-soft/70">
            Made for UIUC students. Spot data may be out of date — always
            check a spot&apos;s own site for current hours.
          </footer>
        </div>
      </body>
    </html>
  );
}
