// components/PlyrPlayer.js
import Plyr from "plyr"; // ES6 import as per README :contentReference[oaicite:2]{index=2}
import { useEffect, useRef } from "react";
import "plyr/dist/plyr.css";

// Custom CSS overrides for Plyr to match our site theme
const customPlyrStyles = `
  :root {
    --plyr-color-main: #f0bb1c;
    --plyr-audio-controls-background: #111;
    --plyr-audio-control-color: #fff;
    --plyr-audio-control-color-hover: var(--plyr-color-main);
    --plyr-badge-background: #18181b;
    --plyr-badge-border-radius: 4px;
    --plyr-badge-text-color: #fff;
    --plyr-captions-background: rgba(0, 0, 0, 0.9);
    --plyr-captions-text-color: #fff;
    --plyr-control-icon-size: 18px;
    --plyr-control-radius: 4px;
    --plyr-control-spacing: 10px;
    --plyr-control-toggle-checked-background: var(--plyr-color-main);
    --plyr-control-toggle-off-background: #18181b;
    --plyr-focus-visible-color: var(--plyr-color-main);
    --plyr-menu-background: #18181b;
    --plyr-menu-border-color: #27272a;
    --plyr-menu-color: #fff;
    --plyr-menu-radius: 4px;
    --plyr-progress-loading-background: #3f3f46;
    --plyr-progress-loading-size: 15px;
    --plyr-tooltip-background: #18181b;
    --plyr-tooltip-border-radius: 4px;
    --plyr-tooltip-color: #fff;
    --plyr-tooltip-padding: 8px;
    --plyr-tooltip-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    --plyr-video-background: #000;
    --plyr-video-control-color: #fff;
    --plyr-video-control-color-hover: #000;
  }

  .plyr--video {
    background-color: #000;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .plyr__control--overlaid {
    background: rgba(240, 187, 28, 0.9);
    color: #000;
  }

  .plyr__control--overlaid:hover {
    background: rgba(240, 187, 28, 1);
  }

  .plyr--full-ui input[type=range] {
    color: var(--plyr-color-main);
  }

  .plyr__control.plyr__tab-focus {
    box-shadow: 0 0 0 2px rgba(240, 187, 28, 0.5);
  }

  .plyr__menu__container {
    background: #18181b;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  }

  .plyr__menu__container .plyr__control {
    color: #fff;
  }

  .plyr__menu__container .plyr__control--forward:hover,
  .plyr__menu__container .plyr__control--back:hover {
    background: #27272a;
  }

  .plyr__menu__container .plyr__menu__value {
    background-color: var(--plyr-color-main);
    color: #000;
    padding: 2px 6px;
    border-radius: 3px;
  }
`;

interface PlyrPlayerProps {
  src: string;
  poster?: string;
  options?: Plyr.Options;
  onProgress?: (percent: number, currentTime: number, duration: number) => void;
  onEnded?: () => void;
  initialPosition?: number;
}

export default function PlyrPlayer({
  src,
  poster,
  options = {}, // any Plyr options
  onProgress,
  onEnded,
  initialPosition = 0,
}: PlyrPlayerProps) {
  const mediaRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const hasSetInitialPosition = useRef(false);
  const lastUpdateRef = useRef<number>(0);
  const cleanupCalledRef = useRef(false);
  const prevInitialPositionRef = useRef(initialPosition);

  // Inject custom styles
  useEffect(() => {
    // Create style element
    const styleElement = document.createElement("style");
    styleElement.innerHTML = customPlyrStyles;
    document.head.appendChild(styleElement);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Reset position flag when src changes
  useEffect(() => {
    console.log(
      `Video source changed: ${src}, initial position: ${initialPosition}`
    );
    hasSetInitialPosition.current = false;
  }, [src]);

  // Handle explicit seeking when initialPosition changes
  useEffect(() => {
    // Only react if the initialPosition actually changed and player exists
    if (
      initialPosition !== prevInitialPositionRef.current &&
      mediaRef.current &&
      playerRef.current
    ) {
      console.log(
        `Seeking to new position: ${initialPosition}s (previous: ${prevInitialPositionRef.current}s)`
      );

      // Update the video's current time
      mediaRef.current.currentTime = initialPosition;

      // Update reference to prevent repeated seeking
      prevInitialPositionRef.current = initialPosition;
    }
  }, [initialPosition]);

  useEffect(() => {
    if (!mediaRef.current) return;

    // Reset cleanup flag on mount
    cleanupCalledRef.current = false;

    // Create player instance
    const player = new Plyr(mediaRef.current, {
      // Default options
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "captions",
        "settings",
        "fullscreen",
      ],
      // Merge with user options
      ...options,
    });
    playerRef.current = player;
    console.log("Plyr instance created");

    // Handle progress updates with proper throttling
    const handleTimeUpdate = () => {
      if (mediaRef.current && onProgress && !cleanupCalledRef.current) {
        const duration = mediaRef.current.duration;
        const currentTime = mediaRef.current.currentTime;

        // Only call onProgress every 200ms to avoid performance issues
        // but still maintain smooth progress updates
        const now = Date.now();
        if (now - lastUpdateRef.current > 200) {
          if (duration > 0 && !isNaN(duration)) {
            // Calculate watched percentage (0-100)
            const percent = Math.floor((currentTime / duration) * 100);
            onProgress(percent, currentTime, duration);
          }
          lastUpdateRef.current = now;
        }
      }
    };

    // Handle video ended
    const handleEnded = () => {
      if (onEnded && !cleanupCalledRef.current) {
        console.log("Video playback ended");
        onEnded();
      }
    };

    // Log when video is ready
    const handleCanPlay = () => {
      console.log("Video can play now, duration:", mediaRef.current?.duration);

      // Set initial position once the video can play
      if (
        initialPosition > 0 &&
        mediaRef.current &&
        !hasSetInitialPosition.current
      ) {
        mediaRef.current.currentTime = initialPosition;
        hasSetInitialPosition.current = true;
        console.log("Set initial position to:", initialPosition);
      }
    };

    // Attach event listeners
    mediaRef.current.addEventListener("timeupdate", handleTimeUpdate);
    mediaRef.current.addEventListener("ended", handleEnded);
    mediaRef.current.addEventListener("canplay", handleCanPlay);

    // Set initial position when metadata is loaded
    const handleLoadedMetadata = () => {
      console.log(
        "Video metadata loaded, duration:",
        mediaRef.current?.duration
      );

      if (
        initialPosition > 0 &&
        mediaRef.current &&
        !hasSetInitialPosition.current &&
        mediaRef.current.readyState >= 2
      ) {
        mediaRef.current.currentTime = initialPosition;
        hasSetInitialPosition.current = true;
        console.log("Set initial position on metadata load:", initialPosition);

        // Save initial position for comparison
        prevInitialPositionRef.current = initialPosition;
      }
    };

    mediaRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);

    // Safer cleanup function that only removes event listeners
    // but doesn't destroy the player which seems to cause issues
    return () => {
      console.log("Cleaning up Plyr component");
      cleanupCalledRef.current = true;
      if (mediaRef.current) {
        mediaRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        mediaRef.current.removeEventListener("ended", handleEnded);
        mediaRef.current.removeEventListener("canplay", handleCanPlay);
        mediaRef.current.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
      }

      // Don't destroy player as it causes the video to disappear
      // player.destroy();
    };
  }, [options, onProgress, onEnded, initialPosition]);

  return (
    <div className="plyr__video-embed overflow-hidden rounded-lg shadow-lg">
      <video ref={mediaRef} playsInline controls data-poster={poster}>
        <source src={src} type={`video/mp4`} />
      </video>
    </div>
  );
}
