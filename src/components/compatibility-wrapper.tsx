import { Suspense } from "react";
import { getProductCompatibilitiesAction } from "@/app/actions/product";
import { CompatibilityTable } from "./compatibility-table";

interface CompatibilityWrapperProps {
    partId: string;
    brand: string;
    model: string;
    yearFrom: number | null;
    yearTo: number | null;
    isUniversal: boolean;
}

async function CompatibilityList({ partId, brand, model, yearFrom, yearTo, isUniversal }: CompatibilityWrapperProps) {
    const compatibilities = await getProductCompatibilitiesAction(partId);
    return (
        <CompatibilityTable
            brand={brand}
            model={model}
            yearFrom={yearFrom}
            yearTo={yearTo}
            isUniversal={isUniversal}
            extraCompatibilities={compatibilities}
        />
    );
}

export function CompatibilityWrapper(props: CompatibilityWrapperProps) {
    return (
        <Suspense fallback={
            <div className="space-y-4 animate-pulse">
                <div className="h-8 w-48 bg-muted rounded-lg" />
                <div className="h-64 w-full bg-muted rounded-2xl" />
            </div>
        }>
            <CompatibilityList {...props} />
        </Suspense>
    );
}
