"use client";
import React from "react";

import Sidebar from "@/components/admin/Sidebar";
import AdminAuthWrapper from "@/components/AdminAuthWrapper";
import PageTransition from "@/components/PageTransition";
import ScrollRestoration from "@/components/ScrollRestoration";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-black">
      <ScrollRestoration />

      <Sidebar />

      <div className="w-full flex-1 md:pl-64">
        <div className="fixed inset-0 -z-10 bg-gradient-radial from-black via-yellow-gradient-from/5 to-transparent opacity-60"></div>
        <div className="fixed inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-yellow-gradient-from/10 to-transparent"></div>

        <PageTransition>
          <main className="mt-16 max-w-full p-3 pb-20 md:mt-0 md:p-6">
            {children}
          </main>
        </PageTransition>
      </div>
    </div>
  );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthWrapper>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AdminAuthWrapper>
  );
}
