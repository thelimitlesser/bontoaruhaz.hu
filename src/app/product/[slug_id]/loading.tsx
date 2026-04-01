import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-8 animate-pulse">
          <div className="h-4 w-12 bg-slate-200 rounded" />
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className="h-4 w-16 bg-slate-200 rounded" />
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Gallery Skeleton */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-square bg-slate-200 rounded-[2.5rem] animate-pulse shadow-sm" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="h-4 w-32 bg-slate-200 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
                <div className="h-10 w-3/4 bg-slate-200 rounded-xl animate-pulse" />
              </div>
            </div>

            <div className="flex items-center gap-4 py-4 border-y border-slate-100">
              <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-6 w-24 bg-slate-100 rounded-full animate-pulse" />
            </div>

            <div className="space-y-6">
              <div className="h-16 w-full bg-slate-200 rounded-2xl animate-pulse" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
                <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
              </div>
            </div>

            <div className="h-48 w-full bg-slate-200 rounded-[2rem] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
