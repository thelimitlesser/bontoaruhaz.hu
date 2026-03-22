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
        
        const formatPxpPhone = (phone: string) => {
            if (!phone) return "06300000000";
            const digits = phone.replace(/\D/g, '');
            if (digits.startsWith('36')) return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
            if (digits.startsWith('06')) return `+36 ${digits.slice(2)}`;
            return `+36 ${digits}`;
        };

        const isCOD = order.paymentMethod === 'COD';
        const utanvetAmount = isCOD ? Number(Math.round(order.totalAmount)) : 0;

        const shipmentRequest: any = {
            "0": {
                tipus: 0,
                cimzett: {
                    nev: pxpAddress.name.slice(0, 30),
                    telefon: formatPxpPhone(pxpAddress.phone).slice(0, 20),
                    emailcim: (pxpAddress.email || 'vevo@email.com').slice(0, 50),
                    ceg_nev: (pxpAddress.companyName || pxpAddress.name).slice(0, 50),
                    cim_telepules: pxpAddress.city.slice(0, 40),
                    cim_iranyito: pxpAddress.zipCode.toString().replace(/\D/g, '').padStart(4, '0').slice(0, 4),
                    cim_kozterulet: pxpAddress.street.slice(0, 60),
                    cim_megjegyzes: `Order #${order.id.slice(-6)}`.slice(0, 100)
                },
                szolgaltatas: "24H",
                sms: true,
                csomagok: order.items.reduce((acc: any, item: any, idx: number) => {
                    acc[idx.toString()] = {
                        db: Number(Math.min(item.quantity, 99)),
                        suly: Number((item.part.weight || 2).toFixed(2)),
                        hosszusag: Number(Math.round(item.part.length || 30)),
                        szelesseg: Number(Math.round(item.part.width || 20)),
                        magassag: Number(Math.round(item.part.height || 10)),
                        tipus: (item.part.weight > 40 || item.part.length > 200) ? "raklap" : "doboz"
                    };
                    return acc;
                }, {}),
                tartalom: "Autóalkatrész",
                koltsegviselo: "cimzett",
                maganszemely: true
            }
        };

        if (isCOD) {
            shipmentRequest["0"].utanvet = utanvetAmount;
        }

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
