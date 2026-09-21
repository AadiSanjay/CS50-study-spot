// One-off seed script: pushes data/spots.json into the Supabase `spots` table.
// Run with: npm run seed (requires SUPABASE_SERVICE_ROLE_KEY in .env.local)
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function main() {
  const file = path.join(process.cwd(), "data", "spots.json");
  const spots = JSON.parse(fs.readFileSync(file, "utf-8"));

  const { error, count } = await supabase
    .from("spots")
    .upsert(spots, { onConflict: "id", count: "exact" });

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`Seeded ${count ?? spots.length} spots into Supabase.`);
}

main();
