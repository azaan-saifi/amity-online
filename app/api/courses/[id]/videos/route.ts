import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

import Course from "@/lib/database/models/courses.model";
import Video from "@/lib/database/models/video.model";
import VideoProgress from "@/lib/database/models/videoProgress.model";
import { connectToDatabase } from "@/lib/database/mongoose";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/courses/[id]/videos - Get all videos for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    // Validate course exists
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get videos for this course
    const videos = await Video.find({ courseId: id }).sort({ position: 1 });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch videos", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/videos - Create a new video
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const videoData = await request.json();

    // Validate course exists
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Basic validation
    if (!videoData.title || !videoData.url) {
      console.log(
        "Missing required fields: videoId, title, and url are required"
      );
      return NextResponse.json(
        {
          error:
            "Missing required fields: videoId, title, and url are required",
        },
        { status: 400 }
      );
    }

    // Get the highest position to add new video at the end
    const highestPositionVideo = await Video.findOne({ courseId: id })
      .sort({ position: -1 })
      .limit(1);

    const nextPosition = highestPositionVideo
      ? highestPositionVideo.position + 1
      : 1;

    // Create the video
    const newVideo = await Video.create({
      ...videoData,
      courseId: id,
      position: videoData.position || nextPosition,
    });

    console.log(newVideo);

    // Update course lessons count
    const totalVideos = await Video.countDocuments({ courseId: id });
    await Course.findByIdAndUpdate(id, {
      lessons: `${totalVideos}`,
      totalLessons: totalVideos,
    });

    return NextResponse.json({
      success: true,
      message: "Video added successfully",
      video: newVideo,
    });
  } catch (error) {
    console.error("Error creating video:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create video", details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id]/videos - Update a video
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const {
      videoId,
      url: newVideoUrl,
      thumbnail: newThumbnailUrl,
      ...videoData
    } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // Verify this video exists and belongs to the specified course
    const existingVideo = await Video.findById(videoId);
    if (!existingVideo || existingVideo.courseId.toString() !== id) {
      return NextResponse.json(
        { error: "Video not found or doesn't belong to this course" },
        { status: 404 }
      );
    }

    // If a new video URL is provided, delete the old video from Cloudinary
    if (newVideoUrl && newVideoUrl !== existingVideo.url) {
      try {
        const segments = existingVideo.url.split("/");
        const publicId = segments[segments.length - 1].split(".")[0]; // Remove extension

        await cloudinary.api.delete_resources([`${publicId}`], {
          type: "upload",
          resource_type: "video",
        });
        console.log("Old video deleted from Cloudinary");
      } catch (deleteError) {
        console.error("Error deleting old video from Cloudinary:", deleteError);
        // Continue even if deleting the old video fails
      }
    }

    // If a new thumbnail URL is provided, delete the old thumbnail from Cloudinary
    if (newThumbnailUrl && newThumbnailUrl !== existingVideo.thumbnail) {
      try {
        const segments = existingVideo.thumbnail.split("/");
        const publicId = segments[segments.length - 1].split(".")[0]; // Remove extension

        await cloudinary.api.delete_resources([`${publicId}`], {
          type: "upload",
          resource_type: "image",
        });
        console.log("Old thumbnail deleted from Cloudinary");
      } catch (deleteError) {
        console.error(
          "Error deleting old thumbnail from Cloudinary:",
          deleteError
        );
        // Continue even if deleting the old thumbnail fails
      }
    }

    // Prepare update data including optional new media URLs
    const updateData = { ...videoData };
    if (newVideoUrl) updateData.url = newVideoUrl;
    if (newThumbnailUrl) updateData.thumbnail = newThumbnailUrl;

    // Update the video
    const updatedVideo = await Video.findByIdAndUpdate(videoId, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      message: "Video updated successfully",
      video: updatedVideo,
    });
  } catch (error) {
    console.error("Error updating video:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update video", details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]/videos - Delete a video
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { videoId } = await request.json();
  const { id } = await params;

  try {
    await connectToDatabase();

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // Verify this video exists and belongs to the specified course
    const video = await Video.findById(videoId);

    if (!video || video.courseId.toString() !== id) {
      return NextResponse.json(
        { error: "Video not found or doesn't belong to this course" },
        { status: 404 }
      );
    }

    // Delete video from cloudinary
    const segmants = video.url.split("/");
    const publicId = segmants[segmants.length - 1].split(".")[0];

    await cloudinary.api.delete_resources([`${publicId}`], {
      type: "upload",
      resource_type: "video",
    });

    console.log("Video deleted from Cloudinary");

    // Delete progress records for this video
    await VideoProgress.deleteMany({ videoId });
    console.log("Video Progress deleted");

    // Delete the video
    await Video.findByIdAndDelete(videoId);
    console.log("Video deleted");

    // Update position of remaining videos
    const remainingVideos = await Video.find({
      courseId: id,
      position: { $gt: video.position },
    }).sort({ position: 1 });

    for (const video of remainingVideos) {
      await Video.findByIdAndUpdate(video._id, {
        position: video.position - 1,
      });
    }

    console.log("Videos Position adjusted");

    // Update course lessons count
    const totalVideos = await Video.countDocuments({ courseId: id });
    await Course.findByIdAndUpdate(id, {
      lessons: `${totalVideos}`,
      totalLessons: totalVideos,
    });

    console.log("Course lessons count updated");

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete video", details: errorMessage },
      { status: 500 }
    );
  }
}
