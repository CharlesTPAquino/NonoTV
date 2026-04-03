import React from 'react';

export function ChannelCardSkeletonLive() {
  return (
    <div className="animate-pulse h-full">
      <div className="bg-[#18181B] rounded-2xl overflow-hidden border border-white/5 h-full flex flex-col">
        {/* 16:9 Aspect Ratio for Live TV */}
        <div className="aspect-video bg-gradient-to-br from-[#27272A] to-[#18181B] relative">
          <div className="absolute top-3 right-3 w-12 h-4 bg-[#3F3F46] rounded-full opacity-20" />
        </div>
        <div className="p-4 space-y-3 flex-1 flex flex-col justify-center">
          <div className="h-5 bg-[#27272A] rounded-md w-3/4" />
          <div className="h-3 bg-[#27272A] rounded-md w-1/2 opacity-50" />
        </div>
      </div>
    </div>
  );
}

export function ChannelCardSkeletonVod() {
  return (
    <div className="animate-pulse h-full">
      <div className="bg-[#18181B] rounded-2xl overflow-hidden border border-white/5 h-full flex flex-col">
        {/* 2:3 Aspect Ratio for VOD/Movies (Poster Style) */}
        <div className="aspect-[2/3] bg-gradient-to-br from-[#27272A] to-[#18181B]" />
        <div className="p-4 space-y-3 flex-1 flex flex-col justify-end">
          <div className="h-5 bg-[#27272A] rounded-md w-full" />
          <div className="h-3 bg-[#27272A] rounded-md w-2/3 opacity-50" />
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#27272A] rounded-2xl aspect-[21/9]">
        <div className="p-8 space-y-4">
          <div className="h-6 bg-[#3F3F46] rounded w-32" />
          <div className="h-10 bg-[#3F3F46] rounded w-3/4" />
          <div className="h-4 bg-[#3F3F46] rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="animate-pulse w-[240px] bg-[#0F0F0F] h-full p-3 space-y-2">
      <div className="h-10 bg-[#27272A] rounded-xl" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-[#27272A] rounded-xl" />
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
      <div className={`${sizes[size]} border-[#3F3F46] border-t-[#F7941D] rounded-full animate-spin`} />
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
