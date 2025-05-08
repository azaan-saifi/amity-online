import { NextRequest, NextResponse } from "next/server";

import { VideoTranscript } from "@/lib/database/models/transcript.model";
import Video from "@/lib/database/models/video.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import {
  formatTranscript,
  generateTranscript,
  uploadToCloudinary,
} from "@/lib/server-utils";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await request.formData();

    const videoTitle = formData.get("videoTitle") as string;
    const videoFile = formData.get("videoFile") as File;
    const courseId = formData.get("courseId") as string;
    const description = (formData.get("description") as string) || "";
    const position = parseInt(formData.get("position") as string) || 1;
    const locked = formData.get("locked") === "true";
    const thumbnailFile = (formData.get("thumbnailFile") as File) || null;

    if (!videoTitle || !videoFile || !courseId) {
      return NextResponse.json(
        { error: "Video title, file, and course ID are required" },
        { status: 400 }
      );
    }

    // Convert video file to buffer
    const videoBytes = await videoFile.arrayBuffer();
    const videoBuffer = Buffer.from(videoBytes);

    // Upload video to Cloudinary (using server-utils)
    const cloudinaryResult = await uploadToCloudinary(
      videoBuffer,
      "lumora-ai-videos"
    );

    // Handle thumbnail if provided
    let thumbnailUrl =
      cloudinaryResult.thumbnail || cloudinaryResult.secure_url;

    if (thumbnailFile) {
      const thumbnailBytes = await thumbnailFile.arrayBuffer();
      const thumbnailBuffer = Buffer.from(thumbnailBytes);
      const thumbnailResult = await uploadToCloudinary(
        thumbnailBuffer,
        "lumora-ai-images"
      );
      thumbnailUrl = thumbnailResult.secure_url;
    }

    // Save video to database
    const newVideo = await Video.create({
      title: videoTitle,
      description,
      thumbnail: thumbnailUrl,
      duration: cloudinaryResult.duration || "00:00:00",
      courseId,
      position,
      url: cloudinaryResult.secure_url,
      locked,
    });

    // Generate transcription (using server-utils)
    const transcription = await generateTranscript(cloudinaryResult.secure_url);

    if (transcription) {
      // Format transcript for our needs (using server-utils)
      const formattedTranscript = await formatTranscript(
        transcription,
        videoTitle
      );

      // Save transcript to database
      await VideoTranscript.create({
        videoId: newVideo._id,
        videoTitle,
        transcript: JSON.stringify(formattedTranscript),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Video uploaded successfully",
      video: newVideo,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to upload video", details: errorMessage },
      { status: 500 }
    );
  }
}
