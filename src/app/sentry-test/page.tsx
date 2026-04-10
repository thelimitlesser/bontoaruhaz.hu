import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

export default function SentryTestPage() {
  const [status, setStatus] = useState<string | null>(null);

  return (
    <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4 bg-gray-900 text-white">
      <div className="max-w-md bg-gray-800 p-8 rounded-3xl border border-orange-500/30 shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 uppercase tracking-tight text-orange-500">Sentry Teszt Oldal</h1>
        
        {status && (
          <div className="mb-6 p-3 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 text-sm">
            {status}
          </div>
        )}

        <p className="text-gray-400 mb-8">
            Kattints az alábbi gombra egy hiba generálásához és KÉNYSZERÍTETT beküldéséhez.
        </p>
        <button
          onClick={() => {
            try {
              setStatus("Küldés folyamatban...");
              console.log("Sentry Teszt: Gomb megnyomva");
              
              // Kényszerített hiba és beküldés
              const error = new Error("Sentry KÉNYSZERÍTETT Teszt: " + new Date().toISOString());
              Sentry.captureException(error);
              
              console.log("Sentry Teszt: Hiba elküldve");
              setStatus("Siker! A hiba elküldve a Sentry-nek. Ellenőrizd a műszerfalat!");
            } catch (err) {
              console.error("Sentry Teszt Hiba:", err);
              setStatus("Hiba történt a küldés során. Nézd meg a konzolt!");
            }
          }}
          className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-xl shadow-orange-500/20 active:scale-95"
        >
          Hiba beküldése most
        </button>
        <p className="text-[10px] text-gray-500 mt-6 italic">
            Ha a felirat megjelenik, de a Sentry nem jelez, akkor a böngésződ (Safari/Adblock) blokkolja a hálózatot.
        </p>
      </div>
    </div>
  );
}
