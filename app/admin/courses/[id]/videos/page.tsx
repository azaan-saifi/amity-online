/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiArrowUp,
  FiArrowDown,
  FiLock,
  FiUnlock,
  FiUpload,
  FiVideo,
  FiCheck,
} from "react-icons/fi";

interface Course {
  _id: string;
  title: string;
  thumbnail: string;
  lessons: string;
}

interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  position: number;
  locked: boolean;
}

interface UploadProgress {
  isUploading: boolean;
  progress: number;
  url: string | null;
  videoId?: string;
}

const CourseVideosPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoFormVisible, setVideoFormVisible] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [videoFileName, setVideoFileName] = useState<string>("");
  const [videoUploadProgress, setVideoUploadProgress] =
    useState<UploadProgress>({
      isUploading: false,
      progress: 0,
      url: null,
    });
  const [thumbnailUploadProgress, setThumbnailUploadProgress] =
    useState<UploadProgress>({
      isUploading: false,
      progress: 0,
      url: null,
    });

  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    thumbnail: "",
    locked: true,
  });

  const [transcriptProgress, setTranscriptProgress] = useState({
    isGenerating: false,
    progress: 0,
    completed: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course data
        const courseResponse = await fetch(`/api/courses/${id}`);
        if (!courseResponse.ok) {
          throw new Error("Failed to fetch course");
        }
        const courseData = await courseResponse.json();
        setCourse(courseData);

        // Fetch videos for this course
        const videosResponse = await fetch(`/api/courses/${id}/videos`);
        if (!videosResponse.ok) {
          throw new Error("Failed to fetch videos");
        }
        const videosData = await videosResponse.json();
        setVideos(videosData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error loading data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (editingVideo) {
      console.log("Editing video Data:", editingVideo);

      // When editing, set the preview URLs for existing media
      setPreviewUrl(editingVideo.thumbnail);
      setVideoFileName(editingVideo.title);

      // Pre-fill the video and thumbnail URLs in the upload progress state
      setVideoUploadProgress({
        isUploading: false,
        progress: 100,
        url: editingVideo.url,
        videoId: editingVideo._id,
      });

      setThumbnailUploadProgress({
        isUploading: false,
        progress: 100,
        url: editingVideo.thumbnail,
      });
    }
  }, [editingVideo]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (editingVideo) {
      setEditingVideo({
        ...editingVideo,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      });
    } else {
      setNewVideo({
        ...newVideo,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    if (editingVideo) {
      setEditingVideo({
        ...editingVideo,
        [name]: checked,
      });
    } else {
      setNewVideo({
        ...newVideo,
        [name]: checked,
      });
    }
  };

  const uploadFileToCloudinary = async (
    file: File,
    folder: string,
    updateProgress: (progress: number) => void
  ) => {
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset =
        folder === "lumora-ai-videos" ? "videos_preset" : "images_preset";

      if (!cloudName) {
        throw new Error("Cloudinary cloud name is not configured");
      }

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      // Add video-specific parameters for large files
      if (folder === "lumora-ai-videos") {
        formData.append("resource_type", "video");
        formData.append("chunk_size", "20000000"); // 20MB chunks (adjust as needed)
      }

      return new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            updateProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log("Upload response:", response);
              resolve(response.secure_url);
            } catch (err) {
              console.error("Error parsing response:", xhr.responseText, err);
              reject(new Error("Failed to parse upload response"));
            }
          } else {
            console.error(
              "Upload failed with status:",
              xhr.status,
              xhr.responseText
            );
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          console.error("Network error during upload");
          reject(new Error("Network error during upload"));
        };

        // Optional: Increase timeout for large files (1 hour)
        xhr.timeout = 3600000;
        xhr.ontimeout = () => {
          reject(new Error("Upload timed out"));
        };

        xhr.open("POST", url);
        xhr.send(formData);
      });
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  const handleThumbnailFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size - 10MB limit
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 10) {
      toast.error("Please upload an image smaller than 10MB");
      e.target.value = "";
      return;
    }

    // Create preview URL
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);

    // Start upload
    try {
      setThumbnailUploadProgress({
        isUploading: true,
        progress: 0,
        url: null,
      });

      const uploadedUrl = await uploadFileToCloudinary(
        file,
        "lumora-ai-images",
        (progress) => {
          setThumbnailUploadProgress((prev) => ({
            ...prev,
            progress,
          }));
        }
      );

      console.log("Uploaded URL for thumbnail: ", uploadedUrl);

      setThumbnailUploadProgress({
        isUploading: false,
        progress: 100,
        url: uploadedUrl,
      });

      // Important: Don't update the editingVideo state when uploading a new thumbnail
      // This was causing the issue where new uploads would be compared against themselves
      if (!editingVideo) {
        setNewVideo({
          ...newVideo,
          thumbnail: uploadedUrl,
        });
      }
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      toast.error("Failed to upload thumbnail. Please try again.");
      setThumbnailUploadProgress({
        isUploading: false,
        progress: 0,
        url: null,
      });
    }
  };

  const handleVideoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("Please upload a video file");
      return;
    }

    // Check if file is a video
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      e.target.value = "";
      return;
    }

    // Check file size - 100MB limit
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 100) {
      toast.error("Please upload a video smaller than 100MB");
      e.target.value = "";
      return;
    }

    setVideoFileName(file.name);

    // Start upload
    try {
      setVideoUploadProgress({
        isUploading: true,
        progress: 0,
        url: null,
      });

      const uploadedUrl = await uploadFileToCloudinary(
        file,
        "lumora-ai-videos",
        (progress) => {
          setVideoUploadProgress((prev) => ({
            ...prev,
            progress,
          }));
        }
      );

      console.log("Uploaded URL for video: ", uploadedUrl);
      toast.success("Video uploaded successfully");

      setVideoUploadProgress({
        isUploading: false,
        progress: 100,
        url: uploadedUrl,
      });

      // Store video in DB immediately after upload
      const videoData = {
        title: editingVideo ? editingVideo.title : newVideo.title || file.name,
        description: editingVideo
          ? editingVideo.description
          : newVideo.description || "",
        url: uploadedUrl,
        thumbnail: thumbnailUploadProgress.url || "", // This might be empty if thumbnail hasn't been uploaded yet
        locked: editingVideo ? editingVideo.locked : newVideo.locked,
      };

      try {
        const response = await fetch(`/api/courses/${id}/videos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(videoData),
        });

        if (!response.ok) {
          throw new Error("Failed to store video in database");
        }

        const { video: savedVideo } = await response.json();
        console.log("Video stored in DB:", savedVideo);

        // Update the upload progress with the video ID
        setVideoUploadProgress((prev) => ({
          ...prev,
          videoId: savedVideo._id.toString(),
        }));

        console.log(
          "Video upload progress updated with ID:",
          savedVideo._id.toString()
        );

        // Start transcript generation with the actual video ID
        if (uploadedUrl && savedVideo._id) {
          await generateVideoTranscript(
            uploadedUrl,
            savedVideo.title,
            savedVideo._id.toString()
          );
        }
      } catch (error) {
        console.error("Error storing video in database:", error);
        toast.error(
          "Video uploaded but failed to save to database. You can still complete the form and try to save everything together."
        );
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Failed to upload video. Please try again.");
      setVideoUploadProgress({
        isUploading: false,
        progress: 0,
        url: null,
      });
    }
  };

  // Function to generate and store transcript
  async function generateVideoTranscript(
    videoUrl: string,
    title: string,
    videoId: string
  ) {
    try {
      setTranscriptProgress({
        isGenerating: true,
        progress: 0,
        completed: false,
      });

      // Simulate progress updates while waiting for transcript
      const progressInterval = setInterval(() => {
        setTranscriptProgress((prev) => {
          // Increase progress but cap at 90% until we get confirmation of completion
          const newProgress = Math.min(prev.progress + 5, 95);
          return {
            ...prev,
            progress: newProgress,
          };
        });
      }, 5000);

      const response = await fetch("/api/generate-transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId,
          videoUrl,
          videoTitle: title,
        }),
      });

      if (!response.ok) {
        clearInterval(progressInterval);
        throw new Error("Failed to generate transcript");
      }

      const data = await response.json();
      console.log("Transcript generation response:", data);

      clearInterval(progressInterval);

      setTranscriptProgress({
        isGenerating: false,
        progress: 100,
        completed: true,
      });

      // Add a success toast so the user knows the transcript is ready
      toast.success("Transcript generated successfully");

      return data.transcript;
    } catch (error) {
      console.error("Error generating transcript:", error);
      setTranscriptProgress({
        isGenerating: false,
        progress: 0,
        completed: false,
      });
      throw error;
    }
  }

  const resetForm = () => {
    setNewVideo({
      title: "",
      description: "",
      thumbnail: "",
      locked: true,
    });
    setEditingVideo(null);
    setVideoFormVisible(false);
    setPreviewUrl(null);
    setVideoFileName("");
    setVideoUploadProgress({
      isUploading: false,
      progress: 0,
      url: null,
      videoId: undefined,
    });
    setThumbnailUploadProgress({
      isUploading: false,
      progress: 0,
      url: null,
    });
    setTranscriptProgress({
      isGenerating: false,
      progress: 0,
      completed: false,
    });
    if (thumbnailFileInputRef.current) {
      thumbnailFileInputRef.current.value = "";
    }
    if (videoFileInputRef.current) {
      videoFileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!videoUploadProgress.url) {
        toast.error("Please upload a video first");
        return;
      }

      if (!thumbnailUploadProgress.url) {
        toast.error("Please upload a thumbnail first");
        return;
      }

      const videoData = {
        title: editingVideo ? editingVideo.title : newVideo.title,
        description: editingVideo
          ? editingVideo.description
          : newVideo.description,
        url: videoUploadProgress.url,
        thumbnail: thumbnailUploadProgress.url,
        locked: editingVideo ? editingVideo.locked : newVideo.locked,
      };

      if (editingVideo) {
        // Update existing video
        const response = await fetch(`/api/courses/${id}/videos`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoId: editingVideo._id,
            ...videoData,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update video");
        }

        // Update the videos list with the edited video
        setVideos((prevVideos) =>
          prevVideos.map((v) =>
            v._id === editingVideo._id
              ? {
                  ...v,
                  ...videoData,
                }
              : v
          )
        );
      } else {
        // If we already have a videoId from the initial upload, use that for the update
        if (videoUploadProgress.videoId) {
          const response = await fetch(`/api/courses/${id}/videos`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              videoId: videoUploadProgress.videoId,
              ...videoData,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to update video");
          }

          const updatedVideo = await response.json();
          console.log("Video updated:", updatedVideo);
          // Add the updated video to the list
          setVideos((prevVideos) => [...prevVideos, updatedVideo.video]);
        } else {
          // If for some reason we don't have a videoId yet, create a new video
          const response = await fetch(`/api/courses/${id}/videos`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(videoData),
          });

          if (!response.ok) {
            throw new Error("Failed to create video");
          }

          const newVideoData = await response.json();
          console.log("New video created:", newVideoData);
          // Add the new video to the list
          setVideos((prevVideos) => [...prevVideos, newVideoData.video]);
        }
      }

      // Reset form and state
      resetForm();
      setVideoFormVisible(false);
      setEditingVideo(null);
    } catch (error) {
      console.error("Error submitting video:", error);
      toast.error("Error saving video. Please try again.");
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!window.confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${id}/videos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete video");
      }

      // Remove video from state
      setVideos(videos.filter((video) => video._id !== videoId));

      toast.success("Video deleted successfully");
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Error deleting video. Please try again.");
    }
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setVideoFormVisible(true);
  };

  const handleMoveVideo = async (videoId: string, direction: "up" | "down") => {
    try {
      const videoIndex = videos.findIndex((v) => v._id === videoId);
      if (videoIndex === -1) return;

      // Can't move up if already at the top
      if (direction === "up" && videoIndex === 0) return;

      // Can't move down if already at the bottom
      if (direction === "down" && videoIndex === videos.length - 1) return;

      const adjacentIndex =
        direction === "up" ? videoIndex - 1 : videoIndex + 1;
      const targetPosition = videos[adjacentIndex].position;
      const currentPosition = videos[videoIndex].position;

      // Update positions in backend
      const response = await fetch(`/api/courses/${id}/videos/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          targetPosition:
            direction === "up" ? currentPosition - 1 : currentPosition + 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder videos");
      }

      // Update positions in frontend
      const updatedVideos = [...videos];
      updatedVideos[videoIndex].position = targetPosition;
      updatedVideos[adjacentIndex].position = currentPosition;

      // Sort by position
      updatedVideos.sort((a, b) => a.position - b.position);

      setVideos(updatedVideos);
    } catch (error) {
      console.error("Error reordering videos:", error);
      toast.error("Error reordering videos. Please try again.");
    }
  };

  const handleToggleLock = async (videoId: string, currentLocked: boolean) => {
    try {
      const response = await fetch(`/api/courses/${id}/videos/toggle-lock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          locked: !currentLocked,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle video lock status");
      }

      // Update the videos list
      setVideos(
        videos.map((video) =>
          video._id === videoId ? { ...video, locked: !currentLocked } : video
        )
      );
    } catch (error) {
      console.error("Error toggling video lock:", error);
      toast.error("Error updating video. Please try again.");
    }
  };

  if (loading || !course) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.push(`/admin/courses/${id}`)}
          className="inline-flex items-center text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <FiArrowLeft className="mr-1" /> Back to course details
        </button>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">{course.title}</h1>
          <p className="mt-1 text-zinc-400">Manage course videos</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setVideoFormVisible(!videoFormVisible);
          }}
          className="flex items-center gap-2 rounded-md bg-[#ffc20b31] px-4 py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
        >
          <FiPlus />
          <span>{videoFormVisible ? "Cancel" : "Add Video"}</span>
        </button>
      </div>

      {/* Video Form */}
      {videoFormVisible && (
        <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          <h3 className="mb-4 text-xl font-medium text-white">
            {editingVideo ? "Edit Video" : "Add New Video"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-white"
                >
                  Video Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editingVideo ? editingVideo.title : newVideo.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
                  placeholder="Introduction to the Course"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-white"
                >
                  Video Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={
                    editingVideo
                      ? editingVideo.description
                      : newVideo.description
                  }
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
                  placeholder="Enter video description..."
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="videoFile"
                  className="block text-sm font-medium text-white"
                >
                  {editingVideo ? "Replace Video (Optional)" : "Upload Video"}
                </label>
                <div
                  onClick={() =>
                    !videoUploadProgress.isUploading &&
                    videoFileInputRef.current?.click()
                  }
                  className={`relative mt-1 flex h-24 w-full ${
                    videoUploadProgress.isUploading
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  } items-center justify-center rounded-md border border-dashed border-zinc-700 bg-zinc-900/50 hover:border-zinc-500`}
                >
                  {videoUploadProgress.isUploading ? (
                    <div className="flex w-full flex-col items-center justify-center px-4">
                      <div className="mb-2 h-2.5 w-full rounded-full bg-zinc-800">
                        <div
                          className="h-2.5 rounded-full bg-[#f0bb1c]"
                          style={{ width: `${videoUploadProgress.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-zinc-400">
                        Uploading {videoFileName}...{" "}
                        {videoUploadProgress.progress}%
                      </span>
                    </div>
                  ) : videoUploadProgress.url ||
                    (editingVideo && editingVideo.url) ? (
                    <div className="flex items-center">
                      <FiCheck className="mr-1 text-green-400" />
                      <div className="flex flex-col">
                        <span className="text-sm text-white">
                          {videoFileName ||
                            (editingVideo && editingVideo.title) ||
                            "Video ready"}
                        </span>
                      </div>
                      <span className="ml-2 text-xs text-green-400">
                        {videoUploadProgress.url &&
                        videoUploadProgress.url === (editingVideo?.url || "")
                          ? "Current video"
                          : "Upload complete"}
                      </span>
                      {editingVideo && editingVideo.url && (
                        <a
                          href={editingVideo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="ml-2 text-xs text-blue-400 hover:text-blue-300"
                        >
                          View
                        </a>
                      )}
                    </div>
                  ) : videoFileName ? (
                    <div className="flex w-full items-center justify-between px-4">
                      <div className="flex items-center">
                        <FiVideo className="mr-2 size-6 text-zinc-400" />
                        <span className="truncate text-sm text-white">
                          {videoFileName}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">
                        Click to change
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <FiUpload className="size-8 text-zinc-500" />
                      <span className="mt-2 text-sm text-zinc-500">
                        Click to upload video
                      </span>
                      <span className="mt-1 text-xs text-zinc-500">
                        Supports MP4, WebM, MOV and other video formats
                      </span>
                    </div>
                  )}
                  <input
                    ref={videoFileInputRef}
                    type="file"
                    id="videoFile"
                    name="videoFile"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="hidden"
                    disabled={videoUploadProgress.isUploading}
                  />
                </div>

                {/* Transcript Generation Progress */}
                {transcriptProgress.isGenerating && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>Generating transcript...</span>
                      <span>{transcriptProgress.progress}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-zinc-800">
                      <div
                        className="h-1.5 rounded-full bg-blue-500"
                        style={{ width: `${transcriptProgress.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {transcriptProgress.completed && (
                  <div className="mt-2 flex items-center text-xs text-green-400">
                    <FiCheck className="mr-1" />
                    <span>Transcript generated successfully</span>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="thumbnail"
                  className="block text-sm font-medium text-white"
                >
                  {editingVideo
                    ? "Replace Thumbnail (Optional)"
                    : "Video Thumbnail"}
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <div
                    onClick={() =>
                      !thumbnailUploadProgress.isUploading &&
                      thumbnailFileInputRef.current?.click()
                    }
                    className={`relative flex h-32 w-48 ${
                      thumbnailUploadProgress.isUploading
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    } items-center justify-center rounded-md border border-dashed border-zinc-700 bg-zinc-900/50 hover:border-zinc-500`}
                  >
                    {thumbnailUploadProgress.isUploading ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-2 h-2.5 w-4/5 rounded-full bg-zinc-800">
                          <div
                            className="h-2.5 rounded-full bg-[#f0bb1c]"
                            style={{
                              width: `${thumbnailUploadProgress.progress}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-zinc-400">
                          {thumbnailUploadProgress.progress}%
                        </span>
                      </div>
                    ) : previewUrl ||
                      (editingVideo && editingVideo.thumbnail) ? (
                      <div className="relative size-full">
                        <Image
                          src={
                            previewUrl ||
                            (editingVideo ? editingVideo.thumbnail : "")
                          }
                          alt="Thumbnail preview"
                          fill
                          className="rounded-md object-cover"
                        />
                        {thumbnailUploadProgress.url && (
                          <div className="absolute bottom-1 right-1 rounded-full bg-green-500 p-1">
                            <FiCheck className="size-3 text-white" />
                          </div>
                        )}
                        {editingVideo &&
                          previewUrl === editingVideo.thumbnail && (
                            <div className="absolute left-1 top-1 rounded-md bg-blue-500/70 px-1 py-0.5">
                              <span className="text-xs text-white">
                                Current
                              </span>
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center">
                        <FiUpload className="size-8 text-zinc-500" />
                        <span className="mt-2 text-xs text-zinc-500">
                          Click to upload image
                        </span>
                      </div>
                    )}
                    <input
                      ref={thumbnailFileInputRef}
                      type="file"
                      id="thumbnail"
                      name="thumbnail"
                      accept="image/*"
                      onChange={handleThumbnailFileChange}
                      className="hidden"
                      disabled={thumbnailUploadProgress.isUploading}
                    />
                  </div>
                  <div className="text-xs text-zinc-500">
                    <p>Recommended size: 1280×720 (16:9)</p>
                    <p className="mt-1">JPG, PNG or GIF format</p>
                    <p className="mt-1">Maximum size: 5MB</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="locked"
                  name="locked"
                  checked={editingVideo ? editingVideo.locked : newVideo.locked}
                  onChange={handleCheckboxChange}
                  className="size-4 rounded border-zinc-800 bg-zinc-900 text-[#f0bb1c] focus:ring-[#f0bb1c] focus:ring-offset-zinc-900"
                />
                <label
                  htmlFor="locked"
                  className="ml-2 block text-sm text-white"
                >
                  Require completing previous videos (locked)
                </label>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-zinc-800 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  videoUploadProgress.isUploading ||
                  thumbnailUploadProgress.isUploading ||
                  transcriptProgress.isGenerating
                }
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  videoUploadProgress.isUploading ||
                  thumbnailUploadProgress.isUploading ||
                  transcriptProgress.isGenerating
                    ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                    : transcriptProgress.completed &&
                      videoUploadProgress.videoId
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-[#ffc20b31] text-[#f0bb1c] hover:bg-[#ffc20b50]"
                }`}
              >
                {videoUploadProgress.isUploading
                  ? "Uploading Video..."
                  : thumbnailUploadProgress.isUploading
                  ? "Uploading Thumbnail..."
                  : transcriptProgress.isGenerating
                  ? "Generating Transcript..."
                  : transcriptProgress.completed && videoUploadProgress.videoId
                  ? "Complete Video Details"
                  : editingVideo
                  ? "Update Video"
                  : "Add Video"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Videos List */}
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-4 backdrop-blur-sm sm:p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        <h3 className="mb-4 text-xl font-medium text-white">Course Videos</h3>

        {videos.length === 0 ? (
          <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-8 text-center">
            <FiVideo className="mx-auto size-12 text-zinc-600" />
            <h3 className="mt-4 text-lg font-medium text-white">
              No videos yet
            </h3>
            <p className="mt-1 text-zinc-400">
              Add your first video to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((video, index) => (
              <div
                key={video._id}
                className="relative overflow-hidden rounded-md border border-zinc-800 bg-zinc-900/20 p-3 transition-colors hover:bg-zinc-900/40"
              >
                <div className="flex flex-col justify-between sm:flex-row">
                  <div className="flex items-center">
                    <div className="mr-3 hidden h-20 w-32 shrink-0 overflow-hidden rounded-md sm:block">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        width={150}
                        height={150}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h4 className="truncate font-medium text-white">
                          {video.title}
                        </h4>
                        {video.locked && (
                          <span className="ml-2 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                            <FiLock size={10} className="mr-1 inline" />
                            Locked
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-2 text-sm text-zinc-400">
                        {video.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center space-x-2 sm:mt-0">
                    <button
                      onClick={() => handleMoveVideo(video._id, "up")}
                      disabled={index === 0}
                      className={`rounded bg-zinc-800 p-1.5 ${
                        index === 0
                          ? "cursor-not-allowed text-zinc-600"
                          : "text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      }`}
                      title="Move up"
                    >
                      <FiArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveVideo(video._id, "down")}
                      disabled={index === videos.length - 1}
                      className={`rounded bg-zinc-800 p-1.5 ${
                        index === videos.length - 1
                          ? "cursor-not-allowed text-zinc-600"
                          : "text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      }`}
                      title="Move down"
                    >
                      <FiArrowDown size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleLock(video._id, video.locked)}
                      className="rounded bg-zinc-800 p-1.5 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      title={video.locked ? "Unlock video" : "Lock video"}
                    >
                      {video.locked ? (
                        <FiUnlock size={16} />
                      ) : (
                        <FiLock size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleEditVideo(video)}
                      className="rounded bg-zinc-800 p-1.5 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      title="Edit video"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(video._id)}
                      className="rounded bg-zinc-800 p-1.5 text-red-400 hover:bg-zinc-700 hover:text-red-300"
                      title="Delete video"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseVideosPage;
