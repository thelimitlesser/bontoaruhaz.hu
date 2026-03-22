import { NextResponse } from "next/server";
import crypto from "crypto";

const PXP_CONFIG = {
    ugyfelkod: "KSTA",
    technikai_felhasznalo: "UgFxaOn4fxGnzfeU",
    jelszo: "a8Q374fgx8nQgnf4",
    cserekulcs: "XfoqXnfoq3fqyeWc",
};

export async function GET() {
    try {
        const ugyfelkod = (process.env.PXP_UGYFELKOD || PXP_CONFIG.ugyfelkod).trim();
        const techUser = (process.env.PXP_USER || PXP_CONFIG.technikai_felhasznalo).trim();
        const password = (process.env.PXP_PASSWORD || PXP_CONFIG.jelszo).trim();
        const cserekulcs = (process.env.PXP_CSEREKULCS || PXP_CONFIG.cserekulcs).trim();

        const isTest = process.env.PXP_MODE !== 'production';
        const baseUrl = isTest ? 'https://mypxp-test.pannonxp.hu/api/v3' : 'https://mypxp.pannonxp.hu/api/v3';

        function hashPassword(pass: string): string {
            return crypto.createHash('sha512').update(pass).digest('hex').toUpperCase();
        }

        function encryptData(data: any, key: string): string {
            const cipher = crypto.createCipheriv('aes-128-ecb', Buffer.from(key.padEnd(16, '\0').slice(0, 16)), null);
            const buf1 = cipher.update(JSON.stringify(data), 'utf8');
            const buf2 = cipher.final();
            return Buffer.concat([buf1, buf2]).toString('base64');
        }

        const { prisma } = require("@/lib/prisma");
        const order = await prisma.order.findFirst({
            where: { status: 'PENDING' },
            include: { items: { include: { part: true } } },
            orderBy: { createdAt: 'desc' }
        });

        if (!order) return NextResponse.json({ error: "No pending orders found" });

        const pxpAddress = typeof order.shippingAddress === 'string' 
            ? JSON.parse(order.shippingAddress) 
            : order.shippingAddress;
        
        function formatPhoneNumberLocal(phone: string): string {
            if (!phone) return "06300000000";
            let p = phone.replace(/\s+/g, '').replace(/-/g, '');
            if (p.startsWith('+36')) p = p.replace('+36', '06');
            if (p.startsWith('36')) p = '06' + p.substring(2);
            return p;
        }
        
        const customerPhone = pxpAddress.phone ? formatPhoneNumberLocal(pxpAddress.phone) : '06300000000';
        const billingData = typeof order.billingAddress === 'string' 
            ? JSON.parse(order.billingAddress) 
            : order.billingAddress;
        const customerEmail = billingData?.email || 'vevo@email.com';

        let maxPackageWeight = "10";
        let hasRaklap = false;
        
        if (order.items && order.items.length > 0) {
            let totalWeightValue = 0;
            order.items.forEach((item: any) => {
                totalWeightValue += (item.part?.weight || 2) * item.quantity;
                if (item.part?.weight >= 40 || ['komplett-motor', 'valto'].includes(item.part?.subcategorySlug)) {
                    hasRaklap = true;
                }
            });
            maxPackageWeight = Math.max(0.1, totalWeightValue).toString();
        }

        const payloadData: any = {
            hivatkozas: order.id.toString(),
            cimzett_nev: pxpAddress.name || "Vendég",
            cimzett_irsz: pxpAddress.zipCode,
            cimzett_helys: pxpAddress.city,
            cimzett_utca: pxpAddress.street,
            cimzett_telefon: customerPhone,
            cimzett_email: customerEmail,
            utanvet_osszeg: order.paymentMethod === 'COD' ? order.totalAmount : 0,
            csomag: [
                {
                    tipus: hasRaklap ? 'raklap' : 'doboz',
                    darab: 1,
                    suly: maxPackageWeight
                }
            ]
        };

        const pxpData = { "0": payloadData };
        const encryptedRequest = encryptData(pxpData, cserekulcs);

        const body = new URLSearchParams();
        body.append('ugyfelkod', ugyfelkod);
        body.append('technikai_felhasznalo', techUser);
        body.append('jelszo', hashPassword(password));
        body.append('keres', encryptedRequest);

        const requestBodyStr = body.toString();
        
        const response = await fetch(`${baseUrl}/mentes/`, {
            method: 'POST',
            body: requestBodyStr,
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'BontoaruhazXP/1.0',
                'Accept': 'application/json'
            }
        });

        const result = await response.json();

        return NextResponse.json({
            DEBUG: true,
            requestUrl: `${baseUrl}/mentes/`,
            requestBodyStr,
            encryptedRequest,
            pxpData,
            result
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
