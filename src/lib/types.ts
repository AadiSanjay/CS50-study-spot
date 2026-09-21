export type Category = "cafe" | "study_space";
export type Level = "none" | "some" | "plenty";

export type DayHours = { open: string; close: string } | { closed: true };

export type Hours = {
  mon: DayHours;
  tue: DayHours;
  wed: DayHours;
  thu: DayHours;
  fri: DayHours;
  sat: DayHours;
  sun: DayHours;
};

export type Spot = {
  id: string;
  name: string;
  category: Category;
  address: string;
  lat: number;
  lng: number;
  hours: Hours;
  wifi: Level;
  outlets: Level;
  noise: number;
  tags: string[];
  source_url: string | null;
};

export type Review = {
  id: string;
  spot_id: string;
  user_id: string;
  rating: number;
  noise_rating: number;
  wifi_rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type Checkin = {
  id: string;
  spot_id: string;
  user_id: string;
  busyness: number;
  created_at: string;
};

export type RatingSummary = {
  avgRating: number | null;
  avgNoise: number | null;
  avgWifi: number | null;
  count: number;
};

export type BusynessResult = {
  level: number; // 1-5, rounded
  basis: "reports" | "typical";
  sampleSize: number;
};
