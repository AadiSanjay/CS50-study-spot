// "unverified-hours" is a data-provenance flag for us, not something worth
// showing a student browsing the app.
export function visibleTags(tags: string[]): string[] {
  return tags.filter((t) => t !== "unverified-hours");
}
