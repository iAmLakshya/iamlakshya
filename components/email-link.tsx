"use client";

import { ReactNode } from "react";
import posthog from "posthog-js";

interface EmailLinkProps {
  icon: ReactNode;
}

const E_USER = "aGVsbG8="; // base64
const E_DOMAIN = "aWFtbGFrc2h5YS5jb20="; // base64

function decode(s: string): string {
  return atob(s);
}

export function EmailLink({ icon }: EmailLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const email = `${decode(E_USER)}@${decode(E_DOMAIN)}`;
    posthog.capture("social_link_clicked", {
      platform: "email",
    });
    window.location.href = `mailto:${email}`;
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Send email"
      className="cursor-pointer touch-manipulation rounded-full fill-gray-700 p-2 text-gray-700 transition hover:scale-105 hover:bg-gray-200/50 hover:fill-gray-900 hover:text-gray-900 active:scale-95 active:bg-gray-200 sm:p-1.5"
    >
      {icon}
    </button>
  );
}
