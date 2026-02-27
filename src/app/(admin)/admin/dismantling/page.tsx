import { Plus, Car } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DismantlingPage() {
    const vehicles = await prisma.donorVehicle.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6 text-gray-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bontás / Donor Autók</h1>
                    <p className="text-gray-500">Beérkezett járművek kezelése</p>
                </div>
                <Link href="/admin/dismantling/new" className="bg-[var(--color-primary)] hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus className="w-5 h-5" />
                    Új Jármű Felvétele
                </Link>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Jármű</th>
                            <th className="px-6 py-4">Alvázszám (VIN)</th>
                            <th className="px-6 py-4">Évjárat</th>
                            <th className="px-6 py-4">Motor / Szín</th>
                            <th className="px-6 py-4">Km Óra</th>
                            <th className="px-6 py-4 text-center">Kinyert Alkatrészek</th>
                            <th className="px-6 py-4 text-right">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {vehicles.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    Nincs rögzített donor jármű.
                                </td>
                            </tr>
                        ) : (
                            vehicles.map((car) => (
                                <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Car className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{car.make} {car.model}</div>
                                                <div className="text-xs text-gray-600">Bontásra vár</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-900">{car.vin}</td>
                                    <td className="px-6 py-4">{car.year}</td>
                                    <td className="px-6 py-4">
                                        <div>{car.engineCode || '-'}</div>
                                        <div className="text-xs text-gray-500">{car.colorCode || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4">{car.mileage?.toLocaleString() || 0} km</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold border border-gray-200">
                                            -
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-[var(--color-primary)] hover:underline font-bold">Bontás Indítása</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
