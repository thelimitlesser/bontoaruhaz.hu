import { Check, X } from "lucide-react";

interface CompatibilityTableProps {
    brand: string;
    model: string;
}

export function CompatibilityTable({ brand, model }: CompatibilityTableProps) {
    // Mock compatibility data logic based on the product's brand/model
    // In a real app, this would come from an API

    return (
        <div className="mt-16">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Check className="w-6 h-6 text-emerald-500" />
                Kompatibilis Járművek
            </h3>

            <div className="glass-panel rounded-2xl overflow-hidden border border-border">
                <table className="w-full text-left text-sm text-muted">
                    <thead className="bg-foreground/5 text-foreground uppercase tracking-wider text-xs">
                        <tr>
                            <th className="p-4 font-semibold">Márka</th>
                            <th className="p-4 font-semibold">Modell</th>
                            <th className="p-4 font-semibold hidden sm:table-cell">Évjárat</th>
                            <th className="p-4 font-semibold hidden sm:table-cell">Motor</th>
                            <th className="p-4 font-semibold text-right">Státusz</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        <tr className="hover:bg-foreground/5 transition-colors group">
                            <td className="p-4 text-foreground font-medium">{brand}</td>
                            <td className="p-4">{model}</td>
                            <td className="p-4 hidden sm:table-cell">2012 - 2017</td>
                            <td className="p-4 hidden sm:table-cell">Összes típus</td>
                            <td className="p-4 text-right">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <Check className="w-3 h-3" /> Kompatibilis
                                </span>
                            </td>
                        </tr>
                        <tr className="hover:bg-foreground/5 transition-colors group">
                            <td className="p-4 text-foreground font-medium">{brand}</td>
                            <td className="p-4">{model} Kombi (Variant)</td>
                            <td className="p-4 hidden sm:table-cell">2013 - 2018</td>
                            <td className="p-4 hidden sm:table-cell">1.6 TDI, 2.0 TDI</td>
                            <td className="p-4 text-right">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <Check className="w-3 h-3" /> Kompatibilis
                                </span>
                            </td>
                        </tr>
                        {/* Example non-compatible row for contrast */}
                        <tr className="hover:bg-foreground/5 transition-colors group opacity-50">
                            <td className="p-4 text-muted">{brand}</td>
                            <td className="p-4">Régebbi típusok ({model} előd)</td>
                            <td className="p-4 hidden sm:table-cell">- 2011</td>
                            <td className="p-4 hidden sm:table-cell">-</td>
                            <td className="p-4 text-right">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                    <X className="w-3 h-3" /> Nem jó
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p className="mt-4 text-xs text-center text-muted">
                ⚠️ A kompatibilitási lista tájékoztató jellegű. Vásárlás előtt mindig ellenőrizd a gyári cikkszámot!
            </p>
        </div>
    );
}
