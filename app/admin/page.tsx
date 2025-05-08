"use client";

import { motion } from "framer-motion";
import React from "react";
import { FiUser, FiUsers, FiBookOpen, FiTrendingUp } from "react-icons/fi";

import EnrollmentChart from "@/components/admin/EnrollmentChart";
import RevenueChart from "@/components/admin/RevenueChart";
import StatCard from "@/components/admin/StatCard";

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

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-zinc-400">Welcome back, Admin</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex size-2 items-center justify-center">
            <span className="absolute size-2 animate-ping rounded-full bg-emerald-500 opacity-75"></span>
            <span className="size-1.5 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-sm text-zinc-400">
            Last updated: <span className="text-white">Just now</span>
          </span>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={fadeIn}>
            <StatCard
              title="Total Courses"
              value="38"
              change="6"
              isPositive={true}
              icon={<FiBookOpen size={20} />}
            />
          </motion.div>

          <motion.div variants={fadeIn}>
            <StatCard
              title="Total Students"
              value="2,845"
              change="12%"
              isPositive={true}
              icon={<FiUsers size={20} />}
            />
          </motion.div>

          <motion.div variants={fadeIn}>
            <StatCard
              title="Active Users"
              value="1,586"
              change="8%"
              isPositive={true}
              icon={<FiUser size={20} />}
            />
          </motion.div>

          <motion.div variants={fadeIn}>
            <StatCard
              title="Total Revenue"
              value="$156,845"
              change="18%"
              isPositive={true}
              icon={<FiTrendingUp size={20} />}
            />
          </motion.div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <EnrollmentChart />
      </div>
    </div>
  );
}
