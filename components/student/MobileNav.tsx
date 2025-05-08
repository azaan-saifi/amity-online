import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiHome, FiLogOut, FiMenu, FiUser, FiX } from 'react-icons/fi';

interface MobileNavProps {
  onLogout: () => void;
}

const MobileNav = ({ onLogout }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const closeMenu = () => {
    setIsOpen(false);
  };
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  const navItems = [
    {
      name: 'Dashboard',
      href: '/student',
      icon: <FiHome className="h-5 w-5" />
    },
    {
      name: 'My Courses',
      href: '/student/courses',
      icon: <FiBook className="h-5 w-5" />
    },
    {
      name: 'Profile',
      href: '/student/profile',
      icon: <FiUser className="h-5 w-5" />
    }
  ];
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-zinc-800 bg-black/80 backdrop-blur-md px-4 md:hidden">
      <div className="text-lg font-bold text-white">Student Portal</div>
      
      <button
        onClick={toggleMenu}
        className="rounded-md p-2 text-white hover:bg-zinc-800"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 top-16 z-40 h-[calc(100vh-4rem)] bg-black"
          >
            <div className="flex h-full flex-col p-4">
              <nav className="space-y-1 flex-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 rounded-md px-4 py-3 transition-colors ${
                        active 
                          ? 'bg-[#ffc20b31] text-[#f0bb1c]' 
                          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              
              <div className="pt-4 border-t border-zinc-800">
                <button
                  onClick={() => {
                    closeMenu();
                    onLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-rose-400 transition-colors hover:bg-zinc-800/50"
                >
                  <FiLogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileNav; 