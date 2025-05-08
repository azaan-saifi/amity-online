"use client";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FiClock, FiBookOpen } from "react-icons/fi";

import {
  updateEnrolledStatus,
  getEnrolledCoursesWithProgress,
} from "@/lib/actions/course.action";

interface Course {
  _id: string;
  title: string;
  thumbnail: string;
  lessons: string;
  description: string;
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
      delayChildren: 0.1,
      when: "beforeChildren",
      duration: 0.3,
    },
  },
};

// Motivational quotes
const motivationalQuotes = [
  "The only way to learn is by doing. Start where you are, use what you have.",
  "Consistency is the key. Small daily improvements lead to stunning results.",
  "Every expert was once a beginner. Keep learning, keep growing.",
  "Your future is created by what you do today, not tomorrow.",
  "The best way to predict your future is to create it.",
];

// Randomly select a motivational quote
const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
};

const StudentPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const quote = getRandomQuote();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth();

  const handleEnroll = async (courseId: string, enrolled: boolean) => {
    try {
      if (enrolled) {
        router.push(`/student/courses/${courseId}`);
      }
      await updateEnrolledStatus(courseId, userId as string);

      // Update the local state to reflect the enrollment
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId ? { ...course, enrolled: true } : course
        )
      );
    } catch (error) {
      console.error("Error enrolling in course:", error);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!userId) {
          router.push("/sign-in");
          return;
        }

        setLoading(true);

        // Fetch user-specific course data with progress
        const dbCourses = await getEnrolledCoursesWithProgress(userId);
        const courseData = JSON.parse(dbCourses);

        setCourses(courseData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId, router]);

  const enrolledCourses = courses.filter((course) => course.enrolled);

  // Force animation refresh when courses change
  useEffect(() => {
    // This will force Framer Motion to re-run animations when courses load
    if (courses.length > 0) {
      const timeout = setTimeout(() => {
        document.querySelector(".grid")?.classList.add("animation-refresh");
        setTimeout(() => {
          document
            .querySelector(".grid")
            ?.classList.remove("animation-refresh");
        }, 50);
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [courses]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <motion.div
              className="h-10 w-64 animate-pulse rounded-md bg-zinc-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <motion.div
              className="mt-2 h-5 w-96 animate-pulse rounded-md bg-zinc-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            />
          </div>
        </div>

        {/* Shimmer for enrolled courses */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-48 animate-pulse rounded-md bg-zinc-800" />
            <div className="h-5 w-20 animate-pulse rounded-md bg-zinc-800" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 md:grid-cols-2"
          >
            {[1, 2].map((i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-4 backdrop-blur-sm"
              >
                <div className="flex gap-4">
                  <div className="h-24 w-36 animate-pulse rounded-md bg-zinc-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 animate-pulse rounded-md bg-zinc-800" />
                    <div className="h-5 w-1/2 animate-pulse rounded-md bg-zinc-800" />
                    <div className="h-1.5 w-full rounded-full bg-zinc-800">
                      <div className="h-1.5 w-1/3 rounded-full bg-zinc-700" />
                    </div>
                    <div className="flex justify-between pt-1">
                      <div className="h-3 w-20 animate-pulse rounded-md bg-zinc-800" />
                      <div className="h-3 w-20 animate-pulse rounded-md bg-zinc-800" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Shimmer for all courses */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-32 animate-pulse rounded-md bg-zinc-800" />
            <div className="h-5 w-24 animate-pulse rounded-full bg-zinc-800" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="relative h-[380px] w-full overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-3"
              >
                <div className="h-[200px] w-full animate-pulse rounded-md bg-zinc-800" />
                <div className="mt-3 space-y-3 p-2">
                  <div className="h-6 w-3/4 animate-pulse rounded-md bg-zinc-800" />
                  <div className="h-5 w-full animate-pulse rounded-md bg-zinc-800" />
                  <div className="h-5 w-1/2 animate-pulse rounded-md bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <motion.h1
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome, Student 👋
          </motion.h1>
          <motion.p
            className="mt-1 text-zinc-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {quote}
          </motion.p>
        </div>
      </div>

      {/* Enrolled courses section */}
      {enrolledCourses.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-medium text-white">Enrolled Courses</h2>
            <Link
              href="/student/courses"
              className="text-sm text-[#f0bb1c] hover:underline"
            >
              View all
            </Link>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2"
            key="enrolled-courses-container"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {enrolledCourses.slice(0, 2).map((course) => (
              <Link href={`/student/courses/${course._id}`} key={course._id}>
                <motion.div
                  variants={fadeIn}
                  className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-4 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                  <div className="flex gap-4">
                    <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-md">
                      <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                          backgroundImage: `url(${course.thumbnail})`,
                          backgroundColor: "#18181b", // Fallback color
                        }}
                      >
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <h3 className="text-md line-clamp-2 font-medium text-white">
                        {course.title}
                      </h3>
                      <p className="text-md line-clamp-2 font-medium text-zinc-400">
                        {course.description}
                      </p>

                      <div className="mt-auto pt-2">
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

                        <div className="mt-2 flex justify-between text-xs">
                          <div className="flex items-center text-zinc-400">
                            <FiClock className="mr-1 size-3" />
                            <span>{`${
                              course.progress !== undefined &&
                              course.progress !== null
                                ? course.progress
                                : 0
                            }% complete`}</span>
                          </div>
                          <div className="flex items-center text-zinc-400">
                            <FiBookOpen className="mr-1 size-3" />
                            <span>
                              {course.completedLessons || 0} /{" "}
                              {course.totalLessons ||
                                parseInt(course.lessons) ||
                                0}{" "}
                              lectures
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </section>
      )}

      {/* All courses section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-white">All Courses</h2>
          <span className="rounded-full bg-[#ffc20b31] px-2 py-0.5 text-xs font-medium text-[#f0bb1c]">
            {courses.length} Courses
          </span>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          key="all-courses-container"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 place-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {courses.length > 0 ? (
            courses.map((course) => (
              <motion.div
                key={course._id}
                variants={fadeIn}
                className="relative h-[380px] w-full max-w-[380px] overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-3 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg"
                whileHover={{ scale: 1.01 }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                <div className="relative h-[200px] w-full overflow-hidden rounded-md bg-zinc-800">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                </div>

                <div className="flex h-[140px] flex-col justify-between p-2">
                  <div>
                    <h3 className="line-clamp-2 text-lg font-medium text-white">
                      {course.title}
                    </h3>

                    <p className="line-clamp-2 text-sm font-normal text-zinc-400">
                      {course.description}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-400">
                      <div className="flex items-center">
                        <FiBookOpen className="mr-1 size-3" />
                        <span>{course.lessons} lectures</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEnroll(course._id, course.enrolled)}
                    className={`flex w-full items-center justify-center rounded-md ${
                      !course.enrolled
                        ? "bg-[#6dff0b31] text-[#1cf027] hover:bg-[#27ff0b50]"
                        : "bg-[#ffc20b31] text-[#f0bb1c] hover:bg-[#ffc20b50]"
                    } px-3 py-1.5 text-xs font-medium transition-colors`}
                  >
                    {course.enrolled ? "View Course" : "Enroll Now"}
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-6 rounded-full bg-zinc-800/50 p-6">
                <FiBookOpen className="size-12 text-[#f0bb1c]" />
              </div>
              <h3 className="mb-2 text-xl font-medium text-white">
                No Courses Found
              </h3>
              <p className="max-w-md text-zinc-400">
                We couldn&apos;t find any courses available for you at the
                moment. Check back soon as new content is added regularly.
              </p>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
};

export default StudentPage;
