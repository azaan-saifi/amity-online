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

    // Extract audio from video using Cloudinary
    const audioResult = await new Promise<{ url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader.upload(
          videoUrl,
          {
            resource_type: "video",
            format: "mp3",
          },
          (error, result) => {
            if (error) reject(error);
            else
              resolve({
                url: result?.url as string,
                public_id: result?.public_id as string,
              });
          }
        );
      }
    );

    console.log(audioResult);

    if (!audioResult) {
      return NextResponse.json(
        { error: "Failed to extract audio from video" },
        { status: 500 }
      );
    }

    try {
      // Generate transcription using audio URL
      const transcription = await generateTranscript(audioResult.url);

      if (!transcription) {
        return NextResponse.json(
          { error: "Failed to generate transcript" },
          { status: 500 }
        );
      }

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
    } finally {
      // Delete the audio file from Cloudinary regardless of transcription success or failure
      if (audioResult.public_id) {
        await cloudinary.uploader.destroy(audioResult.public_id, {
          resource_type: "video",
        });
        console.log(
          `Deleted audio file with public_id: ${audioResult.public_id}`
        );
      }
    }
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
