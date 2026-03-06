import { Check, X, Globe, AlertTriangle } from"lucide-react";
import { getBrandBySlug, getModelBySlug } from"@/lib/vehicle-data";

interface ExtraCompatibility {
    brandId: string;
    modelId: string;
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
                <table className="w-full text-left text-sm text-muted">
                    <thead className="bg-foreground/5 text-foreground uppercase tracking-wider text-xs">
                        <tr>
                            <th className="p-4 font-semibold">Márka</th>
                            <th className="p-4 font-semibold">Modell</th>
                            <th className="p-4 font-semibold hidden sm:table-cell">Évjárat</th>
                            <th className="p-4 font-semibold text-right">Státusz</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {/* Primary Donor Vehicle */}
                        <tr className="hover:bg-foreground/5 transition-colors group">
                            <td className="p-4 text-foreground font-medium">{brand}</td>
                            <td className="p-4">{model}</td>
                            <td className="p-4 hidden sm:table-cell">
                                {yearFrom ||'...'} - {yearTo ||'...'}
                            </td>
                            <td className="p-4 text-right">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    <Check className="w-3 h-3" /> Elsődleges
                                </span>
                            </td>
                        </tr>

                        {/* Extra Compatibilities */}
                        {extraCompatibilities.map((comp, idx) => {
                            const bName = getBrandBySlug(comp.brandId)?.name || comp.brandId;
                            const mName = getModelBySlug(comp.modelId)?.name || comp.modelId;
                            return (
                                <tr key={idx} className="hover:bg-foreground/5 transition-colors group">
                                    <td className="p-4 text-foreground font-medium">{bName}</td>
                                    <td className="p-4">{mName}</td>
                                    <td className="p-4 hidden sm:table-cell">
                                        {comp.yearFrom ||'...'} - {comp.yearTo ||'...'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                            <Check className="w-3 h-3" /> Kompatibilis
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <p className="mt-4 text-xs text-center text-muted">
                <AlertTriangle className="w-3 h-3 inline mr-1 text-orange-500" />
                A kompatibilitási lista tájékoztató jellegű. Vásárlás előtt mindig ellenőrizd a gyári cikkszámot!
            </p>
        </div>
    );
}
