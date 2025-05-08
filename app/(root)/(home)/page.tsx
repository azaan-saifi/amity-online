"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";
import { IoIosArrowRoundForward } from "react-icons/io";

import CourseCarousel from "@/components/CourseCarousel";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { ShinyButton } from "@/components/magicui/shiny-button";
import Navbar from "@/components/Navbar";
import { Course } from "@/types";

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const Page = () => {
  // Dummy courses data
  const courses: Course[] = [
    {
      _id: "1",
      title: "Digital Art Fundamentals",
      description:
        "Learn the basics of digital art creation, including color theory, composition, and digital painting techniques.",
      lessons: "24 lectures",
      thumbnail: "/amity-art.png",
      enrolled: false,
    },
    {
      _id: "2",
      title: "Web Development Bootcamp",
      description:
        "Master modern web technologies including HTML, CSS, JavaScript, and popular frameworks.",
      lessons: "36 lectures",
      thumbnail: "/amity-tech.png",
      enrolled: false,
    },
    {
      _id: "3",
      title: "Holistic Health & Wellness",
      description:
        "Discover comprehensive approaches to physical and mental well-being through nutrition, exercise, and mindfulness.",
      lessons: "18 lectures",
      thumbnail: "/amity-health.jpg",
      enrolled: false,
    },
  ];

  return (
    <>
      <Navbar />
      <section className="flex-center flex-col">
        <div className="container">
          <motion.div
            className="z-10 flex min-h-14 items-center justify-center"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="flex-center h-7 rounded-full border border-zinc-700 bg-zinc-800 text-[12px] transition-all ease-in">
              <AnimatedShinyText className="inline-flex items-center justify-center gap-2 px-2 py-1 text-zinc-400 transition ease-out">
                <div className="flex-center size-3 rounded-full bg-[#ffc20b31] ">
                  <div className="size-1.5 rounded-full bg-[#f0bb1c8c]"></div>
                </div>
                <span>Interactive learning platform</span>
              </AnimatedShinyText>
            </div>
          </motion.div>

          <motion.h1
            className="text-balance bg-gradient-to-br from-white from-30% to-white/40 bg-clip-text py-6 text-center text-3xl font-medium leading-none tracking-tighter text-transparent md:text-5xl"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            Turn passive video watching
            <br className="block" /> into an active, search-driven,
            practice-oriented
            <br className="block" /> learning journey
          </motion.h1>

          <motion.div
            className="flex-center mb-16 mt-2 w-full sm:mt-9"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Link href="/pricing">
              <ShinyButton className="w-auto">
                Start Learning
                <IoIosArrowRoundForward className="text-xl" />
              </ShinyButton>
            </Link>
          </motion.div>

          <motion.div
            className="py-8 max-sm:py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <CourseCarousel courses={courses} />
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Page;
