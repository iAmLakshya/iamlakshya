"use client";

import { ReactNode } from "react";
import posthog from "posthog-js";
import { GithubIcon, ExternalLinkIcon, ArticleIcon } from "@/components/icons";

type ListItemType = "project" | "writeup";

interface ListItemProps {
  title: string;
  description?: string;
  href?: string;
  type?: ListItemType;
  icon?: ReactNode;
}

interface ListProps {
  items: ListItemProps[];
  className?: string;
  viewAllHref?: string;
  viewAllText?: string;
}

function getIconForLink(href: string, type?: ListItemType): ReactNode {
  if (type === "writeup") {
    return <ArticleIcon className="size-4" />;
  }

  if (href.includes("github.com")) {
    return <GithubIcon className="size-4 fill-current" />;
  }

  return <ExternalLinkIcon className="size-4" />;
}

export function ListItem({
  title,
  description,
  href,
  type,
  icon,
}: ListItemProps) {
  const handleClick = () => {
    if (href) {
      posthog.capture("project_link_clicked", {
        project_title: title,
        project_description: description,
        href: href,
        link_type: type || "project",
        is_github: href.includes("github.com"),
      });
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4 py-2.5 sm:py-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate text-sm sm:text-base">
          {title}
        </p>
        {description && (
          <p className="text-xs sm:text-sm text-gray-500 truncate">
            {description}
          </p>
        )}
      </div>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="flex-shrink-0 text-gray-400 p-1 -m-1"
        >
          {icon || getIconForLink(href, type)}
        </a>
      )}
    </div>
  );
}

export function List({
  items,
  className,
  viewAllHref,
  viewAllText = "View all",
}: ListProps) {
  return (
    <div className={className}>
      <ul className="divide-y divide-gray-200/50">
        {items.map((item, index) => (
          <li key={index}>
            <ListItem {...item} />
          </li>
        ))}
      </ul>
      {viewAllHref && (
        <a
          href={viewAllHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-500 mt-3"
        >
          {viewAllText}
          <span aria-hidden="true">→</span>
        </a>
      )}
    </div>
  );
}
