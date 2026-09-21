export type Category = "cafe" | "study_space";
export type Level = "none" | "some" | "plenty";
export type FoodPolicy = "none" | "covered drinks" | "food OK";
export type Lighting = "natural light" | "mixed" | "fluorescent";

export type Zone = {
  name: string;
  floor: string;
  noise: number;
  vibe: string;
};

export type Amenities = {
  whiteboards: boolean;
  printing: boolean;
  outlets: boolean;
  monitors: boolean;
  group_tables: boolean;
  accessibility: boolean;
};

export type ReservableRooms = {
  count: number;
  link: string | null;
};

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
  // Study-space detail (null for cafes)
  zones: Zone[] | null;
  food_policy: FoodPolicy | null;
  capacity: number | null;
  reservable_rooms: ReservableRooms | null;
  lighting: Lighting | null;
  amenities: Amenities | null;
  late_night: boolean | null;
  access_notes: string | null;
  best_for: string[] | null;
  nearby_cafe_id: string | null;
  // Cafe detail (null for study spaces)
  highlights: string[] | null;
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
