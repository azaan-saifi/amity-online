"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ScrollRestoration = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top when pathname changes (page navigation)
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollRestoration; 