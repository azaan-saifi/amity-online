import Link from "next/link";
import React from "react";
import { FiClock } from "react-icons/fi";
import ReactMarkdown from "react-markdown";

export interface MarkdownProps {
  children: string;
  onTimestampClick?: (seconds: number, videoId: string) => void;
  currentVideoId?: string;
}

export const NonMemoizedMarkdown = ({
  children,
  onTimestampClick,
  currentVideoId,
}: MarkdownProps) => {
  // Helper function to parse various timestamp formats and return seconds
  const parseTimestamp = (text: string): number | null => {
    // First, check if it's our special format [timestamp](seconds)
    const specialFormatRegex = /^(\d+)$/;
    const specialMatch = text.match(specialFormatRegex);
    if (specialMatch) {
      return parseInt(specialMatch[1]);
    }

    // Match formats like "1:30", "01:30", "1:30:45"
    const timeRegex = /(\d+):(\d+)(?::(\d+))?/;
    const match = text.match(timeRegex);

    if (match) {
      let seconds = 0;
      if (match[3]) {
        // Format: hours:minutes:seconds
        seconds =
          parseInt(match[1]) * 3600 +
          parseInt(match[2]) * 60 +
          parseInt(match[3]);
      } else {
        // Format: minutes:seconds
        seconds = parseInt(match[1]) * 60 + parseInt(match[2]);
      }
      return seconds;
    }

    // Match numeric seconds with optional 's' suffix (e.g., "30s" or "30")
    const secondsRegex = /^(\d+)s?$/;
    const secondsMatch = text.match(secondsRegex);
    if (secondsMatch) {
      return parseInt(secondsMatch[1]);
    }

    // Match "Xm" or "XmYs" formats (e.g., "5m" or "5m30s")
    if (text.includes("m")) {
      let minutes = 0;
      let seconds = 0;

      if (text.includes("s")) {
        // Format: "5m30s"
        const parts = text.split("m");
        minutes = parseInt(parts[0]);
        seconds = parseInt(parts[1].replace("s", ""));
      } else {
        // Format: "5m"
        minutes = parseInt(text.replace("m", ""));
      }

      return minutes * 60 + seconds;
    }

    return null;
  };

  // Format seconds into a readable timestamp (MM:SS or HH:MM:SS)
  const formatTimestamp = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    } else {
      return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    }
  };

  // Function to check if a string looks like a timestamp
  const isTimestamp = (text: string | undefined): boolean => {
    if (!text) return false;
    return parseTimestamp(text) !== null;
  };

  // Function to process text and convert timestamps to clickable buttons
  const processText = (text: string) => {
    if (!onTimestampClick) return text;

    // Regex to catch our special [timestamp](seconds) format
    const specialTimestampRegex = /\[timestamp\]\((\d+)\)/g;

    // Split the text into segments based on timestamp matches
    const segments = [];
    let lastIndex = 0;
    let match;

    // First check for our special format
    while ((match = specialTimestampRegex.exec(text)) !== null) {
      // Add the text before the timestamp
      if (match.index > lastIndex) {
        segments.push(text.substring(lastIndex, match.index));
      }

      // Get the seconds value
      const seconds = parseInt(match[1]);
      const displayTimestamp = formatTimestamp(seconds);

      // Add a React element for the timestamp
      segments.push(
        <button
          key={match.index}
          className="inline-flex items-center gap-1 rounded-md bg-[#f0bb1c]/20 px-2 py-0.5 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#f0bb1c]/30"
          onClick={() => onTimestampClick(seconds, currentVideoId || "")}
        >
          <FiClock className="size-3" />
          {displayTimestamp}
        </button>
      );

      lastIndex = match.index + match[0].length;
    }

    // If no special timestamps found, fallback to the existing logic for old-style timestamps
    if (lastIndex === 0) {
      // This regex matches common timestamp formats like [00:00], 00:00, 00m00s, etc.
      const regex =
        /\[?(\d+[:.]\d+(?:[:.]\d+)?)\]?|\[?(\d+m\d+s)\]?|\[?(\d+[m])\]?|\[?(\d+[s])\]?/g;

      while ((match = regex.exec(text)) !== null) {
        // Add the text before the timestamp
        if (match.index > lastIndex) {
          segments.push(text.substring(lastIndex, match.index));
        }

        // Get the timestamp value
        const timestampText = match[1] || match[2] || match[3] || match[4];
        const seconds = parseTimestamp(timestampText);

        if (seconds !== null) {
          // Add a React element for the timestamp
          segments.push(
            <button
              key={match.index}
              className="inline-flex items-center gap-1 rounded-md bg-[#f0bb1c]/20 px-2 py-0.5 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#f0bb1c]/30"
              onClick={() => onTimestampClick(seconds, currentVideoId || "")}
            >
              <FiClock className="size-3" />
              {timestampText}
            </button>
          );
        } else {
          // If we couldn't parse it, add the original text
          segments.push(match[0]);
        }

        lastIndex = match.index + match[0].length;
      }
    }

    // Add any remaining text
    if (lastIndex < text.length) {
      segments.push(text.substring(lastIndex));
    }

    return segments;
  };

  return (
    <ReactMarkdown
      components={{
        code({ children, ...props }) {
          return (
            <code
              className="rounded-md border border-zinc-800 bg-zinc-800/50 px-1 font-['monospace']"
              {...props}
            >
              {children}
            </code>
          );
        },
        p({ children, ...props }) {
          // Process text nodes inside paragraphs
          if (typeof children === "string") {
            return (
              <p className="mb-4 w-full text-zinc-300 last:mb-0" {...props}>
                {processText(children)}
              </p>
            );
          }
          return (
            <p className="mb-4 w-full text-zinc-300 last:mb-0" {...props}>
              {children}
            </p>
          );
        },
        // Process text in other elements
        text({ children }) {
          if (typeof children === "string") {
            return <>{processText(children)}</>;
          }
          return <>{children}</>;
        },
        ol({ children, ...props }) {
          return (
            <ol className="mb-4 list-decimal pl-8 text-zinc-300" {...props}>
              {children}
            </ol>
          );
        },
        ul({ children, ...props }) {
          return (
            <ul className="mb-4 list-disc pl-8 text-zinc-300" {...props}>
              {children}
            </ul>
          );
        },
        li({ children, ...props }) {
          return (
            <li className="mb-1 text-zinc-300" {...props}>
              {children}
            </li>
          );
        },
        a({ children, href, ...props }) {
          // Check for our special timestamp format
          if (href && href.match(/^\d+$/) && onTimestampClick) {
            const seconds = parseInt(href);
            const displayTimestamp = formatTimestamp(seconds);

            return (
              <button
                className="inline-flex items-center gap-1 rounded-md bg-[#f0bb1c]/20 px-2 py-0.5 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#f0bb1c]/30"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTimestampClick(seconds, currentVideoId || "");
                }}
              >
                <FiClock className="size-3" />
                {typeof children === "string" && children === "timestamp"
                  ? displayTimestamp
                  : children}
              </button>
            );
          }

          // CRITICAL FIX: First check if href is a timestamp
          if (href && onTimestampClick) {
            // Check if it's a simple timestamp format (most common case from the AI)
            const seconds = parseTimestamp(href);
            if (seconds !== null) {
              // This is a timestamp link - return a button instead of a link
              return (
                <button
                  className="inline-flex items-center gap-1 rounded-md bg-[#f0bb1c]/20 px-2 py-0.5 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#f0bb1c]/30"
                  onClick={(e) => {
                    // Make absolutely sure default navigation is prevented
                    e.preventDefault();
                    e.stopPropagation();
                    // Call the timestamp handler
                    onTimestampClick(seconds, currentVideoId || "");
                  }}
                >
                  <FiClock className="size-3" />
                  {children}
                </button>
              );
            }

            // Check if the link text contains a timestamp (fallback)
            if (
              typeof children === "string" ||
              (Array.isArray(children) && typeof children[0] === "string")
            ) {
              const childText = Array.isArray(children)
                ? children[0]
                : children;
              const textSeconds = parseTimestamp(childText);

              if (textSeconds !== null) {
                return (
                  <button
                    className="inline-flex items-center gap-1 rounded-md bg-[#f0bb1c]/20 px-2 py-0.5 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#f0bb1c]/30"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onTimestampClick(textSeconds, currentVideoId || "");
                    }}
                  >
                    <FiClock className="size-3" />
                    {children}
                  </button>
                );
              }
            }

            // Check for YouTube URLs (last resort)
            try {
              const url = new URL(href);
              if (
                (url.hostname.includes("youtube.com") ||
                  url.hostname.includes("youtu.be")) &&
                url.searchParams.has("t")
              ) {
                const timestamp = url.searchParams.get("t") || "";
                const timeSeconds = parseTimestamp(timestamp);

                if (timeSeconds !== null) {
                  return (
                    <button
                      className="inline-flex items-center gap-1 rounded-md bg-[#f0bb1c]/20 px-2 py-0.5 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#f0bb1c]/30"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onTimestampClick(
                          timeSeconds,
                          url.searchParams.get("v") || currentVideoId || ""
                        );
                      }}
                    >
                      <FiClock className="size-3" />
                      {children}
                    </button>
                  );
                }
              }
            } catch {
              // Not a valid URL, continue with other link handling
            }
          }

          // Internal links - but make sure they're not timestamp-like
          if (href?.startsWith("/") && !isTimestamp(href)) {
            return (
              <Link
                href={href}
                className="ml-1 rounded-sm bg-[#f0bb1c] px-2 py-1 text-black hover:bg-[#f0bb1c]/80 hover:transition-all"
                {...props}
              >
                {children}
              </Link>
            );
          }

          // External links - but make sure they're not timestamp-like
          if (!isTimestamp(href)) {
            return (
              <a
                href={href}
                className="break-all text-[#f0bb1c] underline hover:text-[#f0bb1c]/80"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            );
          }

          // If we got here, it might be a timestamp we couldn't recognize - just return a styled span
          return <span className="text-[#f0bb1c]">{children}</span>;
        },
        h1({ children }) {
          return <h1 className="text-3xl font-bold text-white">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-2xl font-bold text-white">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-xl font-bold text-white">{children}</h3>;
        },
        h4({ children }) {
          return <h4 className="text-lg font-bold text-white">{children}</h4>;
        },
        h5({ children }) {
          return <h5 className="text-base font-bold text-white">{children}</h5>;
        },
        h6({ children }) {
          return <h6 className="text-sm font-bold text-white">{children}</h6>;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = React.memo(NonMemoizedMarkdown, (prev, next) => {
  return prev.children === next.children;
});
