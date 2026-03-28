import React from 'react';

export function ChannelCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#1a1c25] rounded-2xl overflow-hidden min-h-[220px]">
        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-800 rounded w-3/4" />
          <div className="h-3 bg-gray-800 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function ChannelGridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ChannelCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#1a1c25] rounded-2xl h-[350px]">
        <div className="p-8 space-y-6">
          <div className="h-8 bg-gray-800 rounded w-32" />
          <div className="h-16 bg-gray-800 rounded w-3/4" />
          <div className="h-6 bg-gray-800 rounded w-1/2" />
          <div className="flex gap-4">
            <div className="h-12 bg-gray-800 rounded w-40" />
            <div className="h-12 bg-gray-800 rounded w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="animate-pulse w-64 bg-[#0a0b0f] h-full p-4 space-y-4">
      <div className="h-12 bg-gray-800 rounded-xl" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-gray-800 rounded-xl" />
        ))}
      </div>
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
      <div
        className={`${sizes[size]} border-gray-700 border-t-orange-500 rounded-full animate-spin`}
      />
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
