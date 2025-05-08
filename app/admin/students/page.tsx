"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiUsers, FiUserPlus, FiUserCheck } from "react-icons/fi";

import StatCard from "@/components/admin/StatCard";
import StudentsList from "@/components/admin/StudentsList";
import StudentRetentionChart from "@/components/admin/StudentRetentionChart";
import StudentDemographics from "@/components/admin/StudentDemographics";

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

export default function StudentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Student Management</h1>
          <p className="mt-1 text-zinc-400">
            Monitor and manage your student base
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-md bg-[#4cc9f0] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4cc9f0]/90">
          <FiUserPlus size={16} />
          <span>Add New Student</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <StatCard
            title="Total Students"
            value="2,845"
            change="12%"
            isPositive={true}
            icon={<FiUsers size={20} />}
          />
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <StatCard
            title="Active Students"
            value="1,586"
            change="8%"
            isPositive={true}
            icon={<FiUserCheck size={20} />}
          />
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <StatCard
            title="Average Completion"
            value="73%"
            change="5%"
            isPositive={true}
            icon={<FiUserCheck size={20} />}
          />
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StudentRetentionChart />
        <StudentDemographics />
      </div>

      <div>
        <StudentsList />
      </div>
    </div>
  );
}
