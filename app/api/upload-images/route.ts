import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/database/mongoose";
import { uploadToCloudinary } from "@/lib/server-utils";

/**
 * Upload images API handler
 * Handles image uploads for courses, videos, and other content
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const formData = await request.formData();

    // Get image file from form data
    const imageFile = formData.get("thumbnail") as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Convert image to buffer
    const imageBytes = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(imageBytes);

    const folder = "lumora-ai-images";

    // Upload image to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(imageBuffer, folder);
    console.log(cloudinaryResult.secure_url);

    // Return success response with image URL
    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      url: cloudinaryResult.secure_url,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Failed to upload image", details: errorMessage },
      { status: 500 }
    );
  }
}
