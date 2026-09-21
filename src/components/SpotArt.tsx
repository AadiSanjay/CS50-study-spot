import { spotArtStyle } from "@/lib/spot-art";
import type { Category } from "@/lib/types";

export function SpotArt({
  id,
  category,
  className = "",
  children,
}: {
  id: string;
  category: Category;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`bg-cover ${className}`} style={spotArtStyle(id, category)}>
      {children}
    </div>
  );
}
