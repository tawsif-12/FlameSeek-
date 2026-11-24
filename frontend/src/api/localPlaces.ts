import bangladesh from "../data/bangladesh-boundary.json";
import type { PlaceResult } from "../types/api";

// Bangladesh's simplified boundary is a dated OpenStreetMap extract; other
// fallback locations are previously selected places saved on this device.
const builtIn = bangladesh as unknown as PlaceResult;
const storageKey = "flameseek.saved-place-suggestions.v1";
function savedPlaces(): PlaceResult[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(data) ? data.filter((item): item is PlaceResult => !!item && typeof item.name === "string" && !!item.geometry && Array.isArray(item.center) && Array.isArray(item.bbox)) : [];
  } catch { return []; }
}
export function localSuggestions(query: string): PlaceResult[] {
  const text = query.trim().toLocaleLowerCase().replace(/^(?:fires? (?:in|near|around)\s+|(?:in|near|around)\s+)/, "");
  if (text.length < 2) return [];
  const seen = new Set<string>();
  return [builtIn, ...savedPlaces()].filter(place => {
    const key = place.place_id || place.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return [place.place_name, place.name, place.parent_region].some(value => value?.toLocaleLowerCase().includes(text));
  }).slice(0, 8);
}
export function rememberPlace(place: PlaceResult) {
  if (!place.geometry || !place.place_id || place.place_id === builtIn.place_id) return;
  try {
    const entries = [place, ...savedPlaces().filter(saved => saved.place_id !== place.place_id)].slice(0, 10);
    localStorage.setItem(storageKey, JSON.stringify(entries));
  } catch { /* Storage is optional. */ }
}
