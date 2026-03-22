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

    return NextResponse.json({
        isTest,
        baseUrl,
        ugyfelkod,
        techUser,
        techUserLength: techUser.length,
        techUserChars: techUser.split('').map(c => c.charCodeAt(0)),
        hasEnvUser: !!process.env.PXP_USER,
        rawEnvUser: process.env.PXP_USER === undefined ? 'undefined' : process.env.PXP_USER,
        hasEnvMode: !!process.env.PXP_MODE,
        rawEnvMode: process.env.PXP_MODE === undefined ? 'undefined' : process.env.PXP_MODE,
    });
}
