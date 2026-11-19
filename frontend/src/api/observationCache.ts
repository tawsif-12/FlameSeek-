import type { CurrentHotspotsResponse } from "../types/api";

const STORE = "flameseek-observations-v1";
const MAX_AGE_MS = 6 * 60 * 60 * 1000;
const memory = new Map<number, CurrentHotspotsResponse>();
const cachePath = (days: number) => `/__flameseek_saved_observations/${days}`;

/** Optional browser storage must never break a successful live request. */
export async function saveObservations(days: number, data: CurrentHotspotsResponse): Promise<void> {
  if (data.metadata.observation_loading || data.metadata.browser_cached) return;
  memory.set(days, data);
  if (memory.size > 2) memory.delete(memory.keys().next().value!);
  try {
    if (typeof caches === "undefined") return;
    const cache = await caches.open(STORE);
    await cache.put(cachePath(days), new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    }));
  } catch { /* Storage disabled or quota reached: the live feed still works. */ }
}

/** Only real, still-recent observations are eligible for an outage fallback. */
export async function savedObservations(days: number, bbox?: [number, number, number, number]): Promise<CurrentHotspotsResponse | null> {
  try {
    let data = memory.get(days);
    if (!data && typeof caches !== "undefined") {
      const response = await (await caches.open(STORE)).match(cachePath(days));
      if (response) data = await response.json() as CurrentHotspotsResponse;
    }
    if (!data || !data.metadata || !Array.isArray(data.raw_hotspots)) return null;
    const now = Date.now();
    const stamp = Date.parse(String(data.metadata.snapshot_at));
    if (!Number.isFinite(stamp) || now < stamp || now - stamp > MAX_AGE_MS) return null;
    const cutoff = now - days * 86400000;
    const raw = data.raw_hotspots.filter((point) => {
      const observed = Date.parse(point.acq_datetime);
      return observed >= cutoff && observed <= now && (!bbox || (
        point.lon >= bbox[0] && point.lat >= bbox[1] && point.lon <= bbox[2] && point.lat <= bbox[3]
      ));
    });
    if (!raw.length) return null;
    return { hotspots: [], raw_hotspots: raw, metadata: {
      ...data.metadata, data_source: "cached_actual", browser_cached: true,
      raw_hotspot_count: raw.length, returned_hotspot_count: 0,
      processing_pending: false, harmonization_unavailable: true, merged_ready: false,
      refresh_in_progress: true, stale_snapshot: true,
      cache_age_seconds: Math.round((now - stamp) / 1000),
      message: "Live update unavailable. Showing saved NASA observations; retrying automatically.",
    }};
  } catch { return null; }
}
