"use client";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { FiLock, FiAlertCircle } from "react-icons/fi";

const backdrop = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

const modal = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};
const AUTH_KEY = "AMITY-VP-ACCESS-2025-LUMORA";

const AdminAuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authKey, setAuthKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const storedAuthKey = localStorage.getItem("adminAuthKey");
    if (storedAuthKey) {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (authKey === AUTH_KEY) {
      // Store in localStorage
      localStorage.setItem("adminAuthKey", authKey);
      setIsAuthenticated(true);
      setIsLoading(false);
    } else {
      setError("Invalid authentication key. Please try again.");
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  // If authenticated, render children (admin panel)
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated, show auth modal
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        variants={backdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          className="relative mx-auto w-full max-w-md"
          variants={modal}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/80 p-6 shadow-xl backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f0bb1c]/50 to-transparent"></div>

            <div className="mb-6 flex flex-col items-center justify-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#ffc20b10]">
                <FiLock className="size-6 text-[#f0bb1c]" />
              </div>
              <h2 className="mt-4 text-xl font-medium text-white">
                Admin Access Required
              </h2>
              <p className="mt-1 text-center text-sm text-zinc-400">
                Please enter the authentication key to access the admin panel
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-rose-500/10 p-3">
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="size-4 text-rose-500" />
                  <p className="text-sm text-rose-500">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="authKey"
                  className="block text-sm font-medium text-zinc-400"
                >
                  Authentication Key
                </label>
                <input
                  id="authKey"
                  type="password"
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-white shadow-sm placeholder:text-zinc-500 focus:border-[#f0bb1c] focus:outline-none focus:ring-1 focus:ring-[#f0bb1c]"
                  placeholder="Enter your access key"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-[#ffc20b31] py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50] focus:outline-none focus:ring-2 focus:ring-[#f0bb1c]/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Authenticating..." : "Authenticate"}
              </button>
            </form>

            <div className="mt-6 border-t border-zinc-800 pt-4">
              <p className="text-center text-xs text-zinc-500">
                If you don&apos;t have access, please contact your administrator
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminAuthWrapper;
