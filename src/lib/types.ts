export interface Brand {
    id: string;
    name: string;
    slug: string;
    logo: string; // URL or Lucide Icon Name
    scale?: string; // Optional CSS scale class (e.g., "scale-100", "scale-125")
}

export interface Model {
    id: string;
    brandId: string;
    name: string;
    slug: string;
    years?: string;
    series?: string; // For grouping, e.g., "MEGANE", "ESPACE" 
    keywords?: string[]; // Sub-model names or aliases like ["C220", "C270"]
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon: any;
    keywords?: string[];
}

export interface Subcategory {
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    keywords?: string[];
}

export interface PartItem {
    id: string;
    subcategoryId: string;
    name: string;
    slug: string;
    keywords?: string[];
}
