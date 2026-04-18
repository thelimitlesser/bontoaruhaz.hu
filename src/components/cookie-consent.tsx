"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem("bontoaruhaz-cookie-consent");
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("bontoaruhaz-cookie-consent", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 pointer-events-none"
        >
          <div className="max-w-7xl mx-auto flex justify-center md:justify-end">
            <div className="w-full md:max-w-md bg-white border border-gray-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1),0_10px_20px_-5px_rgba(0,0,0,0.05)] rounded-[2rem] p-6 pointer-events-auto backdrop-blur-xl bg-white/95">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-50 rounded-2xl shrink-0">
                  <Cookie className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 leading-tight">Süti tájékoztató</h3>
                    <button 
                      onClick={() => setIsVisible(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    Weboldalunk sütiket használ a legjobb felhasználói élmény és a biztonságos vásárlás érdekében. 
                    Az „Elfogadom” gombra kattintva hozzájárulsz a használatukhoz.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={acceptCookies}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/20 text-sm active:scale-95"
                    >
                      Elfogadom
                    </button>
                    <Link
                      href="/privacy"
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-3 px-6 rounded-xl transition-all text-sm text-center active:scale-95"
                    >
                      Részletek
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
