export interface Product {
    id: string;
    name: string;
    price: number;
    currency: string;
    image: string;
    condition: 'Új' | 'Használt' | 'Felújított';
    brand: string;
    model: string;
    sku: string;
    quantity: number;
    shippingPrice?: number | null;
    weight?: number | null;
    length?: number | null;
    width?: number | null;
    height?: number | null;
}

export const mockProducts: Product[] = [
    {
        id: '1',
        name: 'VW Golf VII Bal Első Fényszóró (LED)',
        price: 45000,
        currency: 'HUF',
        image: '/part-headlight.png',
        condition: 'Használt',
        brand: 'Volkswagen',
        model: 'Golf VII',
        sku: 'VW-5G1941005',
        quantity: 4
    },
    {
        id: '2',
        name: 'BMW E46 320d Generátor (150A)',
        price: 28900,
        currency: 'HUF',
        image: '/part-turbo.png',
        condition: 'Felújított',
        brand: 'BMW',
        model: '3 Series (E46)',
        sku: 'BMW-12317789981',
        quantity: 1
    },
    {
        id: '3',
        name: 'Audi A4 B8 Első Lökhárító Héj',
        price: 65000,
        currency: 'HUF',
        image: '/part-brake.png',
        condition: 'Használt',
        brand: 'Audi',
        model: 'A4 (B8)',
        sku: 'AUD-8K0807065',
        quantity: 2
    },
    {
        id: '4',
        name: 'Opel Astra K Turbófeltöltő (1.6 CDTI)',
        price: 110000,
        currency: 'HUF',
        image: '/part-turbo.png',
        condition: 'Új',
        brand: 'Opel',
        model: 'Astra K',
        sku: 'OPE-55574334',
        quantity: 5
    },
    {
        id: '5',
        name: 'Sport Kipufogó Rendszer (Univerzális)',
        price: 124990,
        currency: 'HUF',
        image: '/part-exhaust.png',
        condition: 'Új',
        brand: 'Akrapovič',
        model: 'Universal',
        sku: 'EXH-99-SPORT',
        quantity: 10
    },
    {
        id: '6',
        name: 'Ford Focus MK3 Jobb Hátsó Lámpa',
        price: 22000,
        currency: 'HUF',
        image: 'https://placehold.co/600x400/1a1a1a/red?text=Ford+Taillight',
        condition: 'Használt',
        brand: 'Ford',
        model: 'Focus MK3',
        sku: 'FOR-1708812',
        quantity: 1
    },
    {
        id: '7',
        name: 'Mercedes W205 C-Class Hűtőrács (Diamond)',
        price: 55000,
        currency: 'HUF',
        image: 'https://placehold.co/600x400/1a1a1a/silver?text=Merc+Grille',
        condition: 'Új',
        brand: 'Mercedes-Benz',
        model: 'C-Class (W205)',
        sku: 'MER-A2058800383',
        quantity: 3
    }
];
