"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

import { updateEnrollmentCompletion } from "@/lib/actions/userEnrollment.action";
import Course from "@/lib/database/models/courses.model";
import Video from "@/lib/database/models/video.model";
import VideoProgress from "@/lib/database/models/videoProgress.model";

import { connectToDatabase } from "../database/mongoose";

export async function updateVideoProgress(
  videoId: string,
  courseId: string,
  watchedPercent: number,
  userId: string,
  playbackPositionSeconds?: number
) {
  try {
    await connectToDatabase();

    if (!userId) throw new Error("Unauthorized");

    // Mark as completed if watched more than 90%
    const completed = watchedPercent >= 90;

    // Try a different update approach: first find, then update
    let progressRecord = await VideoProgress.findOne({ userId, videoId });

    if (progressRecord) {
      // Update existing record
      progressRecord.watchedPercent = watchedPercent;
      progressRecord.completed = completed;
      progressRecord.lastWatchedAt = new Date();

      // Explicitly set playback position
      if (typeof playbackPositionSeconds === "number") {
        progressRecord.playbackPositionSeconds = playbackPositionSeconds;
      }

      await progressRecord.save();
    } else {
      // Create new record
      progressRecord = new VideoProgress({
        userId,
        videoId,
        courseId,
        watchedPercent,
        completed,
        playbackPositionSeconds:
          typeof playbackPositionSeconds === "number"
            ? playbackPositionSeconds
            : 0,
        lastWatchedAt: new Date(),
      });

      await progressRecord.save();
    }

    // If video is completed, unlock the next video in the sequence
    if (completed) {
      // Get the current video to find its position
      const currentVideo = await Video.findById(videoId);
      if (currentVideo) {
        const nextPosition = currentVideo.position + 1;

        // Find the next video in the sequence
        const nextVideo = await Video.findOne({
          courseId,
          position: nextPosition,
        });

        // If there is a next video, unlock it
        if (nextVideo && nextVideo.locked) {
          await Video.findByIdAndUpdate(nextVideo._id, { locked: false });
        }
      }

      // Update the course progress
      await updateCourseProgress(courseId, userId);
    }

    revalidatePath(`/student/courses/[id]`);
    return { success: true, completed };
  } catch (error) {
    console.error("Error updating video progress:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Helper function to update course progress
async function updateCourseProgress(courseId: string, userId: string) {
  try {
    // Get total videos for this course
    const totalVideos = await Video.countDocuments({ courseId });

    // Get completed videos
    const completedVideos = await VideoProgress.countDocuments({
      userId,
      courseId,
      completed: true,
    });

    // Calculate progress percentage
    const progressPercentage =
      totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

    // Update only the user's enrollment completion percentage
    // Remove the direct course update which affects all users
    await updateEnrollmentCompletion(
      userId,
      courseId,
      progressPercentage,
      completedVideos,
      totalVideos
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating course progress:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getVideoProgress(videoId: string, userId: string) {
  try {
    await connectToDatabase();

    if (!userId) return null;

    const progress = await VideoProgress.findOne({
      userId,
      videoId,
    });

    return progress ? JSON.stringify(progress) : null;
  } catch (error) {
    console.error("Error getting video progress:", error);
    return null;
  }
}

export async function getCourseProgress(courseId: string, userId: string) {
  try {
    await connectToDatabase();

    if (!userId) return null;

    // Get all progress records for this course and user
    const progressRecords = await VideoProgress.find({
      userId,
      courseId,
    });

    // Get user enrollment data for this course
    const UserEnrollment = (
      await import("@/lib/database/models/userEnrollment.model")
    ).default;
    const enrollment = await UserEnrollment.findOne({
      userId,
      courseId,
      isActive: true,
    });

    // Get course for basic info
    const course = await Course.findById(courseId);

    if (!course) {
      return null;
    }

    // Return the progress data with user-specific enrollment data
    return JSON.stringify({
      progressRecords,
      courseProgress: {
        // Use user-specific enrollment data if available, otherwise fallback to zeros
        progress: enrollment?.completionPercent || 0,
        completedLessons: enrollment?.completedLessons || 0,
        totalLessons: enrollment?.totalLessons || course.lessons || 0,
      },
    });
  } catch (error) {
    console.error("Error getting course progress:", error);
    return null;
  }
}

export async function migrateVideoProgressRecords() {
  try {
    await connectToDatabase();

    // Find all progress records
    const allRecords = await VideoProgress.find({});

    // Add playbackPositionSeconds to any that don't have it
    const updates = allRecords.map(async (record) => {
      if (record.playbackPositionSeconds === undefined) {
        // Estimate position based on watchedPercent
        const estimatedDuration = 600; // 10 minutes in seconds
        const estimatedPosition = Math.floor(
          (record.watchedPercent / 100) * estimatedDuration
        );

        return VideoProgress.findByIdAndUpdate(record._id, {
          playbackPositionSeconds: estimatedPosition,
        });
      }
      return null;
    });

    await Promise.all(updates.filter(Boolean));

    return {
      success: true,
      message: `Updated ${updates.filter(Boolean).length} records`,
    };
  } catch (error) {
    console.error("Error migrating video progress records:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Update the video playback position
 */
export async function updateVideoTime(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  videoProgressId: any,
  userId: string,
  playbackPositionSeconds: number
) {
  try {
    const id = ObjectId.createFromHexString(videoProgressId);

    await connectToDatabase();

    if (!userId) throw new Error("Unauthorized");

    // Find the video progress record
    const progressRecord = await VideoProgress.findOne({
      userId,
      videoId: id,
    });

    // Update existing record with new playback position
    progressRecord.playbackPositionSeconds = playbackPositionSeconds;
    progressRecord.lastWatchedAt = new Date();
    await progressRecord.save();

    return { success: true, position: playbackPositionSeconds };
  } catch (error) {
    console.error("Error updating video time:", error);
    return { success: false, error: (error as Error).message };
  }
}
