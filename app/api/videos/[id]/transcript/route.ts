import { NextRequest, NextResponse } from "next/server";

import { VideoTranscript } from "@/lib/database/models/transcript.model";
import { connectToDatabase } from "@/lib/database/mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const videoId = params.id;

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // Find the transcript in the database
    const transcript = await VideoTranscript.findOne({ videoId });

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript not found for this video" },
        { status: 404 }
      );
    }

    // Parse the JSON string back to an object
    const transcriptData = JSON.parse(transcript.transcript);

    return NextResponse.json({
      videoId: transcript.videoId,
      videoTitle: transcript.videoTitle,
      transcript: transcriptData,
    });
  } catch (error) {
    console.error("Error fetching transcript:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch transcript", details: errorMessage },
      { status: 500 }
    );
  }
}
