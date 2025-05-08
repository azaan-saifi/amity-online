"use client";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  FiClock,
  FiMenu,
  FiLock,
  FiCheckCircle,
  FiChevronRight,
  FiX,
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiSkipBack,
  FiSkipForward,
} from "react-icons/fi";

import BlurWrapper from "@/components/student/BlurWrapper";
import CourseAiAssistant from "@/components/student/CourseAiAssistant";
import CourseNotes from "@/components/student/CourseNotes";
import CoursePracticeQuiz from "@/components/student/CoursePracticeQuiz";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { VideoListShimmer, VideoPlayerShimmer } from "@/components/ui/shimmer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCourseById, getVideosForCourse } from "@/lib/actions/course.action";
import {
  getNoteForVideo,
  saveNote,
  NoteData,
} from "@/lib/actions/notes.action";
import { isQuizCompleted } from "@/lib/actions/quizProgress.action";
import {
  getCourseProgress,
  getVideoProgress,
  updateVideoProgress,
  // updateVideoProgress,
} from "@/lib/actions/videoProgress.action";

// Import ReactPlayer dynamically to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => <div className="aspect-video w-full bg-zinc-900" />,
});

interface Video {
  _id: string;
  title: string;
  thumbnail: string;
  duration: string;
  url: string;
  position: number;
}

interface Course {
  _id: string;
  title: string;
}

interface VideoProgress {
  _id: string;
  videoId: string;
  watchedPercent: number;
  completed: boolean;
}

interface Note {
  _id: string;
  content: string;
  markdownContent: string;
  title: string;
  tags: string[];
  isPublic: boolean;
}

const CourseContent = () => {
  const { id } = useParams();
  const { userId } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [maxCompletionPercent, setMaxCompletionPercent] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(
    new Set()
  );
  const [quizCompletedForVideo, setQuizCompletedForVideo] = useState(false);

  // Enhanced note state
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("Untitled Note");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const playerRef = useRef<typeof ReactPlayer>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("notes");
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  // Add refs for scrolling
  const notesRef = useRef<HTMLDivElement>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const [initialStartPosition, setInitialStartPosition] = useState(0);
  const [currentPlaybackPosition, setCurrentPlaybackPosition] = useState(0);
  // Add a flag to track when we've manually sought to prevent infinite loops
  const hasInitialSeekRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [fullscreen, setFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Add effect to stop the player when navigating away or unmounting
  useEffect(() => {
    // Cleanup function to ensure player stops when component unmounts
    return () => {
      setIsPlaying(false);
      // Stronger cleanup for the video element
      try {
        // Find all video elements and pause them
        const videoElements = document.querySelectorAll("video");
        videoElements.forEach((video) => {
          (video as HTMLVideoElement).pause();
          (video as HTMLVideoElement).src = "";
          (video as HTMLVideoElement).load();
        });

        // Clear any audio elements too as a precaution
        const audioElements = document.querySelectorAll("audio");
        audioElements.forEach((audio) => {
          (audio as HTMLAudioElement).pause();
          (audio as HTMLAudioElement).src = "";
          (audio as HTMLAudioElement).load();
        });
      } catch (e) {
        console.error("Error stopping media:", e);
      }
    };
  }, []);

  // Add effect to log when right sidebar state changes
  useEffect(() => {
    console.log("Right sidebar state changed:", rightSidebarOpen);
  }, [rightSidebarOpen]);

  // Setup window resize listener to detect mobile
  useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth < 768);
    }

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add effect to handle visibility changes and pause video
  useEffect(() => {
    // Handle page visibility changes (tab switching/minimizing)
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        setIsPlaying(false);
      }
    };

    // Handle before unload (page refresh/close)
    const handleBeforeUnload = () => {
      setIsPlaying(false);
    };

    // Set up event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isPlaying]);

  // Effect to automatically hide sidebar when AI Assistant or Practice Quiz is selected (on desktop)
  useEffect(() => {
    console.log("Active tab effect running for tab:", activeTab);

    // Add a flag to identify when we're in the middle of quiz completion
    const inQuizCompletionFlow =
      sessionStorage.getItem("quizCompletionInProgress") === "true";

    if (!isSmallScreen && !inQuizCompletionFlow) {
      if (activeTab === "assistant" || activeTab === "quiz") {
        console.log("Auto-hiding left sidebar and showing right sidebar");
        setSidebarOpen(false);
        setRightSidebarOpen(true);
      } else {
        console.log("Auto-hiding right sidebar for notes tab");
        setRightSidebarOpen(false);
      }
    }
  }, [activeTab, isSmallScreen]);

  // Fetch course data
  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    const fetchCourseData = async () => {
      try {
        setLoading(true);

        // Get course details
        const courseData = await getCourseById(id as string);
        if (courseData) {
          setCourse(JSON.parse(courseData));
        }

        // Get videos
        const videosData = await getVideosForCourse(id as string);
        const parsedVideos = JSON.parse(videosData as string);
        setVideos(parsedVideos);

        // Get progress for all videos
        const progressData = await getCourseProgress(id as string, userId);
        if (progressData) {
          const parsedData = JSON.parse(progressData);
          const completed = new Set<string>();

          console.log("Course progress data:", parsedData); // Debug log for progress data

          if (
            parsedData.progressRecords &&
            Array.isArray(parsedData.progressRecords)
          ) {
            parsedData.progressRecords.forEach((record: VideoProgress) => {
              if (record.completed) {
                completed.add(record.videoId);
              }
            });
          }

          setCompletedVideos(completed);

          // Add this to extract and set the overall course progress percentage
          if (parsedData.courseProgress) {
            setMaxCompletionPercent(parsedData.courseProgress.progress || 0);
          }
        }

        // Select the first video
        if (parsedVideos.length > 0) {
          handleVideoSelect(parsedVideos[0]);
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, userId]);

  // Update handleVideoSelect to set initial position without changing URL mid-playback
  const handleVideoSelect = async (video: Video) => {
    // Check if the user can access this video
    const videoIndex = videos.findIndex((v) => v._id === video._id);
    console.log("Video index:", videoIndex);

    // If it's not the first video, check if previous videos are completed
    if (videoIndex > 0) {
      const previousVideoId = videos[videoIndex - 1]._id;
      if (!completedVideos.has(previousVideoId)) {
        // Cannot access this video yet
        return;
      }
    }

    // Reset player state whenever a new video is selected
    setPlayerReady(false);
    // Reset the seek flag when selecting a new video
    hasInitialSeekRef.current = false;

    // Important: Don't change the sidebar state here if coming from the quiz completion flow
    console.log(
      "handleVideoSelect - rightSidebarOpen should stay:",
      rightSidebarOpen
    );

    setSelectedVideo(video);

    console.log("Selected video:", video);

    // Load video progress
    if (userId) {
      const progressData = await getVideoProgress(video._id, userId);

      if (progressData) {
        const progress = JSON.parse(progressData);
        console.log("Parsed progress:", progress);

        const percent = progress.watchedPercent || 0;
        setMaxCompletionPercent(percent);

        // Use playback position from the database
        if (
          progress.playbackPositionSeconds &&
          progress.playbackPositionSeconds > 0
        ) {
          // Store the position to be used when player mounts
          setInitialStartPosition(progress.playbackPositionSeconds);
          console.log(
            "Setting initial position from DB:",
            progress.playbackPositionSeconds
          );
        } else if (percent > 0 && percent < 95) {
          // Fallback to estimating position based on percentage if no position is saved
          const estimatedDuration = 600;
          const startTimeSeconds = Math.floor(
            (percent / 100) * estimatedDuration
          );
          setInitialStartPosition(startTimeSeconds);
          console.log("Estimating position from percent:", startTimeSeconds);
        } else {
          // Reset for completed or new videos
          setInitialStartPosition(0);
          console.log("Resetting position to 0");
        }

        // Load notes
        const noteData = await getNoteForVideo(video._id, userId);
        if (noteData) {
          const note = JSON.parse(noteData) as Note;
          setNoteContent(note.markdownContent || note.content);
          setNoteTitle(note.title || "Untitled Note");
        } else {
          setNoteContent("");
          setNoteTitle(`Notes for: ${video.title}`);
        }
      } else {
        setMaxCompletionPercent(0);
        setInitialStartPosition(0);
        console.log("No progress data found, starting from beginning");
      }
    }
  };

  // Update handleVideoProgress to save position without causing re-renders
  const handleVideoProgress = async (
    percent: number,
    playedSeconds: number
  ) => {
    if (selectedVideo && userId) {
      // Only update database periodically to reduce server calls
      const now = Date.now();
      if (playedSeconds > 0 && now - lastUpdateTimeRef.current > 5000) {
        // Only save to database, don't update state that would cause re-renders
        const result = await updateVideoProgress(
          selectedVideo._id,
          id as string,
          Math.max(percent, maxCompletionPercent), // Only send the highest percentage
          userId,
          Math.floor(playedSeconds) // Save playback position in seconds
        );

        // Update completed videos if needed
        if (result.completed && !completedVideos.has(selectedVideo._id)) {
          // Mark as completed
          setCompletedVideos((prev) => new Set([...prev, selectedVideo._id]));
          console.log("Marked video as completed:", selectedVideo._id);
        }

        lastUpdateTimeRef.current = now;
      }

      // Only update max percentage locally if it increases
      if (percent > maxCompletionPercent) {
        setMaxCompletionPercent(percent);
      }
    }
  };

  // Save note
  const handleSaveNote = async () => {
    if (!selectedVideo || !userId) return;

    try {
      setIsSavingNote(true);

      const noteData: NoteData = {
        content: noteContent, // Plain text fallback
        markdownContent: noteContent,
        title: noteTitle,
      };

      await saveNote(selectedVideo._id, noteData, userId);
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSavingNote(false);
    }
  };

  // Find the current video index and next video
  const currentVideoIndex = selectedVideo
    ? videos.findIndex((v) => v._id === selectedVideo._id)
    : 0;

  const nextVideo =
    currentVideoIndex < videos.length - 1
      ? videos[currentVideoIndex + 1]
      : null;

  // Check if quiz is completed for current video when it changes
  useEffect(() => {
    const checkQuizCompletion = async () => {
      if (!selectedVideo?._id || !userId) {
        setQuizCompletedForVideo(false);
        return;
      }

      try {
        const completed = await isQuizCompleted(selectedVideo._id, userId);
        setQuizCompletedForVideo(completed);
      } catch (error) {
        console.error("Error checking quiz completion:", error);
        setQuizCompletedForVideo(false);
      }
    };

    checkQuizCompletion();
  }, [selectedVideo?._id, userId]);

  // Update canAccessNextVideo to check if quiz is completed or not needed
  const canAccessNextVideo =
    (maxCompletionPercent > 95 && quizCompletedForVideo) || // Quiz completed
    (maxCompletionPercent > 95 && activeTab !== "quiz"); // Not on quiz tab yet

  // Handle quiz completion - just refresh the check
  const handleQuizCompleted = () => {
    console.log("Quiz completed callback triggered!");

    // Set a flag to prevent the useEffect from changing sidebar state
    sessionStorage.setItem("quizCompletionInProgress", "true");

    // Set quiz as completed
    setQuizCompletedForVideo(true);

    // First, explicitly close the right sidebar and change the active tab back to notes
    setRightSidebarOpen(false);
    setActiveTab("notes");
    console.log("Right sidebar state set to false, active tab set to notes");

    // Use a timeout to ensure the state updates before proceeding
    setTimeout(() => {
      // Navigate to the next video if available
      if (nextVideo) {
        console.log("Navigating to next video...");
        handleVideoSelect(nextVideo);

        // Clear the flag after navigation
        setTimeout(() => {
          sessionStorage.removeItem("quizCompletionInProgress");
        }, 200);
      } else {
        // If no next video, just clear the flag
        sessionStorage.removeItem("quizCompletionInProgress");
      }
    }, 50); // Short timeout to ensure state changes apply
  };

  // Format seconds into MM:SS format
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Modified handler to stop all media when toggling play state to false
  const togglePlay = () => {
    // If we're about to pause the player, ensure all media elements are stopped
    if (isPlaying) {
      try {
        // Find all video elements and pause them to be extra safe
        document.querySelectorAll("video").forEach((video) => {
          (video as HTMLVideoElement).pause();
        });
      } catch (e) {
        console.error("Error stopping videos in toggle:", e);
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    setMuted(!muted);
  };

  // Skip forward 10 seconds
  const skipForward = () => {
    if (playerRef.current) {
      // @ts-expect-error - playerRef.current.seekTo exists but TypeScript doesn't know the type
      const currentTime = playerRef.current.getCurrentTime();
      // @ts-expect-error - playerRef.current.seekTo exists but TypeScript doesn't know the type
      playerRef.current.seekTo(currentTime + 10);
    }
  };

  // Skip backward 10 seconds
  const skipBackward = () => {
    if (playerRef.current) {
      // @ts-expect-error - playerRef.current.seekTo exists but TypeScript doesn't know the type
      const currentTime = playerRef.current.getCurrentTime();
      // @ts-expect-error - playerRef.current.seekTo exists but TypeScript doesn't know the type
      playerRef.current.seekTo(Math.max(0, currentTime - 10));
    }
  };

  // Handle seeking when user interacts with progress bar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (playerRef.current) {
      // @ts-expect-error - playerRef.current.seekTo exists but TypeScript doesn't know the type
      playerRef.current.seekTo(seekTime);
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && videoContainerRef.current) {
      videoContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setFullscreen(!fullscreen);
  };

  // Update fullscreen state when exiting with Escape key
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Add effect to ensure we clean up on route changes
  useEffect(() => {
    // Cleanup function for route changes
    const handleRouteChangeStart = () => {
      // Immediately stop playing
      setIsPlaying(false);

      // More aggressive cleanup for media elements
      try {
        // Find all video elements and pause them
        const videoElements = document.querySelectorAll("video");
        videoElements.forEach((video) => {
          (video as HTMLVideoElement).pause();
          (video as HTMLVideoElement).src = "";
          (video as HTMLVideoElement).load();
        });

        // Clear any audio elements too as a precaution
        const audioElements = document.querySelectorAll("audio");
        audioElements.forEach((audio) => {
          (audio as HTMLAudioElement).pause();
          (audio as HTMLAudioElement).src = "";
          (audio as HTMLAudioElement).load();
        });
      } catch (e) {
        console.error("Error cleaning up media on route change:", e);
      }
    };

    // Add event listeners for route changes
    window.addEventListener("beforeunload", handleRouteChangeStart);

    // For App Router, we can't directly listen to route changes
    // We need to handle cleanup in the component unmount effect

    return () => {
      window.removeEventListener("beforeunload", handleRouteChangeStart);
      // Ensure cleanup happens now
      handleRouteChangeStart();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-full">
        {/* Fixed Header Placeholder */}
        <div className="fixed left-0 top-16 z-20 flex h-16 w-full items-center border-b border-zinc-800 bg-black px-4">
          <div className="flex items-center gap-3">
            <div className="size-10 animate-pulse rounded-full bg-zinc-800" />
            <div className="h-6 w-48 animate-pulse rounded-md bg-zinc-800" />
          </div>
        </div>

        {/* Fixed Sidebar Placeholder */}
        {!isSmallScreen && (
          <div className="left-18 fixed top-32 z-10 hidden h-[calc(100vh-8rem)] w-72 bg-black md:block">
            <div className="h-full p-4">
              <VideoListShimmer />
            </div>
          </div>
        )}

        {/* Main Content Area with Shimmer */}
        <div className={`flex-1 p-4 pt-20 ${!isSmallScreen ? "ml-72" : ""}`}>
          <VideoPlayerShimmer />
        </div>
      </div>
    );
  }

  const handleNextVideo = () => {
    if (canAccessNextVideo && nextVideo) {
      handleVideoSelect(nextVideo);
    }
  };

  const handleTabChange = (value: string) => {
    console.log("Tab change triggered:", value, "from previous:", activeTab);
    setActiveTab(value);

    // For desktop only
    if (!isSmallScreen) {
      if (value === "notes") {
        // Close right sidebar and scroll to notes section
        console.log(
          "Setting right sidebar to false because notes tab selected"
        );
        setRightSidebarOpen(false);
        // Use setTimeout to ensure the DOM has updated before scrolling
        setTimeout(() => {
          if (notesRef.current) {
            notesRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else if (value === "assistant" || value === "quiz") {
        // If clicking the same tab that's already active AND the sidebar is open
        if (activeTab === value && rightSidebarOpen) {
          // Close the sidebar
          console.log("Closing sidebar because same tab clicked again");
          setRightSidebarOpen(false);
        } else {
          // Either opening a new tab or reopening after closing
          console.log("Opening sidebar for tab:", value);
          setRightSidebarOpen(true);
        }
      }
    }
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(false);
  };

  return (
    <div className="flex h-full">
      {/* Page Header - Course Title and Hamburger */}
      <div className="fixed left-0 top-16 z-20 flex h-16 w-full items-center border-b border-zinc-800 bg-black px-4">
        <div className="flex items-center gap-3">
          {!isSmallScreen ? (
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="rounded-full p-2 text-white hover:text-[#f0bb1c]"
            >
              <FiMenu className="size-5" />
            </button>
          ) : (
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="rounded-full p-2 text-white hover:text-[#f0bb1c]"
                  aria-label="Open menu"
                >
                  <FiMenu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[85%] border-r border-zinc-800 bg-black p-0"
              >
                <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
                  <h2 className="text-lg font-bold text-[#f0bb1c]">
                    Course Videos
                  </h2>
                </div>
                <div className="custom-scrollbar h-[calc(100vh-4rem)] overflow-y-auto p-4">
                  <div className="space-y-3">
                    {videos.map((video, index) => {
                      const isCompleted = completedVideos.has(video._id);
                      const isPrevCompleted =
                        index === 0 ||
                        completedVideos.has(videos[index - 1]._id);
                      const isLocked = index > 0 && !isPrevCompleted;

                      return (
                        <button
                          key={video._id}
                          onClick={() => !isLocked && handleVideoSelect(video)}
                          className={`group flex w-full items-center gap-3 rounded-md p-3 text-left transition-all ${
                            isLocked
                              ? "cursor-not-allowed text-white opacity-60"
                              : selectedVideo?._id === video._id
                              ? "bg-[#f0bb1c]/10 text-[#f0bb1c]"
                              : "text-white hover:bg-zinc-900 hover:text-[#f0bb1c]"
                          }`}
                        >
                          {/* Thumbnail with completion overlay */}
                          <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md">
                            <Image
                              src={video.thumbnail}
                              alt={video.title}
                              width={100}
                              height={100}
                              className="size-full object-cover"
                            />
                            {isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                <FiLock className="size-5 text-zinc-400" />
                              </div>
                            )}
                            {isCompleted && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <div className="rounded-full bg-black/70 p-1">
                                  <FiCheckCircle className="size-5 text-[#f0bb1c]" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h3 className="truncate text-sm font-medium">
                              {video.title}
                            </h3>
                            <p className="mt-1 flex items-center text-xs text-zinc-400">
                              <FiClock className="mr-1 size-3" />
                              {video.duration}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
          <h1 className="text-xl font-bold text-white">
            {course?.title || "Course Content"}
          </h1>
        </div>
      </div>

      {/* Fixed Sidebar for Desktop - Left */}
      {!isSmallScreen && sidebarOpen && (
        <div className="left-18 fixed top-32 z-10 hidden h-[calc(100vh-8rem)] w-72 bg-black transition-transform duration-300 ease-in-out md:block">
          <div className="custom-scrollbar h-full overflow-y-auto p-4">
            <div className="space-y-3">
              {videos.map((video, index) => {
                const isCompleted = completedVideos.has(video._id);
                const isPrevCompleted =
                  index === 0 || completedVideos.has(videos[index - 1]._id);
                const isLocked = index > 0 && !isPrevCompleted;

                return (
                  <button
                    key={video._id}
                    onClick={() => !isLocked && handleVideoSelect(video)}
                    className={`group flex w-full items-center gap-3 rounded-md p-3 text-left transition-all ${
                      isLocked
                        ? "cursor-not-allowed text-white opacity-60"
                        : selectedVideo?._id === video._id
                        ? "bg-[#f0bb1c]/10 text-[#f0bb1c]"
                        : "text-white hover:bg-zinc-900 hover:text-[#f0bb1c]"
                    }`}
                  >
                    {/* Thumbnail with completion overlay */}
                    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        width={100}
                        height={100}
                        className="size-full object-cover"
                      />
                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                          <FiLock className="size-5 text-zinc-400" />
                        </div>
                      )}
                      {isCompleted && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="rounded-full bg-black/70 p-1">
                            <FiCheckCircle className="size-5 text-[#f0bb1c]" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="truncate text-sm font-medium">
                        {video.title}
                      </h3>
                      <p className="mt-1 flex items-center text-xs text-zinc-400">
                        <FiClock className="mr-1 size-3" />
                        {video.duration}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Sidebar for Desktop - Right */}
      {!isSmallScreen && rightSidebarOpen && (
        <div className="fixed right-0 top-32 z-10 hidden h-[calc(100vh-8rem)] w-2/5 border-l border-zinc-800 bg-black transition-transform duration-300 ease-in-out md:block">
          <div className="relative h-full bg-black">
            <button
              onClick={toggleRightSidebar}
              className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <FiX className="size-5" />
            </button>

            <div className="h-full overflow-y-auto pt-12">
              {activeTab === "assistant" && (
                <BlurWrapper
                  componentName="assistant"
                  videoId={selectedVideo?._id || ""}
                  userId={userId as string}
                >
                  <CourseAiAssistant
                    userId={userId as string}
                    videoId={selectedVideo?._id}
                    currentTimestamp={currentPlaybackPosition}
                    courseId={id as string}
                    onSeekTo={(seconds) => {
                      if (playerRef.current) {
                        // @ts-expect-error - playerRef.current.seekTo exists but TypeScript doesn't know the type
                        playerRef.current.seekTo(seconds);
                      }
                    }}
                  />
                </BlurWrapper>
              )}

              {activeTab === "quiz" && (
                <CoursePracticeQuiz
                  videoTitle={selectedVideo?.title || ""}
                  videoId={selectedVideo?._id || ""}
                  videoProgressId={selectedVideo?._id || ""}
                  setCurrentPlaybackPosition={setCurrentPlaybackPosition}
                  userId={userId as string}
                  courseId={id as string}
                  watchedPercent={maxCompletionPercent}
                  onQuizCompleted={handleQuizCompleted}
                  onSeekTo={(seconds) => {
                    if (playerRef.current) {
                      // @ts-expect-error - playerRef.current.seekTo exists but TypeScript doesn't know the type
                      playerRef.current.seekTo(seconds);
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 p-4 pt-16 transition-all duration-300 ease-in-out ${
          !isSmallScreen && sidebarOpen ? "ml-72" : ""
        } ${!isSmallScreen && rightSidebarOpen ? "mr-[40%]" : ""}`}
      >
        {selectedVideo ? (
          <div>
            {/* Desktop-specific layout with tabs above video */}
            {!isSmallScreen && (
              <div className="mb-6">
                <Tabs value={activeTab} className="w-full">
                  <div className="flex justify-end">
                    <TabsList className="mb-4 flex w-auto justify-end rounded-lg border border-zinc-800 bg-black p-1">
                      <TabsTrigger
                        value="notes"
                        onClick={() => handleTabChange("notes")}
                        data-state={activeTab === "notes" ? "active" : ""}
                        className="rounded-md data-[state=active]:bg-gradient-yellow data-[state=active]:text-black"
                      >
                        Notes
                      </TabsTrigger>
                      <TabsTrigger
                        value="assistant"
                        onClick={() => handleTabChange("assistant")}
                        data-state={activeTab === "assistant" ? "active" : ""}
                        className="rounded-md data-[state=active]:bg-gradient-yellow data-[state=active]:text-black"
                      >
                        AI Assistant
                      </TabsTrigger>
                      <TabsTrigger
                        value="quiz"
                        onClick={() => handleTabChange("quiz")}
                        data-state={activeTab === "quiz" ? "active" : ""}
                        className="rounded-md data-[state=active]:bg-gradient-yellow data-[state=active]:text-black"
                      >
                        Practice Questions
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </Tabs>
              </div>
            )}

            {/* Main layout - Adjusts based on both small screen and sidebar states */}
            <div className={`${!isSmallScreen ? "flex gap-6" : "space-y-6"}`}>
              {/* Left column with video and notes */}
              <div
                className={`${
                  !isSmallScreen && rightSidebarOpen ? "w-full" : "w-full"
                }`}
              >
                {/* Video player */}
                <div
                  ref={videoContainerRef}
                  className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-xl"
                >
                  {selectedVideo && (
                    <ReactPlayer
                      key={`video-${selectedVideo._id}-${isPlaying}`}
                      ref={playerRef}
                      url={selectedVideo.url}
                      width="100%"
                      height="100%"
                      playing={isPlaying}
                      volume={volume}
                      muted={muted}
                      controls={false}
                      stopOnUnmount={true}
                      playsinline={true}
                      onError={(e) => {
                        console.error("ReactPlayer error:", e);
                        // Reset player state on error
                        setIsPlaying(false);
                      }}
                      onReady={() => {
                        setPlayerReady(true);
                        // Seek to initial position when player is ready, but only once
                        if (
                          initialStartPosition > 0 &&
                          playerRef.current &&
                          !hasInitialSeekRef.current
                        ) {
                          // @ts-expect-error - playerRef.current.seekTo exists but TypeScript doesn't know the type
                          playerRef.current.seekTo(initialStartPosition);
                          // Mark that we've already done the initial seek
                          hasInitialSeekRef.current = true;
                        }
                      }}
                      onProgress={(state) => {
                        if (playerReady) {
                          // Calculate current progress percentage
                          const currentPercent = Math.round(state.played * 100);

                          // Update current position without triggering additional seeks
                          setCurrentPlaybackPosition(state.playedSeconds);

                          // Only update progress periodically to avoid too many server calls
                          const now = Date.now();
                          if (now - lastUpdateTimeRef.current > 5000) {
                            handleVideoProgress(
                              currentPercent,
                              state.playedSeconds
                            );
                            lastUpdateTimeRef.current = now;
                          }
                        }
                      }}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                      onDuration={(duration) => setDuration(duration)}
                      config={{
                        file: {
                          attributes: {
                            controlsList: "nodownload",
                            disablePictureInPicture: true,
                          },
                          forceVideo: true,
                        },
                      }}
                    />
                  )}

                  {/* Custom overlay controls */}
                  <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100">
                    {/* Top gradient overlay for video title */}
                    <div className="w-full bg-gradient-to-b from-black/70 to-transparent p-4">
                      <h3 className="text-sm font-semibold text-white sm:text-base">
                        {selectedVideo.title}
                      </h3>
                    </div>

                    {/* Bottom controls */}
                    <div className="w-full bg-gradient-to-t from-black to-transparent p-3">
                      {/* Progress bar */}
                      <div className="flex w-full items-center gap-2">
                        <span className="hidden text-xs text-white sm:block">
                          {formatTime(currentPlaybackPosition)}
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={duration}
                          value={currentPlaybackPosition}
                          onChange={handleSeek}
                          className="h-1.5 flex-1 appearance-none rounded-full bg-zinc-600"
                          style={{
                            background: `linear-gradient(to right, #f0bb1c ${
                              (currentPlaybackPosition / duration) * 100
                            }%, #4b5563 ${
                              (currentPlaybackPosition / duration) * 100
                            }%)`,
                            WebkitAppearance: "none",
                          }}
                        />
                        <span className="hidden text-xs text-white sm:block">
                          {formatTime(duration)}
                        </span>
                      </div>

                      {/* Media controls */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={skipBackward}
                            className="rounded-full p-1 text-white hover:bg-white/20 sm:p-2"
                            aria-label="Skip back 10 seconds"
                          >
                            <FiSkipBack className="size-4" />
                          </button>

                          <button
                            onClick={togglePlay}
                            className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 sm:p-3"
                            aria-label={isPlaying ? "Pause" : "Play"}
                          >
                            {isPlaying ? (
                              <FiPause className="size-4" />
                            ) : (
                              <FiPlay className="size-4" />
                            )}
                          </button>

                          <button
                            onClick={skipForward}
                            className="rounded-full p-1 text-white hover:bg-white/20 sm:p-2"
                            aria-label="Skip forward 10 seconds"
                          >
                            <FiSkipForward className="size-4" />
                          </button>

                          <div className="hidden items-center gap-2 sm:flex">
                            <button
                              onClick={toggleMute}
                              className="rounded-full p-1 text-white hover:bg-white/20"
                              aria-label={muted ? "Unmute" : "Mute"}
                            >
                              {muted || volume === 0 ? (
                                <FiVolumeX className="size-4" />
                              ) : (
                                <FiVolume2 className="size-4" />
                              )}
                            </button>

                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.1}
                              value={volume}
                              onChange={handleVolumeChange}
                              className="h-1 w-16 appearance-none rounded-full bg-zinc-600"
                              style={{
                                background: `linear-gradient(to right, #f0bb1c ${
                                  volume * 100
                                }%, #4b5563 ${volume * 100}%)`,
                                WebkitAppearance: "none",
                              }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={toggleFullscreen}
                          className="rounded-full p-1 text-white hover:bg-white/20 sm:p-2"
                          aria-label="Toggle fullscreen"
                        >
                          <FiMaximize className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Title with Next Video button */}
                <div className="my-4 flex items-center justify-between">
                  <h1 className="text-xl font-bold text-white">
                    {selectedVideo.title}
                  </h1>
                  {nextVideo && (
                    <button
                      onClick={handleNextVideo}
                      disabled={!canAccessNextVideo}
                      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${
                        canAccessNextVideo
                          ? "bg-gradient-yellow text-black hover:bg-gradient-yellow-hover"
                          : "cursor-not-allowed bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      Next Video
                      <FiChevronRight />
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mb-6 space-y-2">
                  <div className="h-1.5 w-full rounded-full bg-zinc-800">
                    <div
                      className="h-1.5 rounded-full bg-gradient-yellow"
                      style={{ width: `${maxCompletionPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>{maxCompletionPercent}% complete</span>
                    <span>
                      {currentVideoIndex + 1} of {videos.length}
                    </span>
                  </div>
                </div>

                {/* Mobile tabs or desktop Notes tab */}
                {isSmallScreen ? (
                  <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                  >
                    <TabsList className="mb-4 flex w-full justify-between rounded-lg border border-zinc-800 bg-black p-1">
                      <TabsTrigger
                        value="notes"
                        className="flex-1 rounded-md data-[state=active]:bg-gradient-yellow data-[state=active]:text-black"
                      >
                        Notes
                      </TabsTrigger>
                      <TabsTrigger
                        value="assistant"
                        className="flex-1 rounded-md data-[state=active]:bg-gradient-yellow data-[state=active]:text-black"
                      >
                        AI Assistant
                      </TabsTrigger>
                      <TabsTrigger
                        value="quiz"
                        className="flex-1 rounded-md data-[state=active]:bg-gradient-yellow data-[state=active]:text-black"
                      >
                        Practice Questions
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="notes">
                      <CourseNotes
                        noteContent={noteContent}
                        noteTitle={noteTitle}
                        isSavingNote={isSavingNote}
                        onNoteContentChange={(content) =>
                          setNoteContent(content)
                        }
                        onNoteTitleChange={(title) => setNoteTitle(title)}
                        onSaveNote={handleSaveNote}
                      />
                    </TabsContent>

                    <TabsContent value="assistant">
                      <BlurWrapper
                        componentName="assistant"
                        videoId={selectedVideo?._id || ""}
                        userId={userId as string}
                      >
                        <CourseAiAssistant
                          userId={userId as string}
                          videoId={selectedVideo?._id}
                          currentTimestamp={currentPlaybackPosition}
                          courseId={id as string}
                          onSeekTo={(seconds) => {
                            if (playerRef.current) {
                              // @ts-expect-error - playerRef.current.seekTo exists but TypeScript doesn't know the type
                              playerRef.current.seekTo(seconds);
                            }
                          }}
                        />
                      </BlurWrapper>
                    </TabsContent>

                    <TabsContent value="quiz">
                      {/* Only render quiz component in mobile view here */}
                      <CoursePracticeQuiz
                        videoTitle={selectedVideo.title}
                        videoId={selectedVideo._id}
                        videoProgressId={selectedVideo._id}
                        setCurrentPlaybackPosition={setCurrentPlaybackPosition}
                        userId={userId as string}
                        courseId={id as string}
                        watchedPercent={maxCompletionPercent}
                        onQuizCompleted={handleQuizCompleted}
                        onSeekTo={(seconds) => {
                          if (playerRef.current) {
                            // @ts-expect-error - playerRef.current.seekTo exists but TypeScript doesn't know the type
                            playerRef.current.seekTo(seconds);
                          }
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  // Always show notes in desktop mode (regardless of active tab)
                  <div
                    ref={notesRef}
                    id="notes-section"
                    className="scroll-mt-16"
                  >
                    <CourseNotes
                      noteContent={noteContent}
                      noteTitle={noteTitle}
                      isSavingNote={isSavingNote}
                      onNoteContentChange={(content) => setNoteContent(content)}
                      onNoteTitleChange={(title) => setNoteTitle(title)}
                      onSaveNote={handleSaveNote}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-zinc-900">
            <p className="text-zinc-400">No videos available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContent;
