const MediaSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl h-80 p-4 border border-gray-100 animate-pulse flex flex-col gap-4">
      <div className="h-44 bg-gray-200 rounded-xl w-full"></div>
      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="mt-auto flex gap-3">
         <div className="h-9 bg-gray-200 rounded-lg w-full"></div>
         <div className="h-9 bg-gray-200 rounded-lg w-full"></div>
      </div>
    </div>
  );
};

export default MediaSkeleton;