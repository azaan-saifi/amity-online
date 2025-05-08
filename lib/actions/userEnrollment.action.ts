"use server";

import { revalidatePath } from "next/cache";

import Course from "@/lib/database/models/courses.model";
import UserEnrollment from "@/lib/database/models/userEnrollment.model";
import { connectToDatabase } from "@/lib/database/mongoose";

/**
 * Enrolls a user in a course
 */
export async function enrollUserInCourse(userId: string, courseId: string) {
  try {
    await connectToDatabase();

    if (!userId) throw new Error("Unauthorized");

    // Create new enrollment record
    const newEnrollment = await UserEnrollment.findOneAndUpdate(
      { userId, courseId },
      {
        userId,
        courseId,
        enrolledAt: new Date(),
        lastAccessedAt: new Date(),
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // Also update the course's enrolled status for backward compatibility
    await Course.findByIdAndUpdate(courseId, { enrolled: true });

    revalidatePath(`/student/courses/${courseId}`);
    revalidatePath(`/student/courses`);

    return { success: true, enrollment: newEnrollment };
  } catch (error) {
    console.error("Error enrolling user in course:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Unenrolls a user from a course
 */
export async function unenrollUserFromCourse(userId: string, courseId: string) {
  try {
    await connectToDatabase();

    if (!userId) throw new Error("Unauthorized");

    // Update the enrollment record
    await UserEnrollment.findOneAndUpdate(
      { userId, courseId },
      { isActive: false }
    );

    // Also update the course's enrolled status for backward compatibility
    await Course.findByIdAndUpdate(courseId, { enrolled: false });

    revalidatePath(`/student/courses/${courseId}`);
    revalidatePath(`/student/courses`);

    return { success: true };
  } catch (error) {
    console.error("Error unenrolling user from course:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Gets all enrollments for a user
 */
export async function getUserEnrollments(userId: string) {
  try {
    await connectToDatabase();

    if (!userId) throw new Error("Unauthorized");

    const enrollments = await UserEnrollment.find({ userId, isActive: true })
      .populate("courseId")
      .sort({ lastAccessedAt: -1 });

    return JSON.stringify(enrollments);
  } catch (error) {
    console.error("Error getting user enrollments:", error);
    throw error;
  }
}

/**
 * Gets all users enrolled in a course
 */
export async function getEnrolledUsers(courseId: string) {
  try {
    await connectToDatabase();

    const enrollments = await UserEnrollment.find({
      courseId,
      isActive: true,
    });

    // Extract just the userIds for easier processing
    const userIds = enrollments.map((enrollment) => enrollment.userId);

    return JSON.stringify(userIds);
  } catch (error) {
    console.error("Error getting enrolled users:", error);
    throw error;
  }
}

/**
 * Updates the enrollment record when a user accesses a course
 */
export async function updateLastAccessed(userId: string, courseId: string) {
  try {
    await connectToDatabase();

    if (!userId) throw new Error("Unauthorized");

    await UserEnrollment.findOneAndUpdate(
      { userId, courseId },
      { lastAccessedAt: new Date() }
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating last accessed:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Updates the completion percentage for a user's enrollment
 */
export async function updateEnrollmentCompletion(
  userId: string,
  courseId: string,
  completionPercent: number,
  completedLessons?: number,
  totalLessons?: number
) {
  try {
    await connectToDatabase();

    if (!userId) throw new Error("Unauthorized");

    const updateData: {
      completionPercent: number;
      lastAccessedAt: Date;
      completedLessons?: number;
      totalLessons?: number;
    } = {
      completionPercent,
      lastAccessedAt: new Date(),
    };

    // Add lesson counts if provided
    if (typeof completedLessons === "number") {
      updateData.completedLessons = completedLessons;
    }

    if (typeof totalLessons === "number") {
      updateData.totalLessons = totalLessons;
    }

    await UserEnrollment.findOneAndUpdate({ userId, courseId }, updateData);

    return { success: true };
  } catch (error) {
    console.error("Error updating enrollment completion:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Gets enrollment statistics for admin dashboard
 */
export async function getEnrollmentStats() {
  try {
    await connectToDatabase();

    // Get total number of active enrollments
    const totalEnrollments = await UserEnrollment.countDocuments({
      isActive: true,
    });

    // Get enrollments per course
    const courseEnrollments = await UserEnrollment.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$courseId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get course details for the top courses
    const courseIds = courseEnrollments.map((item) => item._id);
    const courses = await Course.find({ _id: { $in: courseIds } });

    // Combine enrollment counts with course details
    const topCourses = courseEnrollments.map((item) => {
      const course = courses.find(
        (c) => c._id.toString() === item._id.toString()
      );
      return {
        courseId: item._id,
        title: course?.title || "Unknown Course",
        enrollmentCount: item.count,
      };
    });

    return JSON.stringify({
      totalEnrollments,
      topCourses,
    });
  } catch (error) {
    console.error("Error getting enrollment stats:", error);
    throw error;
  }
}
