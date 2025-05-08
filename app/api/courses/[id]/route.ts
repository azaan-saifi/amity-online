import { NextRequest, NextResponse } from "next/server";

import Course from "@/lib/database/models/courses.model";
import Video from "@/lib/database/models/video.model";
import VideoProgress from "@/lib/database/models/videoProgress.model";
import { connectToDatabase } from "@/lib/database/mongoose";

// GET /api/courses/[id] - Get a specific course by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Wait for params to resolve to fix NextJS warning
    const { id } = await Promise.resolve(params);

    // Find the course by ID
    const course = await Course.findById(id);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Error fetching course:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch course", details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Replace a course entirely
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Wait for params to resolve to fix NextJS warning
    const { id } = await Promise.resolve(params);
    const courseData = await request.json();

    // Get the existing course to check if playlistId changed
    const existingCourse = await Course.findById(id);

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // If no thumbnail is provided, keep the existing one
    if (!courseData.thumbnail) {
      courseData.thumbnail = existingCourse.thumbnail;
    }

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { ...courseData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update course", details: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[id] - Update course fields partially
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Wait for params to resolve to fix NextJS warning
    const { id } = await Promise.resolve(params);
    const courseData = await request.json();

    // Get the existing course to check if playlistId changed
    const existingCourse = await Course.findById(id);

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // If no thumbnail is provided, keep the existing one
    if (!courseData.thumbnail) {
      courseData.thumbnail = existingCourse.thumbnail;
    }

    // Update the course with partial data
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: courseData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Course partially updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update course", details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete a course and all related videos
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Wait for params to resolve to fix NextJS warning
    const { id } = await params;

    // Find all videos for this course
    const videos = await Video.find({ courseId: id });
    const videoIds = videos.map((video) => video._id);

    // Delete all video progress records for these videos
    await VideoProgress.deleteMany({ videoId: { $in: videoIds } });

    // Delete all videos for this course
    await Video.deleteMany({ courseId: id });

    // Delete the course
    const deletedCourse = await Course.findByIdAndDelete(id);

    if (!deletedCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Course and all associated videos deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete course", details: errorMessage },
      { status: 500 }
    );
  }
}
