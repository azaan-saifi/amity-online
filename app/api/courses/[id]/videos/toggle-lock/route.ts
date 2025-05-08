import { NextRequest, NextResponse } from "next/server";

import Video from "@/lib/database/models/video.model";
import { connectToDatabase } from "@/lib/database/mongoose";

// PUT /api/courses/[id]/videos/toggle-lock
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = await params; // Course ID
    const { videoId, locked } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // Verify this video belongs to the specified course
    const existingVideo = await Video.findById(videoId);
    if (!existingVideo || existingVideo.courseId.toString() !== id) {
      return NextResponse.json(
        { error: "Video not found or doesn't belong to this course" },
        { status: 404 }
      );
    }

    // Update the video's locked status
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { locked },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Video lock status updated successfully",
      video: updatedVideo,
    });
  } catch (error) {
    console.error("Error updating video lock status:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update video lock status", details: errorMessage },
      { status: 500 }
    );
  }
}
