import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Sample data - this would come from API in a real application
const data = [
  { name: "Jan", newEnrollments: 40, activeStudents: 120 },
  { name: "Feb", newEnrollments: 55, activeStudents: 160 },
  { name: "Mar", newEnrollments: 48, activeStudents: 180 },
  { name: "Apr", newEnrollments: 38, activeStudents: 200 },
  { name: "May", newEnrollments: 65, activeStudents: 240 },
  { name: "Jun", newEnrollments: 72, activeStudents: 250 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-zinc-800 bg-black/90 p-3 shadow-md backdrop-blur-sm">
        <p className="text-sm font-medium text-white">{label}</p>
        <div className="mt-2 space-y-1">
          <p className="flex items-center text-xs">
            <span className="mr-2 h-2 w-2 rounded-full bg-[#f0bb1c]"></span>
            <span className="text-zinc-400">New Enrollments:</span>
            <span className="ml-1 font-medium text-white">{payload[0].value}</span>
          </p>
          <p className="flex items-center text-xs">
            <span className="mr-2 h-2 w-2 rounded-full bg-[#3a86ff]"></span>
            <span className="text-zinc-400">Active Students:</span>
            <span className="ml-1 font-medium text-white">{payload[1].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const EnrollmentChart = () => {
  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="mb-6">
        <h3 className="text-xl font-medium text-white">Student Enrollment</h3>
        <p className="mt-1 text-sm text-zinc-400">New enrollments vs active students</p>
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ 
                paddingTop: 20,
                fontSize: 12
              }}
            />
            <Bar 
              dataKey="newEnrollments" 
              name="New Enrollments" 
              fill="#f0bb1c" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="activeStudents" 
              name="Active Students" 
              fill="#3a86ff" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnrollmentChart; 