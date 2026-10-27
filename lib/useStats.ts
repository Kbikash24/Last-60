"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  parseStats,
  readStatsRaw,
  subscribeStats,
  type Stats,
} from "./storage";

export function useStats(): Stats {
  const raw = useSyncExternalStore(subscribeStats, readStatsRaw, () => "");
  return useMemo(() => parseStats(raw), [raw]);
}
