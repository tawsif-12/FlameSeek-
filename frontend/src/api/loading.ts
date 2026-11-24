type Task = { reason: string; started: number };
const tasks = new Map<symbol, Task>();
const listeners = new Set<() => void>();
let snapshot: Task[] = [];
function publish() { snapshot = [...tasks.values()]; listeners.forEach(listener => listener()); }
export function subscribeLoading(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function loadingSnapshot() { return snapshot; }
export function beginLoading(reason: string) { const id = Symbol(); tasks.set(id, { reason, started: Date.now() }); publish(); return () => { if (tasks.delete(id)) publish(); }; }
export function clearLoading() { if (tasks.size) { tasks.clear(); publish(); } }
export function loadingReason(path: string) {
 if (/fire_memory|place_pipeline/.test(path)) return "Analyzing satellite history and waiting for NASA data";
 if (/hotspots|\/events/.test(path)) return "Fetching and processing satellite observations";
 if (/places/.test(path)) return "Looking up the location and its boundary";
 if (/\/fires|\/detections|\/grid|\/meta/.test(path)) return "Loading the combined fire record";
 return "Loading data from the server";
}
