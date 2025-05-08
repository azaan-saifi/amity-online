import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Sample data - this would come from API in a real application
const data = [
  { name: "Week 1", retention: 100 },
  { name: "Week 2", retention: 92 },
  { name: "Week 3", retention: 85 },
  { name: "Week 4", retention: 78 },
  { name: "Week 5", retention: 73 },
  { name: "Week 6", retention: 68 },
  { name: "Week 7", retention: 65 },
  { name: "Week 8", retention: 62 },
  { name: "Week 9", retention: 60 },
  { name: "Week 10", retention: 59 },
  { name: "Week 11", retention: 58 },
  { name: "Week 12", retention: 57 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-zinc-800 bg-black/90 p-3 shadow-md backdrop-blur-sm">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-sm text-[#4cc9f0]">Retention: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const StudentRetentionChart = () => {
  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="mb-6">
        <h3 className="text-xl font-medium text-white">Student Retention</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Percentage of students who continue their courses over time
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#333"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#999", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#999", fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="retention"
              stroke="#4cc9f0"
              strokeWidth={2}
              dot={{ fill: "#4cc9f0", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudentRetentionChart;
