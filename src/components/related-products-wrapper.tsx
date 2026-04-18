import { Suspense } from "react";
import { getRelatedProducts } from "@/app/actions/product";
import { RelatedProducts } from "./related-products";

interface RelatedProductsWrapperProps {
    productId: string;
    modelId: string | null;
    brandId: string | null;
    brandName: string;
    modelName: string;
    brandSlug: string;
    modelSlug: string;
    contextBrandId?: string | null;
    contextModelId?: string | null;
}

async function RelatedProductsList({ 
    productId, modelId, brandId, brandName, modelName, brandSlug, modelSlug,
    contextBrandId, contextModelId 
}: RelatedProductsWrapperProps) {
    const products = await getRelatedProducts(productId, modelId, brandId, 4, contextBrandId, contextModelId);
    return (
        <RelatedProducts 
            products={products} 
            brandName={brandName} 
            modelName={modelName} 
            brandSlug={brandSlug} 
            modelSlug={modelSlug}
            contextBrandId={contextBrandId}
            contextModelId={contextModelId}
        />
    );
}

export function RelatedProductsWrapper(props: RelatedProductsWrapperProps) {
    return (
        <Suspense fallback={
            <div className="max-w-7xl mx-auto mt-20 mb-12 border-t border-border pt-16 animate-pulse">
                <div className="h-8 w-64 bg-muted rounded-full mb-10" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-[3/4] bg-muted rounded-[2rem]" />
                    ))}
                </div>
            </div>
        }>
            <RelatedProductsList {...props} />
        </Suspense>
    );
}
