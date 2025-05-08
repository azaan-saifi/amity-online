import { NextRequest, NextResponse } from "next/server";

import Course from "@/lib/database/models/courses.model";
import Video from "@/lib/database/models/video.model";
import VideoProgress from "@/lib/database/models/videoProgress.model";
import { connectToDatabase } from "@/lib/database/mongoose";

// GET /api/courses - Get all courses
export async function GET() {
  try {
    await connectToDatabase();

    // Fetch courses from MongoDB
    const courses = await Course.find({});

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch courses", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // For the admin panel, we'll skip authentication for now
    // TODO: Add proper authentication check

    const courseData = await request.json();

    // Basic validation for title
    if (!courseData.title) {
      return NextResponse.json(
        { error: "Missing required field: title is required" },
        { status: 400 }
      );
    }

    // Ensure we have a thumbnail one way or another
    if (!courseData.thumbnail) {
      return NextResponse.json(
        { error: "Thumbnail is required" },
        { status: 400 }
      );
    }

    // Create the course
    const newCourse = await Course.create({
      title: courseData.title,
      description: courseData.description || "",
      thumbnail: courseData.thumbnail,
      lessons: courseData.lessons || "0",
      enrolled: false,
      progress: 0,
      completedLessons: 0,
      totalLessons: 0,
    });

    return NextResponse.json({
      success: true,
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create course", details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/courses - Update a course
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const { id, ...courseData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get the existing course to check if playlistId changed
    const existingCourse = await Course.findById(id);

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // If no thumbnail is provided, keep the existing one
    if (!courseData.thumbnail) {
      courseData.thumbnail = existingCourse.thumbnail;
    }

    // If no description is provided, keep the existing one
    if (!courseData.description && existingCourse.description) {
      courseData.description = existingCourse.description;
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

// DELETE /api/courses - Delete a course and all related videos
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get the course ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

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
