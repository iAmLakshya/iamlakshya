"use client";

import { cn } from "@/lib/cn";
import { motion, useMotionValue, useSpring } from "motion/react";
import {
  ReactNode,
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
  useRef,
} from "react";

type CursorVariant = "default" | "pointer" | "text" | "hidden";

interface CursorContextType {
  setVariant: (variant: CursorVariant) => void;
  setMagnetic: (element: HTMLElement | null) => void;
}

const CursorContext = createContext<CursorContextType | null>(null);

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
};

interface CursorProps {
  children?: ReactNode;
  className?: string;
  /** Spring configuration for smooth movement */
  spring?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
  /** Size of the cursor dot in pixels */
  size?: number;
  /** Color of the text cursor beam */
  textCursorColor?: string;
  /** Padding around interactive elements when morphing */
  morphPadding?: number;
}

// Text elements that should trigger text cursor
const TEXT_ELEMENTS = [
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "SPAN",
  "LABEL",
  "LI",
  "TD",
  "TH",
  "BLOCKQUOTE",
  "PRE",
  "CODE",
];

interface ElementRect {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
}

// Parse RGB/RGBA color string to RGB values
function parseColor(color: string): { r: number; g: number; b: number } | null {
  // Handle rgb/rgba
  const rgbMatch = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
  );
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
  }

  // Handle hex
  const hexMatch = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
    };
  }

  return null;
}

// Calculate relative luminance (0-1, where 0 is darkest, 1 is lightest)
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Check if background is dark (luminance < 0.5)
function isDarkBackground(element: HTMLElement | null): boolean {
  if (!element) return false;

  let currentElement: HTMLElement | null = element;

  while (currentElement) {
    const computedStyle = window.getComputedStyle(currentElement);
    const bgColor = computedStyle.backgroundColor;

    if (bgColor && bgColor !== "transparent" && bgColor !== "rgba(0, 0, 0, 0)") {
      const parsed = parseColor(bgColor);
      if (parsed) {
        const luminance = getLuminance(parsed.r, parsed.g, parsed.b);
        return luminance < 0.5;
      }
    }

    currentElement = currentElement.parentElement;
  }

  // Default to light background
  return false;
}

export function Cursor({
  children,
  className,
  spring: springConfig = { stiffness: 400, damping: 28, mass: 0.5 },
  size = 12,
  textCursorColor = "#374151",
  morphPadding = 8,
}: CursorProps) {
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [textHeight, setTextHeight] = useState(24);
  const [hoveredElement, setHoveredElement] = useState<ElementRect | null>(
    null
  );
  const [isDark, setIsDark] = useState(false);

  const lastMousePos = useRef({ x: 0, y: 0 });

  // Raw mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smoothed cursor position with spring physics
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Detect touch device
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    };
    checkTouch();
    window.addEventListener("touchstart", () => setIsTouchDevice(true), {
      once: true,
    });
  }, []);

  // Check if element contains actual text content
  const hasTextContent = useCallback((element: HTMLElement): boolean => {
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        return true;
      }
    }
    return false;
  }, []);

  // Get the font size of the text element
  const getTextSize = useCallback((element: HTMLElement): number => {
    const computedStyle = window.getComputedStyle(element);
    const lineHeight = computedStyle.lineHeight;
    const fontSize = parseFloat(computedStyle.fontSize);

    if (lineHeight && lineHeight !== "normal") {
      const parsedLineHeight = parseFloat(lineHeight);
      if (!isNaN(parsedLineHeight)) {
        return parsedLineHeight;
      }
    }

    return fontSize * 1.4;
  }, []);

  // Get element's border radius
  const getBorderRadius = useCallback((element: HTMLElement): number => {
    const computedStyle = window.getComputedStyle(element);
    const borderRadius = computedStyle.borderRadius;
    const parsed = parseFloat(borderRadius);
    return isNaN(parsed) ? 8 : parsed;
  }, []);

  // Find the interactive element (link or button)
  const findInteractiveElement = useCallback(
    (element: HTMLElement | null): HTMLElement | null => {
      if (!element) return null;

      const isInteractive =
        element.tagName === "A" ||
        element.tagName === "BUTTON" ||
        element.getAttribute("role") === "button" ||
        element.hasAttribute("data-cursor-pointer");

      if (isInteractive) {
        return element;
      }

      // Check parent
      if (element.parentElement) {
        return findInteractiveElement(element.parentElement);
      }

      return null;
    },
    []
  );

  // Detect cursor type from element
  const detectCursorType = useCallback(
    (
      element: HTMLElement | null
    ): {
      variant: CursorVariant;
      textSize?: number;
      interactiveElement?: HTMLElement;
    } => {
      if (!element) return { variant: "default" };

      const computedStyle = window.getComputedStyle(element);
      const cursorStyle = computedStyle.cursor;

      // Check for interactive elements first (higher priority)
      const interactiveElement = findInteractiveElement(element);
      if (cursorStyle === "pointer" || interactiveElement) {
        return {
          variant: "pointer",
          interactiveElement: interactiveElement || undefined,
        };
      }

      // Check for text input elements
      const isTextInput =
        element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.isContentEditable;

      if (cursorStyle === "text" || isTextInput) {
        return { variant: "text", textSize: getTextSize(element) };
      }

      // Check for text content elements
      const isTextElement = TEXT_ELEMENTS.includes(element.tagName);
      if (isTextElement && hasTextContent(element)) {
        return { variant: "text", textSize: getTextSize(element) };
      }

      // Recursively check parent for text elements
      if (element.parentElement) {
        const parentResult = detectCursorType(element.parentElement);
        if (parentResult.variant === "text") {
          return parentResult;
        }
      }

      return { variant: "default" };
    },
    [hasTextContent, getTextSize, findInteractiveElement]
  );

  // Handle mouse movement
  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      // Detect cursor type based on hovered element
      const elementUnderCursor = document.elementFromPoint(
        e.clientX,
        e.clientY
      ) as HTMLElement;

      const {
        variant: detectedVariant,
        textSize,
        interactiveElement,
      } = detectCursorType(elementUnderCursor);

      setVariant(detectedVariant);

      if (textSize) {
        setTextHeight(textSize);
      }

      // Detect background color
      setIsDark(isDarkBackground(elementUnderCursor));

      // Handle interactive element morphing
      if (detectedVariant === "pointer" && interactiveElement) {
        const rect = interactiveElement.getBoundingClientRect();
        const borderRadius = getBorderRadius(interactiveElement);

        setHoveredElement({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width + morphPadding * 2,
          height: rect.height + morphPadding * 2,
          borderRadius: borderRadius + morphPadding / 2,
        });

        // Move cursor to element center
        mouseX.set(rect.left + rect.width / 2);
        mouseY.set(rect.top + rect.height / 2);
      } else {
        setHoveredElement(null);
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }
    };

    const handleMouseDown = () => {
      setIsPressed(true);
    };

    const handleMouseUp = () => {
      setIsPressed(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setHoveredElement(null);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Handle scroll to update element positions
    const handleScroll = () => {
      if (lastMousePos.current.x && lastMousePos.current.y) {
        const elementUnderCursor = document.elementFromPoint(
          lastMousePos.current.x,
          lastMousePos.current.y
        ) as HTMLElement;

        const { variant: detectedVariant, interactiveElement } =
          detectCursorType(elementUnderCursor);

        if (detectedVariant === "pointer" && interactiveElement) {
          const rect = interactiveElement.getBoundingClientRect();
          const borderRadius = getBorderRadius(interactiveElement);

          setHoveredElement({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width + morphPadding * 2,
            height: rect.height + morphPadding * 2,
            borderRadius: borderRadius + morphPadding / 2,
          });

          mouseX.set(rect.left + rect.width / 2);
          mouseY.set(rect.top + rect.height / 2);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("scroll", handleScroll, true);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("scroll", handleScroll, true);
      document.documentElement.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
      document.documentElement.removeEventListener(
        "mouseenter",
        handleMouseEnter
      );
    };
  }, [
    mouseX,
    mouseY,
    detectCursorType,
    isTouchDevice,
    getBorderRadius,
    morphPadding,
  ]);

  // Don't render on touch devices
  if (isTouchDevice) return null;

  const contextValue: CursorContextType = {
    setVariant,
    setMagnetic: () => {},
  };

  const isTextVariant = variant === "text";
  const isPointerVariant = variant === "pointer" && hoveredElement;

  // Calculate dimensions based on variant and pressed state
  const getWidth = () => {
    if (isPointerVariant) {
      return isPressed ? hoveredElement.width * 0.95 : hoveredElement.width;
    }
    if (isTextVariant) return isPressed ? 2 : 2.5;
    return isPressed ? size * 0.8 : size;
  };

  const getHeight = () => {
    if (isPointerVariant) {
      return isPressed ? hoveredElement.height * 0.95 : hoveredElement.height;
    }
    if (isTextVariant) return isPressed ? textHeight * 0.75 : textHeight;
    return isPressed ? size * 0.8 : size;
  };

  const getBgColor = () => {
    if (isPointerVariant) {
      return isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)";
    }
    if (isTextVariant) return textCursorColor;
    return isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)";
  };

  const getRadius = () => {
    if (isPointerVariant) return hoveredElement.borderRadius;
    if (isTextVariant) return 1;
    return size / 2;
  };

  const getScale = () => {
    if (isPointerVariant) return isPressed ? 0.97 : 1;
    if (isTextVariant) return 1;
    return isPressed ? 0.9 : 1;
  };

  return (
    <CursorContext.Provider value={contextValue}>
      <motion.div
        className={cn(
          "fixed top-0 left-0 pointer-events-none z-[9999]",
          className
        )}
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          width: getWidth(),
          height: getHeight(),
          backgroundColor: getBgColor(),
          borderRadius: getRadius(),
          scale: getScale(),
        }}
        transition={{
          opacity: { duration: 0.15 },
          backgroundColor: { duration: 0.15 },
          width: { type: "spring", stiffness: 400, damping: 30 },
          height: { type: "spring", stiffness: 400, damping: 30 },
          borderRadius: { duration: 0.15 },
          scale: { type: "spring", stiffness: 400, damping: 25 },
        }}
      >
        {!isTextVariant && !isPointerVariant && children}
      </motion.div>
    </CursorContext.Provider>
  );
}

