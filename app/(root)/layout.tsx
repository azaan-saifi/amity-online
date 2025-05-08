import React from "react";

import PageTransition from "@/components/PageTransition";
import ScrollRestoration from "@/components/ScrollRestoration";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-black">
      <ScrollRestoration />
      <div className="fixed inset-0 bg-gradient-radial from-black via-yellow-gradient-from/5 to-transparent opacity-60"></div>
      <div className="fixed inset-x-0 bottom-0 h-screen bg-gradient-to-t from-yellow-gradient-from/10 to-transparent"></div>
      <PageTransition>{children}</PageTransition>
    </div>
  );
};

export default RootLayout;
