export const ListingSkeleton = () => {
  return (
    <div className="flex flex-col bg-white border border-smoke h-full rounded-sm">
      {/* Image Block Skeleton */}
      <div className="relative h-64 w-full bg-smoke animate-pulse torn-edge z-10" />
      
      {/* Content Skeleton */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <div className="h-6 bg-smoke rounded-sm w-3/4 mb-2 animate-pulse" />
        <div className="h-6 bg-smoke rounded-sm w-1/2 mb-6 animate-pulse" />
        
        {/* Price */}
        <div className="mt-auto h-8 bg-smoke rounded-sm w-1/3 animate-pulse" />
      </div>
    </div>
  );
};