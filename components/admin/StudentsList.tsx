import React, { useState } from "react";
import { FiSearch, FiMail, FiMessageCircle, FiEye } from "react-icons/fi";

import { Select } from "@/components/ui/select";

// Sample data - this would come from API in a real application
const initialStudents = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    enrolledCourses: 3,
    lastActive: "2 hours ago",
    progress: 68,
    status: "active",
    avatar: "/avatars/alex.jpg",
  },
  {
    id: "2",
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    enrolledCourses: 2,
    lastActive: "1 day ago",
    progress: 45,
    status: "active",
    avatar: "/avatars/sarah.jpg",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    enrolledCourses: 4,
    lastActive: "Just now",
    progress: 92,
    status: "active",
    avatar: "/avatars/michael.jpg",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    enrolledCourses: 1,
    lastActive: "3 days ago",
    progress: 12,
    status: "inactive",
    avatar: "/avatars/emily.jpg",
  },
  {
    id: "5",
    name: "David Miller",
    email: "david.miller@example.com",
    enrolledCourses: 2,
    lastActive: "5 hours ago",
    progress: 76,
    status: "active",
    avatar: "/avatars/david.jpg",
  },
  {
    id: "6",
    name: "Jessica Wilson",
    email: "jessica.wilson@example.com",
    enrolledCourses: 3,
    lastActive: "1 week ago",
    progress: 34,
    status: "inactive",
    avatar: "/avatars/jessica.jpg",
  },
];

interface Student {
  id: string;
  name: string;
  email: string;
  enrolledCourses: number;
  lastActive: string;
  progress: number;
  status: string;
  avatar: string;
}

// Mobile student card component
const StudentCard = ({ student }: { student: Student }) => {
  return (
    <div className="mb-4 rounded-lg border border-zinc-800 bg-black/40 p-4">
      <div className="mb-3 flex items-center">
        <div className="size-10 shrink-0 overflow-hidden rounded-full bg-zinc-800">
          <div className="size-full rounded-full bg-gradient-to-br from-[#4cc9f0] to-[#f72585]"></div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-white">{student.name}</p>
          <p className="text-xs text-zinc-400">{student.email}</p>
        </div>
        <span
          className={`ml-auto inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            student.status === "active"
              ? "bg-emerald-900/30 text-emerald-500"
              : "bg-rose-900/30 text-rose-500"
          }`}
        >
          {student.status === "active" ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-y-3">
        <div>
          <p className="text-xs text-zinc-500">Courses</p>
          <p className="text-sm text-zinc-300">{student.enrolledCourses}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Last Active</p>
          <p className="text-sm text-zinc-300">{student.lastActive}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-zinc-500">Progress</p>
          <div className="mt-1 flex items-center">
            <div className="mr-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${student.progress}%`,
                  backgroundColor:
                    student.progress > 75
                      ? "#10b981"
                      : student.progress > 50
                      ? "#f0bb1c"
                      : student.progress > 25
                      ? "#fb923c"
                      : "#ef4444",
                }}
              ></div>
            </div>
            <span className="text-xs text-zinc-400">{student.progress}%</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3">
        <button
          className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-[#4cc9f0]"
          title="View Profile"
        >
          <FiEye size={16} />
        </button>
        <button
          className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-[#4cc9f0]"
          title="Send Message"
        >
          <FiMessageCircle size={16} />
        </button>
        <button
          className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-[#4cc9f0]"
          title="Send Email"
        >
          <FiMail size={16} />
        </button>
      </div>
    </div>
  );
};

const StudentsList = () => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusOptions = [
    { value: "all", label: "All Students" },
    { value: "active", label: "Active Only" },
    { value: "inactive", label: "Inactive Only" },
  ];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-4 backdrop-blur-sm sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-medium text-white">Students</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your student database
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search students..."
            className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 py-2 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-[#4cc9f0] focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          className="sm:w-48"
        />
      </div>

      {/* Mobile View - Card Layout */}
      <div className="md:hidden">
        {filteredStudents.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-left">
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
                Student
              </th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
                Courses
              </th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
                Progress
              </th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
                Last Active
              </th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
                Status
              </th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="group hover:bg-zinc-900/20">
                <td className="py-4">
                  <div className="flex items-center">
                    <div className="size-10 shrink-0 overflow-hidden rounded-full bg-zinc-800">
                      <div className="size-full rounded-full bg-gradient-to-br from-[#4cc9f0] to-[#f72585]"></div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white">
                        {student.name}
                      </p>
                      <p className="text-xs text-zinc-400">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-sm text-zinc-400">
                  {student.enrolledCourses}
                </td>
                <td className="py-4 text-sm">
                  <div className="flex items-center">
                    <div className="mr-2 h-2 w-24 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${student.progress}%`,
                          backgroundColor:
                            student.progress > 75
                              ? "#10b981"
                              : student.progress > 50
                              ? "#f0bb1c"
                              : student.progress > 25
                              ? "#fb923c"
                              : "#ef4444",
                        }}
                      ></div>
                    </div>
                    <span className="text-zinc-400">{student.progress}%</span>
                  </div>
                </td>
                <td className="py-4 text-sm text-zinc-400">
                  {student.lastActive}
                </td>
                <td className="py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      student.status === "active"
                        ? "bg-emerald-900/30 text-emerald-500"
                        : "bg-rose-900/30 text-rose-500"
                    }`}
                  >
                    {student.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-[#4cc9f0]"
                      title="View Profile"
                    >
                      <FiEye size={16} />
                    </button>
                    <button
                      className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-[#4cc9f0]"
                      title="Send Message"
                    >
                      <FiMessageCircle size={16} />
                    </button>
                    <button
                      className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-[#4cc9f0]"
                      title="Send Email"
                    >
                      <FiMail size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="my-10 flex flex-col items-center justify-center">
          <p className="text-zinc-400">
            No students found matching your criteria
          </p>
          <button
            className="mt-2 text-sm text-[#4cc9f0]"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentsList;
