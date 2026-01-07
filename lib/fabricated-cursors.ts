import { CURSOR_COLORS, type RemoteCursor } from "./live-cursors";

// Fabricated cursor configuration
export const FABRICATED_CONFIG = {
  minFabricatedUsers: 0, // Minimum fake users (can be 0 for realism)
  maxFabricatedUsers: 3, // Maximum fake users at any time
  targetFabricatedUsers: 1, // Target number when few real users
  minTTL: 20000, // Minimum lifetime: 20 seconds
  maxTTL: 90000, // Maximum lifetime: 90 seconds
  respawnDelay: { min: 3000, max: 15000 }, // Delay before spawning new fake user
  emptyPeriodProbability: 0.2, // 20% chance to have a period with 0 fabricated users
  emptyPeriodDuration: { min: 5000, max: 20000 }, // Duration of empty period
  movementInterval: 50, // How often to update position (ms)
  pauseProbability: 0.15, // Chance to pause movement each update
  pauseDuration: { min: 500, max: 3000 }, // How long to pause
  scrollProbability: 0.05, // Chance to simulate scroll
  scrollAmount: { min: 50, max: 300 }, // Scroll distance range
} as const;

export interface FabricatedUser {
  userId: string;
  color: string;
  createdAt: number;
  ttl: number; // Time to live in ms
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  scrollY: number;
  isPaused: boolean;
  pauseUntil: number;
  pathname: string;
  isLeaving: boolean; // For graceful exit animation
}

// Generate a fake but realistic user ID
export function generateFabricatedUserId(): string {
  const chars = "0123456789abcdef";
  const segments = [8, 4, 4, 4, 12];
  return segments
    .map((len) =>
      Array.from(
        { length: len },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join("")
    )
    .join("-");
}

// Get color from fabricated user ID (same logic as real users)
export function getFabricatedColor(userId: string): string {
  const hash = userId.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

// Random number in range
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get viewport dimensions safely
function getViewportDimensions(): { width: number; height: number } {
  if (typeof window === "undefined") {
    return { width: 1200, height: 800 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

// Get page scroll height
function getPageScrollHeight(): number {
  if (typeof document === "undefined") return 2000;
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    800
  );
}

// Generate a natural-looking target position
// Cursors tend to gravitate toward the center and content areas
function generateNaturalTarget(): { x: number; y: number } {
  const { width, height } = getViewportDimensions();

  // Weight toward center-left (where content usually is)
  const centerBiasX = 0.3 + Math.random() * 0.5; // 30-80% of width
  const centerBiasY = 0.15 + Math.random() * 0.6; // 15-75% of height

  // Add some randomness
  const jitterX = (Math.random() - 0.5) * width * 0.3;
  const jitterY = (Math.random() - 0.5) * height * 0.3;

  return {
    x: Math.max(50, Math.min(width - 50, width * centerBiasX + jitterX)),
    y: Math.max(50, Math.min(height - 50, height * centerBiasY + jitterY)),
  };
}

// Create a new fabricated user
export function createFabricatedUser(pathname: string): FabricatedUser {
  const userId = generateFabricatedUserId();
  const { width, height } = getViewportDimensions();

  // Start from edge of screen (like entering the page)
  const edge = Math.floor(Math.random() * 4);
  let startX: number, startY: number;

  switch (edge) {
    case 0: // Top
      startX = randomInRange(100, width - 100);
      startY = -20;
      break;
    case 1: // Right
      startX = width + 20;
      startY = randomInRange(100, height - 100);
      break;
    case 2: // Bottom
      startX = randomInRange(100, width - 100);
      startY = height + 20;
      break;
    default: // Left
      startX = -20;
      startY = randomInRange(100, height - 100);
  }

  const target = generateNaturalTarget();

  return {
    userId,
    color: getFabricatedColor(userId),
    createdAt: Date.now(),
    ttl: randomInRange(FABRICATED_CONFIG.minTTL, FABRICATED_CONFIG.maxTTL),
    currentX: startX,
    currentY: startY,
    targetX: target.x,
    targetY: target.y,
    scrollY: 0,
    isPaused: false,
    pauseUntil: 0,
    pathname,
    isLeaving: false,
  };
}

// Smooth easing function for natural movement
function easeOutQuad(t: number): number {
  return t * (2 - t);
}

// Calculate next position with smooth movement
export function updateFabricatedPosition(user: FabricatedUser): FabricatedUser {
  const now = Date.now();

  // Check if paused
  if (user.isPaused && now < user.pauseUntil) {
    return user;
  }

  // Resume from pause
  if (user.isPaused && now >= user.pauseUntil) {
    user = { ...user, isPaused: false };
  }

  // Random chance to pause (simulates reading)
  if (Math.random() < FABRICATED_CONFIG.pauseProbability) {
    const pauseDuration = randomInRange(
      FABRICATED_CONFIG.pauseDuration.min,
      FABRICATED_CONFIG.pauseDuration.max
    );
    return {
      ...user,
      isPaused: true,
      pauseUntil: now + pauseDuration,
    };
  }

  // Calculate distance to target
  const dx = user.targetX - user.currentX;
  const dy = user.targetY - user.currentY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // If close to target, pick a new one
  if (distance < 30) {
    const newTarget = generateNaturalTarget();
    return {
      ...user,
      targetX: newTarget.x,
      targetY: newTarget.y,
    };
  }

  // Move toward target with variable speed
  // Speed decreases as we approach (natural deceleration)
  const baseSpeed = 3 + Math.random() * 4; // 3-7 pixels per frame
  const speedMultiplier = Math.min(1, distance / 200);
  const speed = baseSpeed * (0.3 + speedMultiplier * 0.7);

  // Normalize direction and apply speed
  const normalizedDx = dx / distance;
  const normalizedDy = dy / distance;

  // Add slight curve/wobble for natural feel
  const wobble = (Math.random() - 0.5) * 2;
  const newX = user.currentX + normalizedDx * speed + wobble;
  const newY = user.currentY + normalizedDy * speed + wobble * 0.5;

  // Random chance to scroll
  let newScrollY = user.scrollY;
  if (Math.random() < FABRICATED_CONFIG.scrollProbability) {
    const maxScroll = getPageScrollHeight() - getViewportDimensions().height;
    const scrollDelta =
      (Math.random() > 0.5 ? 1 : -1) *
      randomInRange(
        FABRICATED_CONFIG.scrollAmount.min,
        FABRICATED_CONFIG.scrollAmount.max
      );
    newScrollY = Math.max(0, Math.min(maxScroll, user.scrollY + scrollDelta));
  }

  return {
    ...user,
    currentX: newX,
    currentY: newY,
    scrollY: newScrollY,
  };
}

// Convert fabricated user to RemoteCursor format
export function fabricatedUserToCursor(user: FabricatedUser): RemoteCursor {
  return {
    userId: user.userId,
    x: user.currentX,
    y: user.currentY,
    scrollX: 0,
    scrollY: user.scrollY,
    color: user.color,
    pathname: user.pathname,
    lastSeen: Date.now(),
    isActive: !user.isLeaving,
  };
}

// Check if fabricated user has expired
export function isFabricatedUserExpired(user: FabricatedUser): boolean {
  return Date.now() - user.createdAt > user.ttl;
}

// State for managing empty periods
let emptyPeriodUntil = 0;

// Calculate how many fabricated users we need
export function calculateFabricatedCount(
  realUserCount: number,
  currentFabricatedCount: number
): number {
  const now = Date.now();

  // If enough real users are present, no need for fabricated ones
  if (realUserCount >= 2) {
    return 0;
  }

  // Check if we're in an empty period
  if (now < emptyPeriodUntil) {
    return 0;
  }

  // Random chance to start an empty period (only when transitioning from having users)
  if (
    currentFabricatedCount > 0 &&
    Math.random() < FABRICATED_CONFIG.emptyPeriodProbability * 0.01 // Check every call, low prob
  ) {
    const duration =
      Math.random() *
        (FABRICATED_CONFIG.emptyPeriodDuration.max -
          FABRICATED_CONFIG.emptyPeriodDuration.min) +
      FABRICATED_CONFIG.emptyPeriodDuration.min;
    emptyPeriodUntil = now + duration;
    return 0;
  }

  // Determine target count with some randomness
  // Usually 1, sometimes 2, rarely 0
  const rand = Math.random();
  let target: number;
  if (rand < 0.15) {
    target = 0; // 15% chance of 0
  } else if (rand < 0.85) {
    target = 1; // 70% chance of 1
  } else {
    target = 2; // 15% chance of 2
  }

  return Math.min(target, FABRICATED_CONFIG.maxFabricatedUsers);
}
