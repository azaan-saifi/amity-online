import { NextRequest, NextResponse } from "next/server";

import Video from "@/lib/database/models/video.model";
import { connectToDatabase } from "@/lib/database/mongoose";

// PUT /api/courses/[id]/videos/reorder
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = await params; // Course ID
    const { videoId, targetPosition } = await request.json();

    if (!videoId || targetPosition === undefined) {
      return NextResponse.json(
        { error: "Video ID and target position are required" },
        { status: 400 }
      );
    }

    // Verify this video belongs to the specified course
    const videoToMove = await Video.findById(videoId);
    if (!videoToMove || videoToMove.courseId.toString() !== id) {
      return NextResponse.json(
        { error: "Video not found or doesn't belong to this course" },
        { status: 404 }
      );
    }

    const currentPosition = videoToMove.position;

    // If moving up (position decreasing)
    if (targetPosition < currentPosition) {
      // Increase position by 1 for all videos between target and current position
      await Video.updateMany(
        {
          courseId: id,
          position: { $gte: targetPosition, $lt: currentPosition },
        },
        { $inc: { position: 1 } }
      );
    }
    // If moving down (position increasing)
    else if (targetPosition > currentPosition) {
      // Decrease position by 1 for all videos between current and target position
      await Video.updateMany(
        {
          courseId: id,
          position: { $gt: currentPosition, $lte: targetPosition },
        },
        { $inc: { position: -1 } }
      );
    }

    // Update the position of the video being moved
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { position: targetPosition },
      { new: true, runValidators: true }
    );

    // Get all videos in order
    const videos = await Video.find({ courseId: id }).sort({ position: 1 });

    return NextResponse.json({
      success: true,
      message: "Video position updated successfully",
      video: updatedVideo,
      videos,
    });
  } catch (error) {
    console.error("Error reordering video:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to reorder video", details: errorMessage },
      { status: 500 }
    );
  }
}
