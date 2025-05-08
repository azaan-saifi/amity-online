"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FiBookOpen, FiPlus } from "react-icons/fi";

import CourseManagement from "@/components/admin/CourseManagement";
import StatCard from "@/components/admin/StatCard";
import { getAllCourses } from "@/lib/actions/course.action";

// Define the Course interface
interface Course {
  _id: string;
  title: string;
  thumbnail: string;
  lessons: string;
  playlistId?: string;
}

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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getAllCourses();
        const parsedCourses = JSON.parse(coursesData);
        setCourses(parsedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCreateCourse = () => {
    router.push("/admin/courses/create");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Course Management</h1>
          <p className="mt-1 text-zinc-400">Manage your course catalog</p>
        </div>

        <button
          onClick={handleCreateCourse}
          className="flex items-center gap-2 rounded-md bg-[#ffc20b31] px-4 py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
        >
          <FiPlus />
          <span>Create New Course</span>
        </button>
      </div>

      <div className="grid gap-6">
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <StatCard
            title="Total Courses"
            value={loading ? "..." : String(courses.length)}
            change=""
            isPositive={true}
            icon={<FiBookOpen size={20} />}
          />
        </motion.div>
      </div>

      <div className="grid gap-6">
        <CourseManagement
          courses={courses}
          loading={loading}
          setCourses={setCourses}
        />
      </div>
    </div>
  );
}
