export const revalidate = 3600;

import { NextResponse } from 'next/server';
import { getModelsByBrandAction, getActivePartOptionsAction } from '@/app/actions/vehicle';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const brandId = searchParams.get('brandId');
    const modelId = searchParams.get('modelId');

    try {
        if (type === 'models' && brandId) {
            const models = await getModelsByBrandAction(brandId);
            return NextResponse.json(models);
        }

        if (type === 'parts') {
            const parts = await getActivePartOptionsAction(brandId || undefined, modelId || undefined);
            return NextResponse.json(parts);
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error) {
        console.error('API Error fetching vehicle options:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
