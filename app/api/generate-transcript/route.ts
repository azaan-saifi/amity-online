import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

import { VideoTranscript } from "@/lib/database/models/transcript.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { formatTranscript, generateTranscript } from "@/lib/server-utils";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { videoUrl, videoId, videoTitle } = await request.json();
    console.log(videoId, videoUrl, videoTitle);

    if (!videoUrl || !videoId || !videoTitle) {
      return NextResponse.json(
        { error: "Video URL, ID, and title are required" },
        { status: 400 }
      );
    }

    // Use a Cloudinary URL to the video directly to avoid handling large files
    // Extract the original public ID if it's already a Cloudinary URL
    let publicId = videoUrl;
    if (videoUrl.includes("cloudinary.com")) {
      // Extract public ID from Cloudinary URL
      const urlParts = videoUrl.split("/");
      const fileNameWithExt = urlParts[urlParts.length - 1];
      publicId = fileNameWithExt.split(".")[0]; // Remove extension
    }

    // Generate a signed URL for audio with transformation
    const audioUrl = cloudinary.url(publicId, {
      resource_type: "video",
      format: "mp3",
      audio_codec: "mp3",
      sign_url: true,
    });

    console.log("Audio URL generated:", audioUrl);

    // Generate transcription using audio URL
    const transcription = await generateTranscript(audioUrl);

    if (!transcription) {
      return NextResponse.json(
        { error: "Failed to generate transcript" },
        { status: 500 }
      );
    }

    console.log("Transcription generated!");
    // Format transcript for our needs
    const formattedTranscript = await formatTranscript(
      transcription,
      videoTitle
    );

    // Save transcript to database for an existing video
    await VideoTranscript.create({
      videoId,
      videoTitle,
      transcript: JSON.stringify(formattedTranscript),
    });

    return NextResponse.json({
      success: true,
      message: "Transcript generated and saved successfully",
    });
  } catch (error) {
    console.error("Error generating transcript:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate transcript", details: errorMessage },
      { status: 500 }
    );
  }
}
