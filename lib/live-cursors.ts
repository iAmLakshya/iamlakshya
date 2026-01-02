export interface CursorPosition {
  x: number;
  y: number;
  scrollX: number;
  scrollY: number;
  userId: string;
  color: string;
  pathname: string;
  timestamp: number;
}

export interface RemoteCursor {
  userId: string;
  x: number;
  y: number;
  scrollX: number;
  scrollY: number;
  color: string;
  pathname: string;
  lastSeen: number;
  isActive: boolean;
}

export const CURSOR_COLORS = [
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
] as const;

export const CURSOR_CHANNEL = "live-cursors";

export const CURSOR_TIMEOUT_MS = 5000;

export const THROTTLE_MS = 50;

export const SPRING_CONFIG = { stiffness: 400, damping: 28, mass: 0.5 };

export function getUserId(): string {
  if (typeof window === "undefined") return "";

  let userId = sessionStorage.getItem("cursor-user-id");
  if (!userId) {
    userId = crypto.randomUUID();
    sessionStorage.setItem("cursor-user-id", userId);
  }
  return userId;
}

export function getColorFromUserId(userId: string): string {
  const hash = userId.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function getVisitorLabel(userId: string): string {
  const hash = userId.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return `Visitor ${Math.abs(hash) % 1000}`;
}
