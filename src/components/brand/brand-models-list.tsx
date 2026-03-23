"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import { Model } from "@/lib/vehicle-data";

interface BrandModelsListProps {
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string;
  };
  models: Model[];
}

export function BrandModelsList({ brand, models }: BrandModelsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-0 mb-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-[2rem] overflow-hidden border border-gray-100">
        <div className="relative flex-grow bg-white">
          <input
            type="text"
            placeholder="Keress modell, széria vagy kód (pl. E46) alapján..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent py-5 px-8 text-gray-700 focus:outline-none placeholder:text-gray-300 text-lg font-bold"
          />
        </div>
        <button className="bg-gradient-to-r from-[var(--color-primary)] to-[#f97316] hover:opacity-95 text-white px-8 sm:px-12 py-4 sm:py-5 font-black flex items-center justify-center gap-3 transition-all min-w-full md:min-w-[240px] uppercase tracking-wider text-xs sm:text-sm">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[4px]" />
          KERESÉS
        </button>
      </div>

      {/* Models Grid */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start">
        {(() => {
          const grouped = filteredModels.reduce((groups, model) => {
            const key = model.series || model.name;
            if (!groups[key]) groups[key] = [];
            groups[key].push(model);
            return groups;
          }, {} as Record<string, Model[]>);

          const sortedEntries = Object.entries(grouped).sort((a, b) =>
            a[0].localeCompare(b[0])
          );

          const items = [
            ...sortedEntries.map(([series, models]) => ({
              type: "series" as const,
              title: series,
              models,
              height: 1 + models.length,
            })),
            { type: "help" as const, height: 4 },
          ];

          const totalHeight = items.reduce((sum, item) => sum + item.height, 0);
          const targetHeight = totalHeight / 5;

          const columnBuckets: any[][] = [[], [], [], [], []];
          let currentCol = 0;
          let currentHeight = 0;

          items.forEach((item) => {
            const heightWithItem = currentHeight + item.height;
            const distWithout = Math.abs(currentHeight - targetHeight);
            const distWith = Math.abs(heightWithItem - targetHeight);

            if (currentCol < 4 && currentHeight > 0 && distWith > distWithout) {
              currentCol++;
              currentHeight = 0;
            }
            columnBuckets[currentCol].push(item);
            currentHeight += item.height;
          });

          return columnBuckets.map((column, colIdx) => (
            <div key={`col-${colIdx}`} className="flex-1 flex flex-col gap-3 md:gap-4 w-full">
              {column.map((item, itemIdx) =>
                item.type === "series" ? (
                  <div
                    key={item.title}
                    className="bg-white/95 rounded-xl border border-gray-100/50 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] group"
                  >
                    <div className="px-5 py-2.5 border-b border-gray-50 bg-white group-hover:bg-gray-50/30 transition-colors">
                      <h3 className="text-sm font-black text-[var(--color-primary)] uppercase tracking-tight">
                        {item.title}
                      </h3>
                    </div>
                    <div className="p-3.5 space-y-1.5 flex flex-col">
                      {item.models
                        .sort((a: Model, b: Model) => a.name.localeCompare(b.name))
                        .map((model: Model) => (
                          <Link
                            key={model.id}
                            href={`/brand/${brand.slug}/${model.slug}`}
                            className="text-[13px] font-bold text-gray-600 hover:text-[var(--color-primary)] transition-colors uppercase tracking-tight py-1 flex items-center gap-2 group/item"
                          >
                            <div className="w-1 h-1 rounded-full bg-gray-300 group-hover/item:bg-[var(--color-primary)] transition-colors" />
                            {model.name}
                          </Link>
                        ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key="help-box"
                    href="/#kereso"
                    className="block p-5 bg-white rounded-xl border-2 border-dashed border-gray-100 hover:border-[var(--color-primary)] hover:bg-orange-50/30 transition-all group shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-orange-100/50 flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                        <SearchX size={20} />
                      </div>
                      <div>
                        <div className="text-[13px] font-black text-[var(--color-primary)] uppercase leading-tight">
                          NEM TALÁLOD?
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          ));
        })()}
      </div>

      {filteredModels.length === 0 && (
        <div className="mt-8 py-20 text-center text-gray-400 font-black text-xl bg-white border border-dashed border-gray-200 rounded-2xl">
          Nincs találat a "{searchTerm}" kifejezésre.
        </div>
      )}
    </>
  );
}
