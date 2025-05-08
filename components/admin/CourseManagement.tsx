"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiEdit2, FiTrash2, FiPlus, FiVideo } from "react-icons/fi";

interface Course {
  _id: string;
  title: string;
  thumbnail: string;
  lessons: string;
  playlistId?: string;
}

// Mobile course card component
const CourseCard = ({
  course,
  onDelete,
}: {
  course: Course;
  onDelete: (id: string) => void;
}) => {
  const router = useRouter();

  return (
    <div className="mb-4 rounded-lg border border-zinc-800 bg-black/40 p-4 transition-all duration-200 hover:border-zinc-700">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {course.thumbnail && (
            <div className="relative size-12 overflow-hidden rounded">
              <Image
                src={course.thumbnail}
                alt={course.title}
                width={150}
                height={150}
                className="object-cover"
              />
            </div>
          )}
          <h4 className="text-md font-medium text-white">{course.title}</h4>
        </div>
        <div className="flex gap-1">
          <button
            className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            onClick={() => router.push(`/admin/courses/${course._id}`)}
          >
            <FiEdit2 size={16} />
          </button>
          <button
            className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-rose-500"
            onClick={() => onDelete(course._id)}
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2">
        <div>
          <p className="text-xs text-zinc-500">Lessons</p>
          <p className="text-sm text-zinc-300">{course.lessons}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => router.push(`/admin/courses/${course._id}`)}
          className="flex-1 rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Edit Course
        </button>
        <button
          onClick={() => router.push(`/admin/courses/${course._id}/videos`)}
          className="flex items-center justify-center gap-1 rounded-md bg-[#ffc20b31] px-3 py-1.5 text-xs font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
        >
          <FiVideo size={14} /> Videos
        </button>
      </div>
    </div>
  );
};

interface CourseManagementProps {
  courses: Course[];
  loading: boolean;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

const CourseManagement = ({
  courses,
  loading,
  setCourses,
}: CourseManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (courseId: string) => {
    // Confirm deletion
    if (
      !window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      // Update the local state
      setCourses(courses.filter((course) => course._id !== courseId));
      toast.success("Course deleted successfully");
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error(
        `Failed to delete course: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-4 backdrop-blur-sm sm:p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="flex h-64 items-center justify-center">
          <div className="text-zinc-400">Loading courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-4 backdrop-blur-sm sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-xl font-medium text-white">Courses</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {courses.length} courses in your catalog
          </p>
        </div>

        <button
          onClick={() => router.push("/admin/courses/create")}
          className="flex items-center justify-center gap-2 rounded-md bg-[#ffc20b31] px-4 py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
        >
          <FiPlus />
          <span>Add Course</span>
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search courses..."
          className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Mobile View - Card Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="p-8 text-center text-zinc-400">No courses found.</div>
        )}
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-left">
              <th className="pb-4 pt-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
                Course
              </th>
              <th className="pb-4 pt-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
                Lessons
              </th>
              <th className="pb-4 pt-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <tr key={course._id} className="group hover:bg-zinc-900/20">
                  <td className="py-5 text-sm">
                    <div className="flex items-center gap-3">
                      {course.thumbnail && (
                        <div className="relative h-14 w-20 overflow-hidden rounded">
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <span className="font-medium text-white">
                        {course.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 text-sm text-zinc-400">
                    {course.lessons}
                  </td>
                  <td className="py-5 text-sm">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/courses/${course._id}`}
                        className="rounded bg-zinc-800 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/courses/${course._id}/videos`}
                        className="flex items-center justify-center gap-1 rounded bg-[#ffc20b31] px-3 py-2 text-xs font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
                      >
                        <FiVideo size={14} /> Videos
                      </Link>
                      <button
                        className="rounded bg-rose-950/30 px-3 py-2 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-900/30"
                        onClick={() => handleDelete(course._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-zinc-400">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseManagement;
