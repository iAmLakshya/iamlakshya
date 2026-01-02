"use client";

import {
  CURSOR_CHANNEL,
  CURSOR_TIMEOUT_MS,
  THROTTLE_MS,
  getColorFromUserId,
  getUserId,
  isTouchDevice,
  type CursorPosition,
  type RemoteCursor,
} from "@/lib/live-cursors";
import { supabaseBrowser } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface LiveCursorsContextType {
  remoteCursors: RemoteCursor[];
  onlineCount: number;
  isConnected: boolean;
}

const LiveCursorsContext = createContext<LiveCursorsContextType | null>(null);

export function useLiveCursors() {
  const context = useContext(LiveCursorsContext);
  if (!context) {
    throw new Error("useLiveCursors must be used within LiveCursorsProvider");
  }
  return context;
}

function createCursorFromPayload(data: CursorPosition): RemoteCursor {
  return {
    userId: data.userId,
    x: data.x,
    y: data.y,
    scrollX: data.scrollX,
    scrollY: data.scrollY,
    color: data.color,
    pathname: data.pathname,
    lastSeen: Date.now(),
    isActive: true,
  };
}

function updateCursorList(
  prev: RemoteCursor[],
  newCursor: RemoteCursor
): RemoteCursor[] {
  const index = prev.findIndex((c) => c.userId === newCursor.userId);
  if (index >= 0) {
    const updated = [...prev];
    updated[index] = newCursor;
    return updated;
  }
  return [...prev, newCursor];
}

interface LiveCursorsProviderProps {
  children: ReactNode;
}

export function LiveCursorsProvider({ children }: LiveCursorsProviderProps) {
  const pathname = usePathname();

  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [onlineCount, setOnlineCount] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [isTouch, setIsTouch] = useState(true);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const userIdRef = useRef("");
  const colorRef = useRef("");
  const lastBroadcastRef = useRef(0);

  useEffect(() => {
    userIdRef.current = getUserId();
    colorRef.current = getColorFromUserId(userIdRef.current);
    setIsTouch(isTouchDevice());
  }, []);

  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setRemoteCursors((prev) =>
        prev
          .map((c) => ({
            ...c,
            isActive: now - c.lastSeen < CURSOR_TIMEOUT_MS,
          }))
          .filter((c) => now - c.lastSeen < CURSOR_TIMEOUT_MS * 2)
      );
    }, 1000);
    return () => clearInterval(cleanup);
  }, []);

  const handlePresenceSync = useCallback((channel: RealtimeChannel) => {
    const state = channel.presenceState();
    setOnlineCount(Object.keys(state).length);
  }, []);

  const handleCursorMove = useCallback(
    (payload: { payload: CursorPosition }) => {
      if (isTouch) return;
      const data = payload.payload;
      if (data.userId === userIdRef.current) return;
      setRemoteCursors((prev) =>
        updateCursorList(prev, createCursorFromPayload(data))
      );
    },
    [isTouch]
  );

  const handleCursorLeave = useCallback(
    (payload: { payload: { userId: string } }) => {
      const { userId } = payload.payload;
      setRemoteCursors((prev) => prev.filter((c) => c.userId !== userId));
    },
    []
  );

  useEffect(() => {
    if (!userIdRef.current || !supabaseBrowser) return;

    const channel = supabaseBrowser.channel(CURSOR_CHANNEL, {
      config: {
        broadcast: { self: false },
        presence: { key: userIdRef.current },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => handlePresenceSync(channel))
      .on("broadcast", { event: "cursor-move" }, handleCursorMove)
      .on("broadcast", { event: "cursor-leave" }, handleCursorLeave)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ id: userIdRef.current, isMobile: isTouch });
          setIsConnected(true);
        }
      });

    channelRef.current = channel;

    return () => {
      channel.untrack();
      if (!isTouch) {
        channel.send({
          type: "broadcast",
          event: "cursor-leave",
          payload: { userId: userIdRef.current },
        });
      }
      supabaseBrowser?.removeChannel(channel);
    };
  }, [isTouch, handlePresenceSync, handleCursorMove, handleCursorLeave]);

  useEffect(() => {
    if (isTouch || !channelRef.current) return;

    const broadcast = (event: string, payload: object) => {
      channelRef.current?.send({ type: "broadcast", event, payload });
    };

    const onMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastBroadcastRef.current < THROTTLE_MS) return;
      lastBroadcastRef.current = now;

      broadcast("cursor-move", {
        x: e.clientX,
        y: e.clientY,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        userId: userIdRef.current,
        color: colorRef.current,
        pathname,
        timestamp: now,
      });
    };

    const onMouseLeave = () => {
      broadcast("cursor-leave", { userId: userIdRef.current });
    };

    window.addEventListener("mousemove", onMouseMove);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [isTouch, pathname]);

  const filteredCursors = useMemo(
    () => remoteCursors.filter((c) => c.pathname === pathname),
    [remoteCursors, pathname]
  );

  const value = useMemo(
    () => ({ remoteCursors: filteredCursors, onlineCount, isConnected }),
    [filteredCursors, onlineCount, isConnected]
  );

  return (
    <LiveCursorsContext.Provider value={value}>
      {children}
    </LiveCursorsContext.Provider>
  );
}
