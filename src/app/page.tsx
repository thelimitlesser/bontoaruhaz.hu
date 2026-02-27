import { ArrowRight, Search } from "lucide-react";
import { VehicleSelector } from "@/components/vehicle-selector";
import { HeroBackground } from "@/components/hero-background";
import { BrandSelector } from "@/components/brand-selector";


export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">

      {/* Hero Section */}
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full">

        {/* HERO SECTION */}
        <section className="relative w-full min-h-[85vh] flex items-center justify-center p-8 sm:p-20 mt-20 z-0">
          {/* Animated Background */}
          <HeroBackground />

          <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-8 text-center">

            <h1 className="text-5xl sm:text-8xl font-black text-foreground tracking-tighter leading-[0.9] italic uppercase drop-shadow-2xl">
              A VÉRÜNKBEN VAN<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-orange-500">A LÓERŐ.</span>
            </h1>

            {/* MAIN SEARCH WIDGET */}
            <div className="w-full text-left transform translate-y-4">
              <VehicleSelector />
            </div>

            {/* 14-Day Guarantee Badge */}
            <div className="flex justify-center mt-6 w-full">
              <div className="flex items-center gap-2 text-sm font-medium text-white/90 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 hover:bg-black/30 hover:border-white/20 transition-all cursor-default">
                <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>14 nap pénzvisszafizetési garancia</span>
              </div>
            </div>

          </div>
        </section>

        {/* BRAND SELECTOR SECTION - Secondary method */}
        <BrandSelector />

      </main>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>
    </div>
  );
}
