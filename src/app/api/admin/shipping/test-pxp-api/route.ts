import { NextResponse } from "next/server";
import crypto from "crypto";
import { checkRequiredFields, formatPhoneNumber } from "@/lib/shipping/pannon-xp";

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

        const payloadData = {
            hivatkozas: "TESTAPI",
            cimzett_nev: "Erdélyi Péter",
            cimzett_irsz: "1234",
            cimzett_helys: "Budapest",
            cimzett_utca: "Teszt utca 1.",
            cimzett_telefon: "06301234567",
            cimzett_email: "test@test.com",
            utanvet_osszeg: 0,
            csomag: [{ tipus: 'doboz', darab: 1, suly: 5 }]
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
