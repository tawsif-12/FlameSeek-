import { useSyncExternalStore } from "react";

const query = "(max-width: 1023px)";
function subscribe(listener: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

// Both control locations use the same synchronous breakpoint, so only one
// theme toggle mounts, including when resizing or navigating between routes.
export function useMobileLayout() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
