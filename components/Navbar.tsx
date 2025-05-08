import Link from "next/link";
import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

import { Button } from "./ui/button";

const Navbar = () => {
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  return (
    <nav className="w-full border-b border-gray-700 backdrop-blur-md animate-in [--animation-delay:600ms]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center  text-white">Lumora AI</div>
        <div className="flex gap-4">
          <Button className="text-white">Who we are?</Button>
          <div className="relative">
            <Button
              className="flex items-center gap-1 text-white"
              onClick={() => setShowLoginOptions(!showLoginOptions)}
            >
              Login{" "}
              <IoIosArrowDown
                className={`transition-transform duration-200 ${
                  showLoginOptions ? "rotate-180" : ""
                }`}
              />
            </Button>

            {showLoginOptions && (
              <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 shadow-lg">
                <Link href="/admin">
                  <div className="block cursor-pointer px-4 py-3 text-white transition-colors hover:bg-zinc-800">
                    Login as Admin
                  </div>
                </Link>
                <Link href="/student">
                  <div className="block cursor-pointer px-4 py-3 text-white transition-colors hover:bg-zinc-800">
                    Login as Student
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
