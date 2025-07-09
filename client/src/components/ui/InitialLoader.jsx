const InitialLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-white via-grey-50 to-grey-100">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-t-4 border-grey-500 animate-spin shadow-lg shadow-grey-200"></div>
          <div className="absolute inset-0 rounded-full animate-ping bg-grey-400 opacity-20"></div>
        </div>
        <div className="text-grey-700 text-lg font-semibold animate-pulse tracking-wide">
          Preparing your experience...
        </div>
      </div>
    </div>
  );
};

export default InitialLoader;
