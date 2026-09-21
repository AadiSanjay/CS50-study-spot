import type { SupabaseClient } from "@supabase/supabase-js";
import type { Checkin, RatingSummary, Review, Spot } from "./types";

export async function getSpots(supabase: SupabaseClient): Promise<Spot[]> {
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .order("name");
  if (error) throw error;
  return data as Spot[];
}

export async function getSpot(
  supabase: SupabaseClient,
  id: string
): Promise<Spot | null> {
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Spot | null;
}

export async function getRatingSummary(
  supabase: SupabaseClient,
  spotId: string
): Promise<RatingSummary> {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating, noise_rating, wifi_rating")
    .eq("spot_id", spotId);
  if (error) throw error;

  if (!data || data.length === 0) {
    return { avgRating: null, avgNoise: null, avgWifi: null, count: 0 };
  }

  const count = data.length;
  const sum = (key: "rating" | "noise_rating" | "wifi_rating") =>
    data.reduce((acc, r) => acc + (r[key] as number), 0) / count;

  return {
    avgRating: round1(sum("rating")),
    avgNoise: round1(sum("noise_rating")),
    avgWifi: round1(sum("wifi_rating")),
    count,
  };
}

export async function getAllRatingSummaries(
  supabase: SupabaseClient
): Promise<Record<string, RatingSummary>> {
  const { data, error } = await supabase
    .from("reviews")
    .select("spot_id, rating, noise_rating, wifi_rating");
  if (error) throw error;

  const grouped: Record<
    string,
    { ratingSum: number; noiseSum: number; wifiSum: number; count: number }
  > = {};

  for (const r of data ?? []) {
    const g = grouped[r.spot_id] ?? {
      ratingSum: 0,
      noiseSum: 0,
      wifiSum: 0,
      count: 0,
    };
    g.ratingSum += r.rating;
    g.noiseSum += r.noise_rating;
    g.wifiSum += r.wifi_rating;
    g.count += 1;
    grouped[r.spot_id] = g;
  }

  const result: Record<string, RatingSummary> = {};
  for (const [spotId, g] of Object.entries(grouped)) {
    result[spotId] = {
      avgRating: round1(g.ratingSum / g.count),
      avgNoise: round1(g.noiseSum / g.count),
      avgWifi: round1(g.wifiSum / g.count),
      count: g.count,
    };
  }
  return result;
}

export async function getReviews(
  supabase: SupabaseClient,
  spotId: string
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("spot_id", spotId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Review[];
}

export async function getRecentCheckins(
  supabase: SupabaseClient,
  spotId: string
): Promise<Checkin[]> {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("spot_id", spotId)
    .gte("created_at", twoHoursAgo)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Checkin[];
}

export async function getAllRecentCheckins(
  supabase: SupabaseClient
): Promise<Record<string, Checkin[]>> {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .gte("created_at", twoHoursAgo);
  if (error) throw error;

  const grouped: Record<string, Checkin[]> = {};
  for (const c of (data as Checkin[]) ?? []) {
    (grouped[c.spot_id] ??= []).push(c);
  }
  return grouped;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
