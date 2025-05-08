"use client";

import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { FiCheck } from "react-icons/fi";
import { IoIosArrowRoundForward } from "react-icons/io";

import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { ShinyButton } from "@/components/magicui/shiny-button";
import Navbar from "@/components/Navbar";

// Animation variants
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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Define the pricing plan interface
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  isPopular: boolean;
}

const PricingPage = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pricing plans from the API
  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/pricing");

        if (!response.ok) {
          throw new Error("Failed to fetch pricing plans");
        }

        const data = await response.json();
        setPlans(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching pricing plans:", error);
        setError("Failed to load pricing plans. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricingPlans();
  }, []);

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
                <span>Choose your learning plan</span>
              </AnimatedShinyText>
            </div>
          </motion.div>

          <motion.h1
            className="text-balance bg-gradient-to-br from-white from-30% to-white/40 bg-clip-text py-6 text-center text-3xl font-medium leading-none tracking-tighter text-transparent md:text-5xl"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            Start your journey to becoming
            <br className="block" /> a code bender today
          </motion.h1>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="animate-pulse text-zinc-400">
                Loading pricing plans...
              </div>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-rose-500">{error}</div>
            </div>
          ) : (
            <motion.div
              className="mx-auto mt-12 flex w-full max-w-5xl justify-center gap-8 max-lg:flex-col max-lg:items-center"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  variants={fadeInUp}
                  className={`relative flex w-full max-w-md flex-col border bg-black/60 backdrop-blur-sm ${
                    plan.isPopular ? "border-zinc-700" : "border-zinc-800"
                  } overflow-hidden rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/20%)]`}
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${
                      plan.isPopular ? "via-[#f0bb1c]/50" : "via-white/30"
                    } to-transparent`}
                  ></div>

                  {plan.isPopular && (
                    <>
                      <div className="pointer-events-none absolute inset-0 rounded-lg border border-[#f0bb1c]/20"></div>
                      <div className="absolute right-6 top-6">
                        <div className="rounded-full border border-[#f0bb1c]/30 bg-[#ffc20b31] px-3 py-1">
                          <span className="text-xs font-medium text-[#f0bb1c]">
                            RECOMMENDED
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="border-b border-zinc-800 p-6">
                    <h3 className="mb-2 text-xl font-medium text-white">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-white">
                        ${plan.price}
                      </span>
                      <span className="ml-1 text-zinc-400">
                        /{plan.interval === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-zinc-400">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex-1 p-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <FiCheck className="mr-2 mt-1 text-[#f0bb1c]" />
                          <span className="text-sm text-zinc-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-zinc-800 p-6">
                    <ShinyButton
                      className={`w-full justify-center ${
                        plan.isPopular
                          ? "border-[#f0bb1c]/30 bg-[#ffc20b10]"
                          : ""
                      }`}
                    >
                      {plan.isPopular ? "Become a Master" : "Get Started"}
                      <IoIosArrowRoundForward className="text-xl" />
                    </ShinyButton>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p className="mx-auto max-w-2xl text-sm text-zinc-400">
              All plans include a 14-day money-back guarantee. No questions
              asked.
              <br />
              Need a custom plan for your team?{" "}
              <a href="#" className="text-[#f0bb1c] hover:underline">
                Contact us
              </a>{" "}
              for enterprise pricing.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default PricingPage;
