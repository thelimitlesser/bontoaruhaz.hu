import {
    IconCarDoor,
    IconHeadlight,
    IconWindshield,
    IconSideMirror,
    IconCarSeat,
    IconDashboard,
    IconRadiator,
    IconEngine,
    IconAlternator,
    IconSparkPlug,
    IconECU,
    IconSwitch,
    IconAirbag,
    IconKey,
    IconGearShifter,
    IconBrakeDisc,
    IconSteeringWheel,
    IconFuel,
    IconExhaust
} from "@/components/icons/AutoIcons";
import {
    partItems as partsPartItemsData,
    Category as PartCategory,
    Subcategory as PartSubcategory,
    subcategories as partsSubcategoriesData,
    categories as partsCategoriesData,
    PartItem as PartItemType
} from "./parts-data";

export const categories = partsCategoriesData;
export const partsSubcategories = partsSubcategoriesData;
export const partItems = partsPartItemsData;

import { Brand, Model } from './types';
export type { Brand, Model };

export interface Category extends PartCategory { }

export interface Subcategory extends PartSubcategory {
    productCount?: number;
}

export interface PartItem extends PartItemType { }

export interface Product {
    id: string;
    brandId: string;
    modelId: string;
    categoryId: string;
    subcategoryId?: string;
    partItemId?: string;
    name: string;
    sku: string;
    price: number;
    image: string;
    inStock: number;
    condition: "new" | "used";
}

// --- Data ---

export const brands: Brand[] = [
    { id: "alfa-romeo", name: "Alfa Romeo", slug: "alfa-romeo", logo: "/brands/alfa-romeo.svg?v=14" },
    { id: "audi", name: "Audi", slug: "audi", logo: "/brands/audi.svg?v=12" },
    { id: "bmw", name: "BMW", slug: "bmw", logo: "/brands/bmw.svg?v=12" },
    { id: "chevrolet", name: "Chevrolet", slug: "chevrolet", logo: "/brands/chevrolet.svg?v=12", scale: "scale-125" },
    { id: "citroen", name: "Citroën", slug: "citroen", logo: "/brands/citroen.svg?v=12" },
    { id: "dacia", name: "Dacia", slug: "dacia", logo: "/brands/dacia.svg?v=12" },
    { id: "daewoo", name: "Daewoo", slug: "daewoo", logo: "/brands/daewoo.svg?v=14" },
    { id: "dodge", name: "Dodge", slug: "dodge", logo: "/brands/dodge-brand2.svg", scale: "scale-150" },
    { id: "fiat", name: "Fiat", slug: "fiat", logo: "/brands/fiat.svg?v=12" },
    { id: "ford", name: "Ford", slug: "ford", logo: "/brands/ford.svg?v=12" },
    { id: "honda", name: "Honda", slug: "honda", logo: "/brands/honda.svg?v=12" },
    { id: "hyundai", name: "Hyundai", slug: "hyundai", logo: "/brands/hyundai.svg?v=12" },
    { id: "infiniti", name: "Infiniti", slug: "infiniti", logo: "/brands/infiniti.svg?v=12" },
    { id: "isuzu", name: "Isuzu", slug: "isuzu", logo: "/brands/isuzu.svg?v=12" },
    { id: "iveco", name: "Iveco", slug: "iveco", logo: "/brands/iveco_new.png" },
    { id: "jaguar", name: "Jaguar", slug: "jaguar", logo: "/brands/jaguar.svg?v=17", scale: "scale-150 translate-y-1" },
    { id: "jeep", name: "Jeep", slug: "jeep", logo: "/brands/jeep.svg?v=12" },
    { id: "kia", name: "Kia", slug: "kia", logo: "/brands/kia.svg?v=12" },
    { id: "lada", name: "Lada", slug: "lada", logo: "/brands/lada.svg?v=12" },
    { id: "lancia", name: "Lancia", slug: "lancia", logo: "/brands/lancia_official.png" },
    { id: "land-rover", name: "Land Rover", slug: "land-rover", logo: "/brands/land-rover.svg?v=12" },
    { id: "lexus", name: "Lexus", slug: "lexus", logo: "/brands/lexus.svg?v=12" },
    { id: "mazda", name: "Mazda", slug: "mazda", logo: "/brands/mazda.svg?v=12" },
    { id: "mercedes", name: "Mercedes", slug: "mercedes", logo: "/brands/mercedes.svg?v=12" },
    { id: "mini", name: "Mini", slug: "mini", logo: "/brands/mini.svg?v=12" },
    { id: "mitsubishi", name: "Mitsubishi", slug: "mitsubishi", logo: "/brands/mitsubishi.svg?v=12" },
    { id: "nissan", name: "Nissan", slug: "nissan", logo: "/brands/nissan.svg?v=12" },
    { id: "opel", name: "Opel", slug: "opel", logo: "/brands/opel.svg?v=12" },
    { id: "peugeot", name: "Peugeot", slug: "peugeot", logo: "/brands/peugeot.svg?v=12" },
    { id: "renault", name: "Renault", slug: "renault", logo: "/brands/renault.svg?v=12" },
    { id: "saab", name: "Saab", slug: "saab", logo: "/brands/saab_clean.png" },
    { id: "scania", name: "Scania", slug: "scania", logo: "/brands/scania.svg?v=12" },
    { id: "seat", name: "Seat", slug: "seat", logo: "/brands/seat.svg?v=12" },
    { id: "skoda", name: "Skoda", slug: "skoda", logo: "/brands/skoda.svg?v=12" },
    { id: "smart", name: "Smart", slug: "smart", logo: "/brands/smart.svg?v=12" },
    { id: "subaru", name: "Subaru", slug: "subaru", logo: "/brands/subaru.svg?v=12" },
    { id: "suzuki", name: "Suzuki", slug: "suzuki", logo: "/brands/suzuki.svg?v=12" },
    { id: "toyota", name: "Toyota", slug: "toyota", logo: "/brands/toyota.svg?v=12" },
    { id: "volvo", name: "Volvo", slug: "volvo", logo: "/brands/volvo.svg?v=12" },
    { id: "volkswagen", name: "Volkswagen", slug: "volkswagen", logo: "/brands/volkswagen.svg?v=12" },
    { id: "abarth", name: "Abarth", slug: "abarth", logo: "/brands/abarth.svg" },
    { id: "aston-martin", name: "Aston Martin", slug: "aston-martin", logo: "/brands/aston-martin.svg" },
    { id: "bentley", name: "Bentley", slug: "bentley", logo: "/brands/bentley.svg" },
    { id: "byd", name: "BYD", slug: "byd", logo: "/brands/byd.svg" },
    { id: "cupra", name: "Cupra", slug: "cupra", logo: "/brands/cupra.svg" },
    { id: "ds", name: "DS", slug: "ds", logo: "/brands/ds.svg" },
    { id: "ferrari", name: "Ferrari", slug: "ferrari", logo: "/brands/ferrari.svg" },
    { id: "maserati", name: "Maserati", slug: "maserati", logo: "/brands/maserati.svg" },
    { id: "mg", name: "MG", slug: "mg", logo: "/brands/mg.svg" },
    { id: "porsche", name: "Porsche", slug: "porsche", logo: "/brands/porsche.svg" },
    { id: "ssangyong", name: "SsangYong", slug: "ssangyong", logo: "/brands/ssangyong.svg" },
    { id: "tesla", name: "Tesla", slug: "tesla", logo: "/brands/tesla.svg" },
];

import { vwGroupModels } from './vw-group';
import { asianGroupModels } from './asian-group';
import { frenchGroupModels } from './french-group';
import { otherBrandsModels } from './other-brands';

export const models: Model[] = [
    ...vwGroupModels,
    ...asianGroupModels,
    ...frenchGroupModels,
    ...otherBrandsModels,
];

// End of file
export const getBrandBySlug = (slug: string) => brands.find(b => b.slug === slug);
export const getModelBySlug = (slug: string) => models.find(m => m.slug === slug);

export const getBrandById = (id: string) => brands.find(b => b.id === id);
export const getModelById = (id: string) => models.find(m => m.id === id);
export const getCategoryById = (id: string) => categories.find(c => c.id === id);
export const getSubcategoryById = (id: string) => partsSubcategories.find(s => s.id === id);
export const getPartItemById = (id: string) => partItems.find(p => p.id === id);
export const getModelsByBrand = (brandId: string) => models.filter(m => m.brandId === brandId);

export const getSubcategoriesByCategory = (categoryId: string) => partsSubcategories.filter(s => s.categoryId === categoryId);
export const getPartItemsBySubcategory = (subcategoryId: string) => partItems.filter(p => p.subcategoryId === subcategoryId);
export interface Subcategory {
    id: string;
    categoryId: string;
    name: string;
    slug: string;
}

export interface PartItem {
    id: string;
    subcategoryId: string;
    name: string;
    slug: string;
}
export const getCategoryBySlug = (slug: string) => categories.find(c => c.slug === slug);
export const getProducts = () => []; // Temporarily returning empty as db fetching handles this
