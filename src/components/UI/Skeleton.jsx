import React from 'react';

export function ChannelCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#27272A] rounded-xl overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-[#3F3F46] to-[#27272A]" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-[#3F3F46] rounded w-3/4" />
          <div className="h-3 bg-[#3F3F46] rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function ChannelGridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ChannelCardSkeleton key={i} />
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
