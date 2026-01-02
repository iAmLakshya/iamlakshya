"use client";

import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/star-background";
import { HeadingText, MainText } from "./fonts";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import posthog from "posthog-js";

export default function NotFound() {
  const handleBackClick = () => {
    posthog.capture("not_found_back_clicked", {
      source_page: "404",
      destination: "/",
    });
  };

  return (
    <div className="h-screen w-full flex items-center flex-col bg-black px-4 sm:px-5 py-16 sm:py-24">
      <StarsBackground />
      <ShootingStars />
      <div className="max-w-2xl z-10 w-full text-gray-50">
        <header className="mb-8 sm:mb-10 space-y-4 sm:space-y-5">
          <div className="space-y-2 sm:space-y-2.5">
            <h1
              className={`${HeadingText.className} text-2xl sm:text-3xl md:text-4xl`}
            >
              <span>Houston? 🧑🏻‍🚀</span>
              <br />
              Error 404
            </h1>
            <p
              className={`${MainText.className} text-gray-300 text-sm sm:text-base`}
            >
              The page you're looking for isn't here.
            </p>
            <div className="flex pt-2">
              <Link
                href="/"
                onClick={handleBackClick}
                className="flex items-center gap-1.5 text-sm sm:text-base hover:text-white transition touch-manipulation"
              >
                <MoveLeft className="size-4 sm:size-5" />
                Head back
              </Link>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}
