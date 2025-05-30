import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBook, FiHome, FiLogOut, FiUser } from "react-icons/fi";

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar = ({ onLogout }: SidebarProps) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const sidebarItems = [
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
    {
      name: "Profile",
      href: "/student/profile",
      icon: <FiUser className="size-5" />,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-800 bg-black/50 backdrop-blur-md transition-all duration-300 md:block">
      <div className="flex h-full flex-col gap-2 p-4">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center py-6">
          <span className="text-xl font-bold text-white">Student Portal</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                  active
                    ? "bg-[#ffc20b31] text-[#f0bb1c]"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute right-0 h-6 w-1 rounded-l-full bg-[#f0bb1c]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="border-t border-zinc-800 pt-2">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-rose-400 transition-colors hover:bg-zinc-800/50"
          >
            <FiLogOut className="size-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
