"use server";
import { v2 as cloudinary } from "cloudinary";
import Replicate from "replicate";

import { CloudinaryResult, TranscriptResponse } from "@/types";
const replicate = new Replicate();

// Configuration for server-only components
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary
 * This function should only be used in server components or API routes
 */
export async function uploadToCloudinary(buffer: Buffer, folder: string) {
  const result = await new Promise<CloudinaryResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as CloudinaryResult);
      }
    );

    uploadStream.end(buffer);
  });

  return result;
}

/**
 * Generates transcript for a given audio/video URL using Groq
 * This function should only be used in server components or API routes
 */
export async function generateTranscript(url: string) {
  const input = {
    url,
  };
  try {
    const transcription = await replicate.run(
      "turian/insanely-fast-whisper-with-video:4f41e90243af171da918f04da3e526b2c247065583ea9b757f2071f573965408",
      { input }
    );
    return transcription as TranscriptResponse;
  } catch (error) {
    console.log("Transcription error occurred: ", error);
  }
}

/**
 * Formats a transcript into a more usable structure
 * This function can be used in both client and server components as it doesn't use Node-specific modules
 */
export async function formatTranscript(
  transcript: TranscriptResponse,
  videoTitle: string
) {
  try {
    // Map segments to the required format
    const formattedTranscript = transcript.chunks.map((segment) => ({
      text: segment.text,
      startTime: segment.timestamp[0],
      endTime: segment.timestamp[1],
    }));

    return {
      videoTitle,
      transcript: formattedTranscript,
    };
  } catch (error) {
    console.error("Error processing transcript chunks:", error);
    return {
      videoTitle,
      transcript: [],
    };
  }
}
