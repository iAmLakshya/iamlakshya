"use client";

import {
  SPRING_CONFIG,
  getVisitorLabel,
  type RemoteCursor,
} from "@/lib/live-cursors";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveCursors } from "./live-cursors-provider";

interface RemoteCursorProps {
  cursor: RemoteCursor;
}

function RemoteCursorElement({ cursor }: RemoteCursorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef({ x: 0, y: 0 });
  const [, forceRender] = useState(0);

  const pageX = cursor.x + cursor.scrollX;
  const pageY = cursor.y + cursor.scrollY;

  const springX = useSpring(useMotionValue(pageX), SPRING_CONFIG);
  const springY = useSpring(useMotionValue(pageY), SPRING_CONFIG);

  useEffect(() => {
    springX.set(pageX);
    springY.set(pageY);
  }, [pageX, pageY, springX, springY]);

  useEffect(() => {
    let rafId: number;

    const updateScroll = () => {
      const newX = window.scrollX;
      const newY = window.scrollY;

      if (scrollRef.current.x !== newX || scrollRef.current.y !== newY) {
        scrollRef.current = { x: newX, y: newY };
        forceRender((n) => n + 1);
      }

      rafId = requestAnimationFrame(updateScroll);
    };

    rafId = requestAnimationFrame(updateScroll);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const label = getVisitorLabel(cursor.userId);

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-[9998]"
      style={{
        transform: `translate(${-scrollRef.current.x}px, ${-scrollRef.current.y}px)`,
      }}
    >
      <motion.div
        style={{
          x: springX,
          y: springY,
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: cursor.isActive ? 1 : 0,
          scale: cursor.isActive ? 1 : 0.5,
        }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{
          opacity: { duration: 0.3 },
          scale: { type: "spring", stiffness: 400, damping: 25 },
        }}
      >
        <div
          className="pointer-events-auto cursor-default"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: "translate(-2px, -2px)" }}
          >
            <path
              d="M5.65376 12.4567L5.65376 12.4567L5.65314 12.4559C5.10712 11.7184 5.00462 10.7497 5.38312 9.90623L9.23823 1.38404C9.99926 -0.298382 12.4071 -0.298382 13.1681 1.38404L21.6169 20.0557C22.3074 21.5801 20.8428 23.1771 19.2549 22.6207L19.2549 22.6207L19.2515 22.6195L12.0649 20.1169L12.0649 20.1169L12.0599 20.1152C11.3879 19.8831 10.6585 19.8831 9.98643 20.1152L9.98643 20.1152L9.98146 20.1169L2.79489 22.6195L2.79489 22.6195L2.79151 22.6207C1.20364 23.1771 -0.260973 21.5801 0.429544 20.0557L5.65376 12.4567Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>
        </div>
        <motion.div
          className="absolute top-5 left-5 rounded px-2 py-1 text-xs font-medium whitespace-nowrap text-white"
          style={{ backgroundColor: cursor.color }}
          initial={{ opacity: 0, scale: 0.8, y: -4 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8,
            y: isHovered ? 0 : -4,
          }}
          transition={{ duration: 0.15 }}
        >
          {label}
        </motion.div>
      </motion.div>
    </div>
  );
}

export function LiveCursors() {
  const { remoteCursors } = useLiveCursors();

  const cursorElements = useMemo(
    () =>
      remoteCursors.map((cursor) => (
        <RemoteCursorElement key={cursor.userId} cursor={cursor} />
      )),
    [remoteCursors]
  );

  return <>{cursorElements}</>;
}
