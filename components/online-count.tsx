"use client";

import { useLiveCursors } from "./live-cursors-provider";

export function OnlineCount() {
  const { onlineCount, isConnected } = useLiveCursors();

  if (!isConnected) return null;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
      </span>
      {onlineCount} {onlineCount === 1 ? "visitor" : "visitors"} online
    </span>
  );
}
