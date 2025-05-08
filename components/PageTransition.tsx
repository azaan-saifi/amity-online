"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);
    
    window.addEventListener("beforeunload", handleStart);
    window.addEventListener("load", handleComplete);
    
    return () => {
      window.removeEventListener("beforeunload", handleStart);
      window.removeEventListener("load", handleComplete);
    };
  }, []);

  const variants = {
    hidden: { opacity: 0, y: 5 },
    enter: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.33, 1, 0.68, 1], // cubic-bezier for smooth deceleration
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: [0.33, 1, 0.68, 1]
      }
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="h-16 w-16 animate-pulse rounded-full bg-gradient-to-r from-transparent via-[#f0bb1c] to-transparent opacity-50"></div>
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          variants={variants}
          initial="hidden"
          animate="enter"
          exit="exit"
          className="h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default PageTransition; 