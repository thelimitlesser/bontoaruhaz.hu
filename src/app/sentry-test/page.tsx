"use client";

export default function SentryTestPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4 bg-gray-900 text-white">
      <div className="max-w-md bg-gray-800 p-8 rounded-3xl border border-orange-500/30 shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 uppercase tracking-tight text-orange-500">Sentry Teszt Oldal</h1>
        <p className="text-gray-400 mb-8">
            Kattints az alábbi gombra egy hiba generálásához, hogy ellenőrizd a Sentry működését.
        </p>
        <button
          onClick={() => {
            throw new Error("Sentry Teszt Hiba: " + new Date().toISOString());
          }}
          className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-xl shadow-orange-500/20 active:scale-95"
        >
          Hiba generálása
        </button>
        <p className="text-[10px] text-gray-500 mt-6 italic">
            Megjegyzés: A hiba beküldése után nézz rá a Sentry műszerfalára a változásokért.
        </p>
      </div>
    </div>
  );
}
