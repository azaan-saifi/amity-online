import { SignedIn, UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { FiBook, FiHome, FiMenu, FiX } from "react-icons/fi";

const StudentNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // const closeMenu = () => {
  //   setIsMenuOpen(false);
  // };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/student",
      icon: <FiHome className="size-5" />,
    },
    {
      name: "My Courses",
      href: "/student/courses",
      icon: <FiBook className="size-5" />,
    },
    // {
    //   name: "Profile",
    //   href: "/student/profile",
    //   icon: <FiUser className="size-5" />,
    // },
  ];

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled
            ? "border-b border-yellow-gradient-from/20 bg-black/85 shadow-lg shadow-yellow-gradient-from/10"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/student"
                className="group flex items-center space-x-2"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-gradient-yellow text-lg font-bold text-black">
                  S
                </div>
                <span className="text-xl font-bold text-white transition-colors group-hover:text-yellow-400">
                  Student Portal
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative flex items-center space-x-1 p-2 transition-all`}
                    >
                      <span
                        className={`transition-all duration-200 hover:text-yellow-400 ${
                          active ? "text-yellow-400" : "text-white"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={`transition-all duration-200 hover:text-yellow-400 ${
                          active ? "text-yellow-400" : "text-white"
                        }`}
                      >
                        {item.name}
                      </span>
                      {active && (
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-yellow" />
                      )}
                    </Link>
                  );
                })}

                {/* User button and logout */}
                <SignedIn>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-9 w-9",
                        popoverCard: "bg-black",
                      },
                    }}
                  />
                </SignedIn>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={toggleMenu}
                className="hover:bg-gradient-yellow/10 inline-flex items-center justify-center rounded-md p-2 text-yellow-400 transition-colors duration-200 hover:text-yellow-400 focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <FiX className="block size-6" aria-hidden="true" />
                ) : (
                  <FiMenu className="block size-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-zinc-800/60 bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-lg md:hidden"
            >
              <div className="space-y-1 px-4 pb-3 pt-2">
                {navItems.map((item) => {
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative flex items-center space-x-3 rounded-md p-2 transition-all ${
                        active
                          ? "bg-gradient-yellow/10 text-yellow-400"
                          : "hover:bg-zinc-800"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span
                        className={`transition-all duration-200 ${
                          active ? "text-yellow-400" : ""
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                <SignedIn>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-9 w-9",
                        popoverCard: "bg-black",
                      },
                    }}
                  />
                </SignedIn>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer to push content down below fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default StudentNavbar;
