"use client";

import React from "react";

import PageTransition from "@/components/PageTransition";
import ScrollRestoration from "@/components/ScrollRestoration";
import StudentNavbar from "@/components/student/StudentNavbar";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <ScrollRestoration />

      <StudentNavbar />

      <div className="w-full flex-1">
        <div className="fixed inset-0 -z-10 bg-gradient-radial from-black via-yellow-gradient-from/5 to-transparent opacity-60"></div>
        <div className="fixed inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-yellow-gradient-from/10 to-transparent"></div>
        <div className="fixed inset-y-0 right-0 -z-10 w-1/3 bg-gradient-to-l from-yellow-gradient-from/5 to-transparent opacity-30"></div>

        <div className="fixed left-1/4 top-1/4 size-32 -translate-x-1/2 -translate-y-1/2">
          <div className="bg-gradient-yellow/5 absolute inset-0 animate-pulse rounded-full blur-3xl"></div>
        </div>
        <div className="bg-gradient-yellow/5 absolute right-0 top-12 -z-10 size-36 rounded-full blur-3xl"></div>
        <div className="bg-gradient-yellow/5 absolute bottom-0 left-1/4 -z-10 size-64 rounded-full blur-3xl"></div>

        <PageTransition>
          <main className="mx-auto w-full max-w-7xl p-3 pb-20 sm:p-6">
            <div className="relative">{children}</div>
          </main>
        </PageTransition>
      </div>
    </div>
  );
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
