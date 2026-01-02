"use client";

import posthog from "posthog-js";

interface ExperienceItemProps {
  organization: string;
  location?: string;
  period: string;
  description: string;
}

interface ExperienceListProps {
  items: ExperienceItemProps[];
  className?: string;
  viewAllHref?: string;
  viewAllText?: string;
}

export function ExperienceItem({
  organization,
  location,
  period,
  description,
}: ExperienceItemProps) {
  return (
    <div className="py-2.5 sm:py-3">
      <div className="flex items-baseline justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800 text-sm sm:text-base">
            {organization}
            {location && (
              <span className="text-gray-500 font-normal"> · {location}</span>
            )}
          </p>
        </div>
        <span className="text-xs sm:text-sm text-gray-500 tabular-nums flex-shrink-0">
          {period}
        </span>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-1">
        {description}
      </p>
    </div>
  );
}

export function ExperienceList({
  items,
  className,
  viewAllHref,
  viewAllText = "View full resume",
}: ExperienceListProps) {
  const handleResumeClick = () => {
    if (viewAllHref) {
      posthog.capture("resume_link_clicked", {
        href: viewAllHref,
        link_text: viewAllText,
      });
    }
  };

  return (
    <div className={className}>
      <div className="divide-y divide-gray-200/50">
        {items.map((item, index) => (
          <ExperienceItem key={index} {...item} />
        ))}
      </div>
      {viewAllHref && (
        <a
          href={viewAllHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleResumeClick}
          className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-500 mt-3 hover:text-gray-700 transition"
        >
          {viewAllText}
          <span aria-hidden="true">→</span>
        </a>
      )}
    </div>
  );
}
