import { NextRequest, NextResponse } from "next/server";

import { VideoTranscript } from "@/lib/database/models/transcript.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { formatTranscript, generateTranscript } from "@/lib/server-utils";

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

    // Generate transcription using server-utils
    const transcription = await generateTranscript(videoUrl);

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
