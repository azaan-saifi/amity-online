"use client";

import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FiBookOpen } from "react-icons/fi";

import { Select } from "@/components/ui/select";
import { getEnrolledCoursesWithProgress } from "@/lib/actions/course.action";

interface Course {
  _id: string;
  title: string;
  thumbnail: string;
  lessons: string;
  enrolled: boolean;
  progress?: number;
  completedLessons?: number;
  totalLessons?: number;
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sortBy, setSortBy] = useState("title");
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!userId) {
          router.push("/sign-in");
          return;
        }

        // Get user-specific course data with progress
        const dbCourses = await getEnrolledCoursesWithProgress(userId);
        const courseData = JSON.parse(dbCourses);

        // Debug log to see what we're getting
        console.log(
          "All courses with enrollment status:",
          courseData.map((c) => ({
            id: c._id,
            title: c.title,
            enrolled: c.enrolled,
            progress: c.progress,
          }))
        );

        // Only show enrolled courses
        const enrolledCourses = courseData.filter(
          (course: Course) => course.enrolled === true
        );

        console.log(
          "Filtered enrolled courses:",
          enrolledCourses.map((c) => ({
            id: c._id,
            title: c.title,
            progress: c.progress,
          }))
        );

        setCourses(enrolledCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId, router]);

  const sortedCourses = [...courses].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    // Default sorting
    return 0;
  });

  const sortOptions = [{ value: "title", label: "Title" }];

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-zinc-400">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/student"
          className="inline-flex items-center text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <span className="mr-1">←</span> Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <motion.h1
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            My Enrolled Courses
          </motion.h1>
          <motion.p
            className="mt-1 text-zinc-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Track your learning progress and continue where you left off
          </motion.p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-400">Sort by:</span>
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={sortOptions}
            className="w-40"
          />
        </div>
      </div>

      {/* Course List */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-6"
      >
        {sortedCourses.length > 0 ? (
          sortedCourses.map((course) => (
            <motion.div
              key={course._id}
              variants={fadeIn}
              className="relative overflow-hidden rounded-lg border border-zinc-800 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

              <div className="flex flex-col md:flex-row">
                <div className="relative h-[200px] w-full shrink-0 overflow-hidden md:h-auto md:w-1/3">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                </div>

                <div className="flex-1 p-6">
                  <div>
                    <h2 className="text-xl font-medium text-white">
                      {course.title}
                    </h2>
                    <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                      <FiBookOpen className="size-4" />
                      <span>{`${course.lessons.split(" ")[0]} lectures`}</span>
                    </div>

                    {/* Add progress indicator */}
                    <div className="mt-4">
                      <div className="h-1.5 w-full rounded-full bg-zinc-800">
                        <div
                          className="h-1.5 rounded-full bg-[#f0bb1c]"
                          style={{
                            width: `${
                              course.progress !== undefined &&
                              course.progress !== null
                                ? course.progress
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-zinc-400">
                        <span>{`${
                          course.progress !== undefined &&
                          course.progress !== null
                            ? course.progress
                            : 0
                        }% complete`}</span>
                        {course.completedLessons !== undefined &&
                          course.totalLessons !== undefined && (
                            <span>
                              {course.completedLessons} / {course.totalLessons}{" "}
                              lectures
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link
                      href={`/student/courses/${course._id}`}
                      className="inline-flex items-center justify-center rounded-md bg-[#ffc20b31] px-4 py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
                    >
                      Continue Learning
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center text-zinc-400">
            No enrolled courses yet. Go back to dashboard to enroll in courses.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CoursesPage;
