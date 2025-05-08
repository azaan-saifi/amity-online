import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// Define color palette for chart
const COLORS = ["#f0bb1c", "#3a86ff", "#ff006e", "#8338ec", "#38b000", "#fb5607", "#4cc9f0", "#e63946"];

interface Course {
  _id: string;
  title: string;
  lessons: string;
}

interface CoursesDistributionProps {
  courses: Course[];
  loading: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-md border border-zinc-800 bg-black/90 p-3 shadow-md backdrop-blur-sm">
        <p className="text-sm font-medium text-white">{data.name}</p>
        <div className="mt-1 flex items-center text-xs">
          <span className="mr-2 h-2 w-2 rounded-full" style={{ backgroundColor: data.color }}></span>
          <span className="text-zinc-400">Courses:</span>
          <span className="ml-1 font-medium text-white">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

// Function to categorize courses by first word in title (as a simple categorization)
const categorizeCourses = (courses: Course[]) => {
  const categories: Record<string, number> = {};
  
  courses.forEach(course => {
    // Extract first word from title as category (simple heuristic)
    const firstWord = course.title.split(' ')[0];
    
    if (categories[firstWord]) {
      categories[firstWord]++;
    } else {
      categories[firstWord] = 1;
    }
  });
  
  // Convert to chart data format
  return Object.entries(categories).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length]
  }));
};

const CoursesDistribution = ({ courses, loading }: CoursesDistributionProps) => {
  // Generate chart data based on courses
  const chartData = useMemo(() => {
    if (loading || courses.length === 0) {
      return [];
    }
    return categorizeCourses(courses);
  }, [courses, loading]);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="flex justify-center items-center h-80">
          <div className="text-zinc-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="mb-6">
          <h3 className="text-xl font-medium text-white">Course Categories</h3>
          <p className="mt-1 text-sm text-zinc-400">No courses available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="mb-6">
        <h3 className="text-xl font-medium text-white">Course Categories</h3>
        <p className="mt-1 text-sm text-zinc-400">Distribution by course type</p>
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ 
                paddingTop: 20, 
                fontSize: 12,
                width: '100%',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CoursesDistribution; 