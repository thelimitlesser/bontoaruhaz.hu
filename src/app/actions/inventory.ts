'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createStorageLocation(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name) {
        throw new Error("Hiányzó név!");
    }

    try {
        await prisma.storageLocation.create({
            data: {
                name,
                description,
            }
        });
    } catch (e) {
        throw new Error("Hiba a raktárhely létrehozásakor.");
    }

    revalidatePath('/admin/inventory');
    redirect('/admin/inventory');
}
