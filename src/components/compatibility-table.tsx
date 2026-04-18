import { Check, X, Globe, AlertTriangle } from "lucide-react";

interface ExtraCompatibility {
    brandId: string;
    modelId: string;
    brandName?: string;
    modelName?: string;
    yearFrom?: number | null;
    yearTo?: number | null;
}

interface CompatibilityTableProps {
    brand: string;
    model: string;
    yearFrom?: number | null;
    yearTo?: number | null;
    isUniversal?: boolean;
    extraCompatibilities?: ExtraCompatibility[];
}

export function CompatibilityTable({ brand, model, yearFrom, yearTo, isUniversal, extraCompatibilities = [] }: CompatibilityTableProps) {
    if (isUniversal) {
        return (
            <div className="mt-2">
                <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-900/10 to-transparent p-8 backdrop-blur-sm text-center">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Globe className="w-24 h-24" />
                    </div>
                    <Globe className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-foreground mb-2">Univerzális Alkatrész</h3>
                    <p className="text-muted max-w-md mx-auto">
                        Ez az alkatrész nem kötődik konkrét autótípushoz. Minden olyan gépjárműhöz használható, amelynél a technikai paraméterek (pl. méret, csatlakozás) megegyeznek.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-2">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Check className="w-6 h-6 text-emerald-500" />
                Kompatibilis Járművek
            </h3>

            <div className="glass-panel rounded-2xl overflow-hidden border border-border">
                {/* Desktop View: Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-foreground/5 text-foreground uppercase tracking-wider text-xs">
                            <tr>
                                <th className="p-4 font-semibold">Márka</th>
                                <th className="p-4 font-semibold">Modell</th>
                                <th className="p-4 font-semibold">Évjárat</th>
                                <th className="p-4 font-semibold text-right">Státusz</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-foreground">
                            {/* Primary Donor Vehicle */}
                            <tr className="hover:bg-foreground/5 transition-colors group">
                                <td className="p-4 font-bold">{brand}</td>
                                <td className="p-4 font-medium">{model}</td>
                                <td className="p-4 font-medium">
                                    {(yearFrom || yearTo) ? `${yearFrom || ''} - ${yearTo || ''}` : '...'}
                                </td>
                                <td className="p-4 text-right">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                        <Check className="w-3 h-3" /> Elsődleges
                                    </span>
                                </td>
                            </tr>

                            {/* Extra Compatibilities */}
                            {extraCompatibilities.map((comp, idx) => (
                                <tr key={idx} className="hover:bg-foreground/5 transition-colors group">
                                    <td className="p-4 font-bold">{comp.brandName || comp.brandId}</td>
                                    <td className="p-4 font-medium">{comp.modelName || comp.modelId}</td>
                                    <td className="p-4 font-medium">
                                        {(comp.yearFrom || comp.yearTo) ? `${comp.yearFrom || ''} - ${comp.yearTo || ''}` : '...'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                            <Check className="w-3 h-3" /> Kompatibilis
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View: Vertical Cards */}
                <div className="sm:hidden divide-y divide-border">
                    {/* Primary Vehicle Card */}
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Márka / Modell</p>
                                <p className="font-bold text-foreground">{brand} {model}</p>
                            </div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-tighter">
                                <Check className="w-2.5 h-2.5" /> Elsődleges
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-muted">
                            <p>Évjárat: <span className="text-foreground">{(yearFrom || yearTo) ? `${yearFrom || ''} - ${yearTo || ''}` : '...'}</span></p>
                        </div>
                    </div>

                    {/* Extra Compatibility Cards */}
                    {extraCompatibilities.map((comp, idx) => (
                        <div key={idx} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Márka / Modell</p>
                                    <p className="font-bold text-foreground">{comp.brandName || comp.brandId} {comp.modelName || comp.modelId}</p>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-tighter">
                                    <Check className="w-2.5 h-2.5" /> Kompatibilis
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium text-muted">
                                <p>Évjárat: <span className="text-foreground">{(comp.yearFrom || comp.yearTo) ? `${comp.yearFrom || ''} - ${comp.yearTo || ''}` : '...'}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <p className="mt-4 text-xs text-center text-muted">
                <AlertTriangle className="w-3 h-3 inline mr-1 text-orange-500" />
                A kompatibilitási lista tájékoztató jellegű. Vásárlás előtt mindig ellenőrizd a gyári cikkszámot!
            </p>
        </div>
    );
}
