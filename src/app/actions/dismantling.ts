'use server';

import { prisma } from"@/lib/prisma";
import { revalidatePath } from"next/cache";
import { redirect } from"next/navigation";

export async function createDonorVehicle(formData: FormData) {
    const rawFormData = {
        vin: formData.get('vin') as string,
        make: formData.get('make') as string,
        model: formData.get('model') as string,
        year: parseInt(formData.get('year') as string),
        engineCode: formData.get('engineCode') as string,
        mileage: parseInt(formData.get('mileage') as string),
        colorCode: formData.get('colorCode') as string,
    };

    if (!rawFormData.vin || !rawFormData.make || !rawFormData.model) {
        throw new Error("Hiányzó kötelező mezők!");
    }

    try {
        await prisma.donorVehicle.create({
            data: {
                vin: rawFormData.vin,
                make: rawFormData.make,
                model: rawFormData.model,
                year: rawFormData.year,
                engineCode: rawFormData.engineCode,
                mileage: rawFormData.mileage,
                colorCode: rawFormData.colorCode,
            }
        });
    } catch (e) {
        console.error(e);
        throw new Error("Hiba történt a jármű rögzítésekor (lehet, hogy az Alvázszám már létezik?)");
    }

    revalidatePath('/admin/dismantling');
    redirect('/admin/dismantling');
}
