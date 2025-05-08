import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className }: ShimmerProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-[length:400%_100%] animate-shimmer",
        className
      )}
    />
  );
}

export function CourseCardShimmer() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-black/60 p-6 transition-all duration-300">
      <div className="space-y-3">
        <Shimmer className="aspect-video w-full rounded-lg" />
        <Shimmer className="h-6 w-3/4" />
        <Shimmer className="h-4 w-full" />
      </div>
    </div>
  );
}

export function CourseListShimmer() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <CourseCardShimmer />
      <CourseCardShimmer />
      <CourseCardShimmer />
    </div>
  );
}

export function VideoListShimmer() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex w-full items-center gap-3 rounded-md p-3 text-left"
        >
          <Shimmer className="h-12 w-20 rounded-md" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-4 w-3/4" />
            <Shimmer className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VideoPlayerShimmer() {
  return (
    <div className="space-y-6">
      <Shimmer className="aspect-video w-full rounded-lg" />
      <Shimmer className="h-8 w-3/4" />
      <div className="space-y-2">
        <Shimmer className="h-2 w-full rounded-full" />
        <div className="flex justify-between">
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-4 w-20" />
        </div>
      </div>
      <div className="rounded-lg border border-zinc-800 bg-black/40 p-4">
        <div className="mb-4 flex items-center justify-between">
          <Shimmer className="h-6 w-32" />
          <Shimmer className="h-10 w-28 rounded" />
        </div>
        <Shimmer className="h-8 w-full mb-4" />
        <Shimmer className="h-64 w-full" />
      </div>
    </div>
  );
}
