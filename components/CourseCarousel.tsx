"use client";

import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowRoundBack, IoIosArrowRoundForward } from "react-icons/io";
import { v4 } from "uuid";

import { cn } from "@/lib/utils";
import { Course } from "@/types";

import CourseCard from "./CourseCard";

interface CourseCarouselProps {
  courses: Course[];
  className?: string;
}

const CourseCarousel = ({ courses, className }: CourseCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleNext = () => {
    if (courses.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % courses.length);
  };

  const handlePrev = () => {
    if (courses.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + courses.length) % courses.length);
  };

  if (isMobile) {
    return (
      <div className={cn("relative w-full px-4", className)}>
        <div className="overflow-hidden">
          <div
            ref={carouselRef}
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {courses.map((course) => (
              <div key={course._id} className="w-full shrink-0 px-2">
                <CourseCard
                  title={course.title}
                  description={course.description}
                  lectures={course.lessons}
                  thumbnail={course.thumbnail}
                />
              </div>
            ))}
          </div>
        </div>

        {courses.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={handlePrev}
              className="rounded-full bg-zinc-800 p-2 text-white hover:bg-zinc-700"
              aria-label="Previous course"
            >
              <IoIosArrowRoundBack className="size-6" />
            </button>
            <button
              onClick={handleNext}
              className="rounded-full bg-zinc-800 p-2 text-white hover:bg-zinc-700"
              aria-label="Next course"
            >
              <IoIosArrowRoundForward className="size-6" />
            </button>
          </div>
        )}

        {courses.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {courses.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-2 w-2 rounded-full",
                  currentIndex === index ? "bg-white" : "bg-zinc-600"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {courses.map((course) => (
        <CourseCard
          key={v4()}
          title={course.title}
          description={course.description}
          thumbnail={course.thumbnail}
          lectures={course.lessons}
        />
      ))}
    </div>
  );
};

export default CourseCarousel;
