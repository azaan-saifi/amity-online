"use client";

import React, { useEffect, useState } from "react";

import {
  isQuizCompleted,
  getQuizProgress,
} from "@/lib/actions/quizProgress.action";

interface BlurWrapperProps {
  children: React.ReactNode;
  componentName: string; // "notes" or "assistant"
  videoId: string;
  userId: string;
}

const BlurWrapper = ({
  children,
  componentName,
  videoId,
  userId,
}: BlurWrapperProps) => {
  const [isBlurred, setIsBlurred] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if quiz is active for this video
  useEffect(() => {
    const checkQuizState = async () => {
      console.log("Checking quiz state...");
      if (!videoId || !userId) {
        setIsBlurred(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // First check if quiz is completed
        const completed = await isQuizCompleted(videoId, userId);

        if (completed) {
          // If quiz is completed, don't blur
          setIsBlurred(false);
          setIsLoading(false);
          return;
        }

        // Then check if quiz has been started but not completed
        const progressData = await getQuizProgress(videoId, userId);

        const progress = JSON.parse(progressData);

        // Only blur if quiz has started but not completed
        setIsBlurred(progress.quizStarted && !progress.quizCompleted);
      } catch (error) {
        console.error("Error checking quiz state:", error);
        setIsBlurred(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkQuizState();
  }, [videoId, userId]);

  // Show a skeleton loader while checking quiz state
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 rounded-lg bg-zinc-900 p-4">
        <div className="h-6 w-3/4 rounded bg-zinc-800"></div>
        <div className="space-y-2">
          <div className="h-4 rounded bg-zinc-800"></div>
          <div className="h-4 rounded bg-zinc-800"></div>
          <div className="h-4 w-5/6 rounded bg-zinc-800"></div>
        </div>
      </div>
    );
  }

  // Not blurred - show the content normally
  if (!isBlurred) {
    return <>{children}</>;
  }

  // Blurred content
  return (
    <div className="relative">
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-lg bg-black/80 backdrop-blur-sm">
        <div className="mb-2 text-2xl text-yellow-500">🔒</div>
        <h3 className="mb-2 text-center text-lg font-bold text-white">
          {componentName === "notes" ? "Notes" : "AI Assistant"} Locked
        </h3>
        <p className="max-w-md text-center text-sm text-zinc-400">
          {componentName === "notes"
            ? "You cannot access your notes during a quiz. You may refer to the video if needed."
            : "AI assistance is not available during quizzes. You may refer to the video if needed."}
        </p>
      </div>
      <div className="pointer-events-none opacity-20 blur-sm">{children}</div>
    </div>
  );
};

export default BlurWrapper;
