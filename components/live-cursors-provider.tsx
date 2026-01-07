"use client";

import {
  calculateFabricatedCount,
  createFabricatedUser,
  FABRICATED_CONFIG,
  fabricatedUserToCursor,
  isFabricatedUserExpired,
  updateFabricatedPosition,
  type FabricatedUser,
} from "@/lib/fabricated-cursors";
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
  const [realOnlineCount, setRealOnlineCount] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [isTouch, setIsTouch] = useState(true);
  const [fabricatedUsers, setFabricatedUsers] = useState<FabricatedUser[]>([]);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const userIdRef = useRef("");
  const colorRef = useRef("");
  const lastBroadcastRef = useRef(0);
  const nextSpawnTimeRef = useRef(0);

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
    setRealOnlineCount(Object.keys(state).length);
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

  // Fabricated cursor lifecycle management
  useEffect(() => {
    if (isTouch) return;

    const manageLifecycle = () => {
      const now = Date.now();

      setFabricatedUsers((prev) => {
        const currentActiveCount = prev.filter((u) => !u.isLeaving).length;
        const neededCount = calculateFabricatedCount(
          realOnlineCount,
          currentActiveCount
        );

        // Mark expired users as leaving and filter out old ones
        let updated = prev
          .map((user) => {
            if (isFabricatedUserExpired(user) && !user.isLeaving) {
              return { ...user, isLeaving: true, ttl: user.ttl + 2000 }; // Extra 2s for exit animation
            }
            return user;
          })
          .filter(
            (user) => !user.isLeaving || Date.now() - user.createdAt < user.ttl
          );

        // Update pathnames for existing users
        updated = updated.map((user) => ({
          ...user,
          pathname,
        }));

        // Spawn new users if needed (with random delay)
        const activeCount = updated.filter((u) => !u.isLeaving).length;
        if (activeCount < neededCount && now >= nextSpawnTimeRef.current) {
          const newUser = createFabricatedUser(pathname);
          updated = [...updated, newUser];

          // Set random delay before next spawn
          nextSpawnTimeRef.current =
            now +
            Math.random() *
              (FABRICATED_CONFIG.respawnDelay.max -
                FABRICATED_CONFIG.respawnDelay.min) +
            FABRICATED_CONFIG.respawnDelay.min;
        }

        return updated;
      });
    };

    // Run lifecycle check every second
    const lifecycleInterval = setInterval(manageLifecycle, 1000);

    // Initial spawn
    manageLifecycle();

    return () => clearInterval(lifecycleInterval);
  }, [isTouch, realOnlineCount, pathname]);

  // Fabricated cursor movement animation
  useEffect(() => {
    if (isTouch || fabricatedUsers.length === 0) return;

    const moveInterval = setInterval(() => {
      setFabricatedUsers((prev) =>
        prev.map((user) => {
          if (user.isLeaving) return user;
          return updateFabricatedPosition(user);
        })
      );
    }, FABRICATED_CONFIG.movementInterval);

    return () => clearInterval(moveInterval);
  }, [isTouch, fabricatedUsers.length]);

  // Combine real cursors with fabricated ones
  const filteredCursors = useMemo(
    () => remoteCursors.filter((c) => c.pathname === pathname),
    [remoteCursors, pathname]
  );

  const fabricatedCursors = useMemo(
    () =>
      fabricatedUsers
        .filter((u) => u.pathname === pathname)
        .map(fabricatedUserToCursor),
    [fabricatedUsers, pathname]
  );

  const allCursors = useMemo(
    () => [...filteredCursors, ...fabricatedCursors],
    [filteredCursors, fabricatedCursors]
  );

  // Combined online count: real users + active fabricated users
  const onlineCount = useMemo(() => {
    const activeFabricated = fabricatedUsers.filter((u) => !u.isLeaving).length;
    return realOnlineCount + activeFabricated;
  }, [realOnlineCount, fabricatedUsers]);

  const value = useMemo(
    () => ({ remoteCursors: allCursors, onlineCount, isConnected }),
    [allCursors, onlineCount, isConnected]
  );

  return (
    <LiveCursorsContext.Provider value={value}>
      {children}
    </LiveCursorsContext.Provider>
  );
}
