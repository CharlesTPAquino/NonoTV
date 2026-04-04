import React from 'react';

/**
 * NonoTV — Skeleton Shimmer (Super Prompt)
 * Brilho cinza deslizante enquanto carrega
 */

const shimmerBase = 'bg-[#1e1e22]';
const shimmerOverlay = 'before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/[0.03] before:to-transparent before:animate-[shimmer_1.5s_infinite]';

function ShimmerBlock({ className = '' }) {
  return <div className={`${shimmerBase} ${shimmerOverlay} relative overflow-hidden ${className}`} />;
}

export function ChannelCardSkeletonLive() {
  return (
    <div className="h-full">
      <div className="rounded-xl overflow-hidden bg-[#1e1e22] border border-white/[0.04] h-full flex flex-col">
        <div className="aspect-video relative">
          <ShimmerBlock className="w-full h-full" />
          <div className="absolute top-2.5 left-2.5 w-12 h-4 rounded-md opacity-20">
            <ShimmerBlock className="w-full h-full rounded-md" />
          </div>
        </div>
        <div className="p-3 space-y-2 flex-1 flex flex-col justify-center">
          <ShimmerBlock className="h-3 rounded w-3/4" />
          <ShimmerBlock className="h-2 rounded w-1/2 opacity-50" />
        </div>
      </div>
    </div>
  );
}

export function ChannelCardSkeletonVod() {
  return (
    <div className="h-full">
      <div className="rounded-xl overflow-hidden bg-[#1e1e22] border border-white/[0.04] h-full flex flex-col">
        <div className="aspect-[2/3] relative">
          <ShimmerBlock className="w-full h-full" />
        </div>
        <div className="p-3 space-y-2 flex-1 flex flex-col justify-end">
          <ShimmerBlock className="h-3 rounded w-full" />
          <ShimmerBlock className="h-2 rounded w-2/3 opacity-50" />
        </div>
      </div>
    </div>
  );
}

export function ChannelCardSkeleton() {
  return <ChannelCardSkeletonLive />;
}

export function ChannelGridSkeleton({ count = 12, isPoster = false }) {
  const SkeletonComponent = isPoster ? ChannelCardSkeletonVod : ChannelCardSkeletonLive;
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl aspect-[21/9]">
      <ShimmerBlock className="w-full h-full rounded-2xl" />
      <div className="absolute inset-0 p-8 space-y-4">
        <ShimmerBlock className="h-4 rounded w-24" />
        <ShimmerBlock className="h-8 rounded w-3/4" />
        <ShimmerBlock className="h-3 rounded w-1/2" />
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="w-[72px] bg-[#161618] h-full p-3 space-y-2">
      <ShimmerBlock className="h-12 rounded-xl" />
      {Array.from({ length: 5 }).map((_, i) => (
        <ShimmerBlock key={i} className="h-10 rounded-xl" />
      ))}
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-white/5 border-t-white/60 rounded-full animate-spin`} />
    </div>
  );
}

export default {
  ChannelCardSkeleton,
  ChannelGridSkeleton,
  HeroSkeleton,
  SidebarSkeleton,
  LoadingSpinner,
};
