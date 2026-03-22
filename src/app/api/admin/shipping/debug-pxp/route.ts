import { NextResponse } from "next/server";

const PXP_CONFIG = {
    ugyfelkod: process.env.PXP_UGYFELKOD || "KSTA",
    technikai_felhasznalo: process.env.PXP_USER || "UgFxaOn4fxGnzfeU",
    jelszo: process.env.PXP_PASSWORD || "a8Q374fgx8nQgnf4",
    cserekulcs: process.env.PXP_CSEREKULCS || "XfoqXnfoq3fqyeWc",
};

export async function GET() {
    const isTest = process.env.PXP_MODE !== 'production';
    const baseUrl = isTest ? 'https://mypxp-test.pannonxp.hu/api/v3' : 'https://mypxp.pannonxp.hu/api/v3';

    const ugyfelkod = (process.env.PXP_UGYFELKOD || PXP_CONFIG.ugyfelkod).trim();
    const techUser = (process.env.PXP_USER || PXP_CONFIG.technikai_felhasznalo).trim();
    const password = (process.env.PXP_PASSWORD || PXP_CONFIG.jelszo).trim();
    const cserekulcs = (process.env.PXP_CSEREKULCS || PXP_CONFIG.cserekulcs).trim();

    const dataToEncrypt = { hello: "world", letters: "áéíóöőúüű" };
    function encryptData(data: any, key: string): string {
        try {
            const crypto = require('crypto');
            const cipher = crypto.createCipheriv('aes-128-ecb', Buffer.from(key.padEnd(16, '\0').slice(0, 16)), null);
            const buf1 = cipher.update(JSON.stringify(data), 'utf8');
            const buf2 = cipher.final();
            return Buffer.concat([buf1, buf2]).toString('base64');
        } catch (e: any) {
            return `ERROR: ${e.message}`;
        }
    }

    const testEncrypted = encryptData(dataToEncrypt, cserekulcs);

    return NextResponse.json({
        isTest,
        baseUrl,
        ugyfelkod,
        techUser,
        cserekulcs,
        testEncrypted,
        hasEnvUser: !!process.env.PXP_USER,
        rawEnvUser: process.env.PXP_USER === undefined ? 'undefined' : process.env.PXP_USER,
        hasEnvMode: !!process.env.PXP_MODE,
        rawEnvMode: process.env.PXP_MODE === undefined ? 'undefined' : process.env.PXP_MODE,
    });
}
