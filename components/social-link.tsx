"use client";

import { ReactNode } from "react";
import posthog from "posthog-js";

interface SocialLinkProps {
  href: string;
  icon: ReactNode;
}

function getSocialPlatform(href: string): string {
  if (href.includes("github.com")) return "github";
  if (href.includes("linkedin.com")) return "linkedin";
  if (href.includes("instagram.com")) return "instagram";
  if (href.startsWith("mailto:")) return "email";
  return "unknown";
}

export function SocialLink({ href, icon }: SocialLinkProps) {
  const handleClick = () => {
    posthog.capture("social_link_clicked", {
      platform: getSocialPlatform(href),
      href: href,
    });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="fill-gray-700 hover:fill-gray-900 text-gray-700 hover:text-gray-900 hover:bg-gray-200/50 active:bg-gray-200 p-2 sm:p-1.5 rounded-full hover:scale-105 active:scale-95 transition touch-manipulation"
    >
      {icon}
    </a>
  );
}
