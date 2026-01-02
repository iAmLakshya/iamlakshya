"use client";

import { ReactNode, useEffect, useState } from "react";
import { Cursor } from "./cursor";

interface CursorProviderProps {
  children: ReactNode;
}

export function CursorProvider({ children }: CursorProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {children}
      {mounted && (
        <Cursor
          size={12}
          spring={{ stiffness: 400, damping: 25, mass: 0.5 }}
        />
      )}
    </>
  );
}
