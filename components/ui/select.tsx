"use client";

import * as React from "react";
import { FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  disabled?: boolean;
}

// Helper for merging refs
function useMergedRefs<T>(
  ...refs: Array<React.RefObject<T> | React.MutableRefObject<T> | React.LegacyRef<T> | undefined>
): React.RefCallback<T> {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref && "current" in ref) {
        // @ts-ignore - this is safe because we check for existence of current
        ref.current = value;
      }
    });
  };
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({
    value,
    onChange,
    options,
    placeholder = "Select an option",
    className,
    containerClassName,
    menuClassName,
    optionClassName,
    disabled = false,
    ...props
  }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const selectRef = React.useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(ref, selectRef);

    // Find the currently selected option
    const selectedOption = options.find(option => option.value === value);

    // Close the dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Dropdown animations
    const dropdownVariants = {
      hidden: { 
        opacity: 0, 
        y: -5,
        scale: 0.95,
        transition: {
          duration: 0.15,
          ease: "easeInOut"
        }
      },
      visible: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: {
          duration: 0.2,
          ease: "easeOut"
        }
      }
    };
    
    // Button animations
    const buttonVariants = {
      rest: { 
        backgroundColor: "rgba(0, 0, 0, 0.6)"
      },
      hover: { 
        backgroundColor: "rgba(20, 20, 20, 0.8)",
        transition: { duration: 0.2 }
      },
      focus: {
        boxShadow: "0 0 0 2px rgba(240, 187, 28, 0.2)",
        borderColor: "#f0bb1c",
        transition: { duration: 0.2 }
      }
    };

    // Option animation variants
    const optionVariants = {
      rest: { 
        backgroundColor: "transparent",
        transition: { duration: 0.1 }
      },
      hover: { 
        backgroundColor: "rgba(50, 50, 50, 0.5)",
        transition: { duration: 0.1 }
      },
      selected: {
        backgroundColor: "rgba(240, 187, 28, 0.2)",
        color: "#f0bb1c",
        transition: { duration: 0.1 }
      }
    };

    // Construct animation state array for the button
    const buttonAnimateState = isFocused || open ? "focus" : "rest";

    return (
      <div 
        className={cn("relative", containerClassName)}
        ref={mergedRef}
        {...props}
      >
        <motion.button
          type="button"
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-zinc-800 bg-black/60 px-3 py-1 text-sm text-white shadow-sm backdrop-blur-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          onClick={() => !disabled && setOpen(!open)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          variants={buttonVariants}
          initial="rest"
          animate={buttonAnimateState}
          whileHover="hover"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className={!selectedOption ? "text-zinc-500" : ""}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <FiChevronDown className="h-4 w-4 text-zinc-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={dropdownVariants}
              className={cn(
                "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-800 bg-zinc-900/95 py-1 shadow-md backdrop-blur-md",
                menuClassName
              )}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <div role="listbox">
                {options.map((option) => (
                  <motion.div
                    key={option.value}
                    variants={optionVariants}
                    initial="rest"
                    whileHover="hover"
                    animate={option.value === value ? "selected" : "rest"}
                    className={cn(
                      "cursor-pointer px-3 py-2 text-sm text-white transition-colors",
                      optionClassName
                    )}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    {option.label}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Select.displayName = "Select"; 