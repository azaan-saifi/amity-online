import Image from "next/image";
import React from "react";
import { FiBookOpen } from "react-icons/fi";

import { cn } from "@/lib/utils";

interface CourseCardProps {
  title: string;
  description: string;
  lectures: string;
  thumbnail?: string;
  className?: string;
}

const CourseCard = ({
  title,
  description,
  lectures,
  thumbnail,
  className,
}: CourseCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-zinc-800 bg-black/60 p-6 transition-all duration-300 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20",
        className
      )}
    >
      <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg">
        {thumbnail ? (
          <Image src={thumbnail} alt={title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/60 opacity-80" />
      </div>

      <h3 className="mb-2 line-clamp-2 text-2xl font-medium tracking-tight text-white">
        {title}
      </h3>
      <p className="mb-3 line-clamp-2 text-base text-zinc-400">{description}</p>
      <div className="flex items-center gap-1.5 text-sm text-zinc-500">
        <FiBookOpen className="size-4" />
        <span>{lectures}</span>
      </div>
    </div>
  );
};

export default CourseCard;
