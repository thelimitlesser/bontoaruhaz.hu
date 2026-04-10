import * as Sentry from "@sentry/nextjs";

export default function SentryServerTestPage() {
  // Ez a hiba a szerveren generálódik
  console.log("Sentry SERVER Teszt: Hiba generálása...");
  
  const error = new Error("Sentry SZERVER-OLDALI Teszt: " + new Date().toISOString());
  Sentry.captureException(error);
  
  return (
    <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4 bg-gray-900 text-white">
      <div className="max-w-md bg-gray-800 p-8 rounded-3xl border border-blue-500/30 shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 uppercase tracking-tight text-blue-500">Sentry Szerver Teszt</h1>
        <p className="text-gray-400 mb-8">
            Ez az oldal betöltéskor automatikusan elküldött egy hibát a SZERVERRŐL.
        </p>
        <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl text-blue-400 text-sm mb-6">
            Szerver-oldali hiba elküldve!
        </div>
        <p className="text-xs text-gray-500 italic">
            Most nézd meg a Sentry Issues listáját. Ha ez sem látszik, akkor a projekt beállításaival van gond.
        </p>
      </div>
    </div>
  );
}
