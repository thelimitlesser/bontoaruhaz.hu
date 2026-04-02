export const dynamic = "force-dynamic";
import { ArrowRight, Search } from "lucide-react";
import { VehicleSelector } from "@/components/vehicle-selector";
import { HeroBackground } from "@/components/hero-background";
import { BrandSelector } from "@/components/brand-selector";
import { getVehicleSelectorDataAction, getActivePartOptionsAction } from "@/app/actions/vehicle";

export default async function Home() {
  const { brands: activeBrands, modelsMap } = await getVehicleSelectorDataAction();
  const initialPartOptions = await getActivePartOptionsAction();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2 sm:p-20 font-[family-name:var(--font-geist-sans)] overflow-x-hidden w-full">

      {/* Hero Section */}
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-full">

        {/* HERO SECTION */}
        <section className="relative w-full min-h-[85dvh] flex items-center justify-center p-2 sm:p-20 mt-16 sm:mt-20 z-0">
          {/* Animated Background */}
          <HeroBackground />

          <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-3 sm:gap-8 text-center px-1 sm:px-0">

            <div id="kereso" className="scroll-mt-32 relative flex flex-col items-center gap-1 text-center pt-2 pb-1 sm:py-6 px-2 sm:px-4 w-full">
              {/* Subtle black spread for contrast */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0)_60%)] blur-sm -z-10 rounded-full w-[100%] h-[100%] left-0 top-0 pointer-events-none"></div>

              <h1 className="text-[clamp(1.25rem,6.5vw,2.5rem)] sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight uppercase italic drop-shadow-lg w-full break-words max-w-[100vw]">
                Megbízható autóalkatrészek<br />
                Magyarországon
              </h1>
              <div className="inline-block mt-0 sm:mt-1 w-full flex justify-center">
                <span className="text-[clamp(1rem,5.5vw,3rem)] sm:text-5xl lg:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-orange-500 uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-1 sm:px-0 whitespace-nowrap">
                  15 év tapasztalattal
                </span>
              </div>
            </div>

            {/* MAIN SEARCH WIDGET */}
            <div className="w-full text-left transform translate-y-0 sm:translate-y-4 px-1 sm:px-0">
              <VehicleSelector initialBrands={activeBrands} initialModelsMap={modelsMap} initialPartOptions={initialPartOptions} />
            </div>

            {/* 14-Day Guarantee Card */}
            <div className="flex justify-center mt-6 sm:mt-10 w-full px-2">
              <div className="group flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-full shadow-[0_4px_15px_-3px_rgba(219,81,60,0.3)] hover:shadow-[0_8px_20px_-3px_rgba(219,81,60,0.4)] transform hover:-translate-y-0.5 transition-all duration-300 border border-white/10 w-full sm:w-auto max-w-[320px] sm:max-w-none">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/90 shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3.5 6.5v4.58c0 5.29 3.63 10.24 8.5 11.42 4.87-1.18 8.5-6.13 8.5-11.42V6.5L12 2zM10 15.5l-3-3 1.41-1.41L10 12.67l4.59-4.59L16 9.5l-6 6z" />
                </svg>
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap truncate">
                  14 nap pénzvisszafizetési garancia
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* BRAND SELECTOR SECTION - Secondary method */}
        <div id="markak" className="w-full px-2 sm:px-0 scroll-mt-32">
          <BrandSelector brands={activeBrands} />
        </div>

      </main>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>
    </div>
  );
}
