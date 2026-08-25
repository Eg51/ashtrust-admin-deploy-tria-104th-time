export default function BusinessLoading() {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-200 via-cyan-100 to-gray-300 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-4">
          {/* Navbar skeleton */}
          <div className="h-16 w-full animate-pulse rounded-xl shadow-xl bg-[#C4F8FD] opacity-70" />
          
          {/* Hero section skeleton */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 pt-8">
            <div className="h-48 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD] opacity-70 lg:col-span-2" />
            <div className="h-48 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD] opacity-70" />
          </div>
          
          {/* Features grid skeleton */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="h-32 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD] opacity-70" />
            <div className="h-32 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD] opacity-70" />
            <div className="h-32 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD] opacity-70" />
            <div className="h-32 animate-pulse rounded-xl shadow-xl bg-[#C4F8FD] opacity-70" />
          </div>
        </div>
      </div>
    );
  }