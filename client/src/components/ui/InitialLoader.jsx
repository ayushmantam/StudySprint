const InitialLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-white via-blue-50 to-blue-100">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-t-4 border-blue-500 animate-spin shadow-lg shadow-blue-200"></div>
          <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20"></div>
        </div>
        <div className="text-blue-600 text-lg font-semibold animate-pulse tracking-wide">
          Preparing your experience...
        </div>
      </div>
    </div>
  );
};

export default InitialLoader;
