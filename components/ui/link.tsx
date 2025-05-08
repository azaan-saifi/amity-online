"use client";

import React from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface TransitionLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TransitionLink = ({
  href,
  children,
  className,
  onClick,
  ...props
}: TransitionLinkProps) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Custom click handler if provided
    if (onClick) {
      onClick();
    }
    
    // Add a small delay for visual effect before navigation
    setTimeout(() => {
      router.push(href);
    }, 150);
  };

  return (
    <NextLink
      href={href}
      onClick={handleClick}
      className={cn("transition-opacity hover:opacity-80", className)}
      {...props}
    >
      {children}
    </NextLink>
  );
}; 