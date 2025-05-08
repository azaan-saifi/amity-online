import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import {
  FiHome,
  FiBook,
  FiDollarSign,
  FiUsers,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  onLogout?: () => void;
}

const SidebarLink = ({
  href,
  icon,
  label,
  isActive,
  onClick,
}: SidebarLinkProps) => {
  return (
    <Link href={href} onClick={onClick}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
          isActive
            ? "bg-[#ffc20b31] text-[#f0bb1c]"
            : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
        )}
      >
        <div className="text-xl">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
};

const Sidebar = ({ onLogout }: SidebarProps) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const links = [
    {
      href: "/admin",
      icon: <FiHome />,
      label: "Dashboard",
    },
    {
      href: "/admin/courses",
      icon: <FiBook />,
      label: "Courses",
    },
    {
      href: "/admin/pricing",
      icon: <FiDollarSign />,
      label: "Pricing",
    },
    {
      href: "/admin/students",
      icon: <FiUsers />,
      label: "Students",
    },
  ];

  // Mobile Navigation Bar
  const MobileNavbar = () => (
    <div className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800 bg-black px-4 md:hidden">
      <h1 className="text-xl font-bold text-white">Admin Panel</h1>
      <button
        onClick={toggleMobileMenu}
        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
      >
        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Navigation Bar */}
      <MobileNavbar />

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-20 bg-black/80 backdrop-blur-sm transition-opacity md:hidden",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMobileMenu}
      />

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-20 h-screen bg-black border-r border-zinc-800 transition-transform duration-300 ease-in-out",
          "w-64 md:w-64 md:translate-x-0 md:transition-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-zinc-800 px-6">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <button
            onClick={toggleMobileMenu}
            className="ml-auto p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white md:hidden"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            {links.map((link) => (
              <SidebarLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
                isActive={pathname === link.href}
                onClick={closeMobileMenu}
              />
            ))}
          </nav>
        </div>

        <div className="border-t border-zinc-800 p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs text-zinc-500">Your Account</span>
          </div>
          <button
            onClick={() => {
              closeMobileMenu();
              onLogout?.();
            }}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 transition-all hover:bg-zinc-800/50 hover:text-white"
          >
            <div className="text-xl">
              <FiLogOut />
            </div>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-zinc-800 bg-black/90 py-2 backdrop-blur-md md:hidden">
        {links.slice(0, 5).map((link) => (
          <Link key={link.href} href={link.href} onClick={closeMobileMenu}>
            <div
              className={cn(
                "flex flex-col items-center p-2",
                pathname === link.href ? "text-[#f0bb1c]" : "text-zinc-400"
              )}
            >
              <div className="text-xl">{link.icon}</div>
              <span className="mt-1 text-xs">{link.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
