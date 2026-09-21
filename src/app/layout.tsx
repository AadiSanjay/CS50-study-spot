import type { Metadata } from "next";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/components/ThemeProvider";

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
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <header
              className="sticky top-0 z-20 backdrop-blur-sm border-b"
              style={{ background: "color-mix(in srgb, var(--atmo-bg) 90%, transparent)", borderColor: "var(--atmo-line)" }}
            >
              <div className="mx-auto max-w-3xl lg:max-w-6xl px-4 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                  <span className="text-2xl">🪶</span>
                  <span className="font-serif text-xl" style={{ color: "var(--atmo-accent)" }}>
                    Perch
                  </span>
                </Link>
                {user ? (
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="text-sm hover:underline"
                      style={{ color: "var(--atmo-text-soft)" }}
                    >
                      Sign out
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/login"
                    className="text-sm font-medium hover:underline"
                    style={{ color: "var(--atmo-accent)" }}
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </header>
            <main className="flex-1 mx-auto w-full max-w-3xl lg:max-w-6xl px-4 py-6">
              {children}
            </main>
            <footer className="mx-auto max-w-3xl lg:max-w-6xl px-4 py-8 text-xs text-ink-soft/70">
              Made for UIUC students. Spot data may be out of date — always
              check a spot&apos;s own site for current hours.
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
