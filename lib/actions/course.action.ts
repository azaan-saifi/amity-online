"use server";

import { enrollUserInCourse } from "@/lib/actions/userEnrollment.action";
import Course from "@/lib/database/models/courses.model";
import Video from "@/lib/database/models/video.model";

import { connectToDatabase } from "../database/mongoose";

export async function getAllCourses() {
  try {
    await connectToDatabase();
    const courses = await Course.find({});
    return JSON.stringify(courses);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateEnrolledStatus(_id: string, userId: string) {
  try {
    await connectToDatabase();

    if (!userId) throw new Error("Unauthorized");

    // First update the course model for backward compatibility
    await Course.updateOne({ _id }, { enrolled: true });

    // Then use the new enrollment system
    await enrollUserInCourse(userId, _id);

    return { message: "Course enrollment was successful!" };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getCourseById(_id: string) {
  try {
    await connectToDatabase();
    const course = await Course.findById(_id);
    return JSON.stringify(course);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getTopThreeCourses() {
  try {
    await connectToDatabase();
    const courses = await Course.find({}).limit(3);
    return JSON.stringify(courses);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getEnrolledCoursesWithProgress(userId: string) {
  try {
    await connectToDatabase();

    if (!userId) throw new Error("Unauthorized");

    // Get all courses first
    const courses = await Course.find({});

    // Get user enrollments
    const UserEnrollment = (
      await import("@/lib/database/models/userEnrollment.model")
    ).default;
    const enrollments = await UserEnrollment.find({
      userId,
      isActive: true,
    });

    // Create a map of course IDs to enrollment data
    const enrollmentMap = new Map();
    enrollments.forEach((enrollment) => {
      enrollmentMap.set(enrollment.courseId.toString(), {
        isEnrolled: true,
        completionPercent: enrollment.completionPercent,
        completedLessons: enrollment.completedLessons,
        totalLessons: enrollment.totalLessons,
        lastAccessedAt: enrollment.lastAccessedAt,
      });
    });

    // Enhance courses with enrollment data - set enrolled=true ONLY for courses in the user's enrollments
    const coursesWithProgress = courses.map((course) => {
      const courseObj = course.toObject();
      const enrollment = enrollmentMap.get(course._id.toString());

      if (enrollment) {
        return {
          ...courseObj,
          enrolled: true, // Mark as enrolled only if user is enrolled
          progress: enrollment.completionPercent,
          completedLessons: enrollment.completedLessons,
          totalLessons: enrollment.totalLessons,
          lastAccessedAt: enrollment.lastAccessedAt,
        };
      }

      // For courses not in user enrollments, explicitly set enrolled to false
      return {
        ...courseObj,
        enrolled: false,
      };
    });

    return JSON.stringify(coursesWithProgress);
  } catch (error) {
    console.error("Error getting enrolled courses with progress:", error);
    throw error;
  }
}

export async function getVideosForCourse(courseId: string) {
  try {
    await connectToDatabase();

    const videos = await Video.find({ courseId }).sort({ position: 1 }).lean();

    return JSON.stringify(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return null;
  }
}
