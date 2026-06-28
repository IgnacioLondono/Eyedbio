"use client";

import { useEffect } from "react";
import { installMediaGestureTracker } from "@/lib/media/media-gesture";

export default function MediaGestureTracker() {
  useEffect(() => installMediaGestureTracker(), []);
  return null;
}
