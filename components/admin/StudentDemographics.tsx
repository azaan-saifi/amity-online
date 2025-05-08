/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// Sample data - this would come from API in a real application
const ageData = [
  { name: "18-24", value: 35, color: "#4cc9f0" },
  { name: "25-34", value: 40, color: "#f72585" },
  { name: "35-44", value: 15, color: "#7209b7" },
  { name: "45+", value: 10, color: "#3a0ca3" },
];

const locationData = [
  { name: "North America", value: 45, color: "#4cc9f0" },
  { name: "Europe", value: 30, color: "#f72585" },
  { name: "Asia", value: 15, color: "#7209b7" },
  { name: "Other", value: 10, color: "#3a0ca3" },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-md border border-zinc-800 bg-black/90 p-3 shadow-md backdrop-blur-sm">
        <p className="text-sm font-medium text-white">{data.name}</p>
        <div className="mt-1 flex items-center text-xs">
          <span
            className="mr-2 size-2 rounded-full"
            style={{ backgroundColor: data.color }}
          ></span>
          <span className="text-zinc-400">Percentage:</span>
          <span className="ml-1 font-medium text-white">{data.value}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const StudentDemographics = () => {
  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="mb-6">
        <h3 className="text-xl font-medium text-white">Student Demographics</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Age groups and geographical distribution
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-zinc-300">
            Age Distribution
          </h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`age-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: 12,
                    paddingLeft: 20,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-zinc-300">
            Geographic Distribution
          </h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={locationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {locationData.map((entry, index) => (
                    <Cell key={`location-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: 12,
                    paddingLeft: 20,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDemographics;
