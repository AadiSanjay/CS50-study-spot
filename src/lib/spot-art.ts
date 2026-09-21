// Deterministic gradient "header art" per spot, derived from its id/category —
// no stock photography, no network fetch, same art every time for a given spot.

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const CAFE_HUES = [18, 28, 340, 355, 8]; // warm amber / terracotta / rose
const STUDY_HUES = [150, 165, 190, 205, 130]; // green / teal / blue

export function spotArtStyle(id: string, category: "cafe" | "study_space") {
  const h = hash(id);
  const hues = category === "cafe" ? CAFE_HUES : STUDY_HUES;
  const hue1 = hues[h % hues.length];
  const hue2 = hues[(h >> 3) % hues.length];
  const x1 = 10 + (h % 60);
  const y1 = 10 + ((h >> 4) % 50);
  const x2 = 100 - (h % 50);
  const y2 = 100 - ((h >> 6) % 60);

  const bg =
    category === "cafe"
      ? `radial-gradient(circle at ${x1}% ${y1}%, hsla(${hue1},70%,72%,0.9), transparent 60%),` +
        `radial-gradient(circle at ${x2}% ${y2}%, hsla(${hue2},65%,60%,0.8), transparent 55%),` +
        `linear-gradient(135deg, hsl(${hue1},45%,88%), hsl(${hue2},40%,80%))`
      : `radial-gradient(circle at ${x1}% ${y1}%, hsla(${hue1},55%,55%,0.85), transparent 60%),` +
        `radial-gradient(circle at ${x2}% ${y2}%, hsla(${hue2},50%,40%,0.8), transparent 55%),` +
        `linear-gradient(135deg, hsl(${hue1},35%,26%), hsl(${hue2},32%,18%))`;

  return { backgroundImage: bg };
}
