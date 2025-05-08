"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";
import { FiDollarSign, FiExternalLink } from "react-icons/fi";

import PricingManagement from "@/components/admin/PricingManagement";
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

export default function PricingPage() {
  // Sample data - this would come from API in a real application
  const pricingData = [
    { plan: "Monthly", conversions: 68, revenue: "24.7%" },
    { plan: "Yearly", conversions: 124, revenue: "58.3%" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Pricing Management</h1>
          <p className="mt-1 text-zinc-400">Manage your subscription plans</p>
        </div>

        <Link href="/pricing" target="_blank">
          <button className="flex items-center gap-2 rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700">
            <span>View Pricing Page</span>
            <FiExternalLink />
          </button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <StatCard
            title="Average Price"
            value="$89"
            change="8%"
            isPositive={true}
            icon={<FiDollarSign size={20} />}
          />
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="col-span-2"
        >
          <div className="relative h-full overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="flex h-full flex-col justify-center">
              <h3 className="text-xl font-medium text-white">
                Pricing Best Practices
              </h3>
              <ul className="mt-4 space-y-2 text-zinc-400">
                <li className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-[#f0bb1c]"></div>
                  <span>Highlight your most popular plan to guide users</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-[#f0bb1c]"></div>
                  <span>Use clear feature lists to show value progression</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-[#f0bb1c]"></div>
                  <span>Consider offering annual plans with a discount</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <PricingManagement />

      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        <div className="mb-6">
          <h3 className="text-xl font-medium text-white">Plan Performance</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Conversion rates by plan type
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <th className="pb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Plan
                </th>
                <th className="pb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Conversions
                </th>
                <th className="pb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Revenue Share
                </th>
                <th className="pb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {pricingData.map((plan, index) => (
                <tr key={index} className="group hover:bg-zinc-900/20">
                  <td className="py-4 text-sm font-medium text-white">
                    {plan.plan}
                  </td>
                  <td className="py-4 text-sm text-zinc-400">
                    {plan.conversions}
                  </td>
                  <td className="py-4 text-sm text-zinc-400">{plan.revenue}</td>
                  <td className="py-4 text-sm">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-[#f0bb1c]"
                        style={{ width: plan.revenue }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
