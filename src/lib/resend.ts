import { Resend } from 'resend';

const resendSecret = process.env.RESEND_API_KEY;
export const resend = resendSecret ? new Resend(resendSecret) : null;

const COMPANY_PHONE = "+36 70 612 1277";
const COMPANY_EMAIL = "info@bontoaruhaz.hu";
const OWNER_NAME = "Jerzsele Tamás";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bontoaruhaz.hu";

const COLORS = {
    primary: "#f97316", // Orange
    secondary: "#334155", // Slate
    bg: "#f8fafc",
    text: "#334155",
    textLight: "#64748b",
    success: "#10b981",
    warning: "#f59e0b",
    blue: "#2563eb",
    white: "#ffffff",
    border: "#e2e8f0"
};

/**
 * Common HTML Header & Style
 */
const getEmailHeader = (title: string, iconColor: string = COLORS.primary) => `
    <!DOCTYPE html>
    <html lang="hu">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${COLORS.bg}; color: ${COLORS.text};">
        <div style="max-width: 600px; margin: 20px auto; background: ${COLORS.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid ${COLORS.border};">
            <div style="background-color: ${COLORS.secondary}; padding: 25px; text-align: center;">
                <h1 style="color: ${COLORS.white}; margin: 0; font-size: 22px; letter-spacing: 1px;"><span style="color: ${COLORS.primary};">BONTÓ</span>ÁRUHÁZ</h1>
                <p style="color: ${COLORS.textLight}; margin-top: 4px; font-size: 13px;">Minőségi bontott alkatrészek</p>
            </div>
            <div style="padding: 30px;">
`;

/**
 * Common HTML Footer & Signature
 */
const getEmailFooter = () => `
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid ${COLORS.border};">
                    <p style="margin: 0; font-weight: bold; font-size: 15px;">Üdvözlettel,</p>
                    <p style="margin: 4px 0 0 0; font-size: 16px; color: ${COLORS.primary}; font-weight: bold;">${OWNER_NAME}</p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; color: ${COLORS.textLight};">Bontóáruház</p>
                    
                    <div style="margin-top: 15px; font-size: 13px; color: ${COLORS.textLight}; line-height: 1.5;">
                        <p style="margin: 0;">📞 ${COMPANY_PHONE}</p>
                        <p style="margin: 0;">✉️ ${COMPANY_EMAIL}</p>
                        <p style="margin: 0;">📍 8111 Seregélyes-Jánosmajor</p>
                    </div>
                </div>
            </div>
            <div style="background-color: ${COLORS.bg}; padding: 15px; text-align: center; font-size: 11px; color: ${COLORS.textLight};">
                <p>© ${new Date().getFullYear()} Bontóáruház. Minden jog fenntartva.</p>
            </div>
        </div>
    </body>
    </html>
`;

/**
 * Items Table Component
 */
const getItemsTableHtml = (items: any[], total: number, shippingCost: number = 0) => {
    const rows = items.map((item: any) => `
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid ${COLORS.border};">
                <p style="margin: 0; font-weight: bold; color: ${COLORS.text};">${item.part.name}</p>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid ${COLORS.border}; text-align: center; white-space: nowrap;">${item.quantity} db</td>
            <td style="padding: 10px 0; border-bottom: 1px solid ${COLORS.border}; text-align: right; font-weight: bold; white-space: nowrap;">${item.priceAtTime.toLocaleString('hu-HU')} Ft</td>
        </tr>
    `).join('');

    let footerRows = "";
    
    if (shippingCost > 0) {
        footerRows += `
            <tr>
                <td colspan="2" style="padding: 10px 0; text-align: right; color: ${COLORS.textLight}; font-size: 14px;">Szállítási díj:</td>
                <td style="padding: 10px 0; text-align: right; color: ${COLORS.text}; font-size: 14px; white-space: nowrap;">${shippingCost.toLocaleString('hu-HU')} Ft</td>
            </tr>
        `;
    }

    footerRows += `
        <tr>
            <td colspan="2" style="padding: 15px 0; text-align: right; font-weight: bold; white-space: nowrap;">Összesen:</td>
            <td style="padding: 15px 0; text-align: right; font-weight: bold; font-size: 18px; color: ${COLORS.primary}; white-space: nowrap;">${total.toLocaleString('hu-HU')} Ft</td>
        </tr>
    `;

    return `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="text-align: left; font-size: 11px; color: ${COLORS.textLight}; text-transform: uppercase;">
                    <th style="padding-bottom: 8px;">Termék</th>
                    <th style="padding-bottom: 8px; text-align: center;">Db</th>
                    <th style="padding-bottom: 8px; text-align: right;">Ár</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
            <tfoot>
                ${footerRows}
            </tfoot>
        </table>
    `;
};

/**
 * EMAIL 1: Order Received
 */
export async function sendOrderReceivedEmail(order: any, customerEmail: string) {
    if (!resend) return;

    const billingData = typeof order.billingAddress === 'string' ? JSON.parse(order.billingAddress) : order.billingAddress;
    const isStripe = order.paymentMethod === 'CARD';
    const isPickup = order.shippingMethod === 'PICKUP';
    
    const subject = `Rendelés visszaigazolás: #${order.id.split('-')[0].toUpperCase()}`;
    
    let specialMessage = "";
    if (isStripe) {
        specialMessage = `
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid ${COLORS.border}; margin: 25px 0;">
                <p style="margin: 0; font-size: 15px; line-height: 1.6;">
                    <strong>Bankkártyás fizetés:</strong> A kártyás összeget jelenleg csak <strong>zárolta a bank</strong> a számláján. A tényleges levonás csak a minőségi ellenőrzés és a rendelés jóváhagyása után történik meg.
                </p>
            </div>
        `;
    } else if (isPickup) {
        specialMessage = `
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid ${COLORS.border}; margin: 25px 0;">
                <p style="margin: 0; font-size: 15px; line-height: 1.6;">
                    <strong>Személyes átvétel:</strong> Kérjük, vegye fel velünk a kapcsolatot a <strong>${COMPANY_PHONE}</strong> számon, hogy egyeztesse, mikor szeretné átvenni a terméket.
                </p>
                <div style="margin-top: 15px;">
                    <a href="https://www.google.com/maps/dir/?api=1&destination=8111+Seregélyes-Jánosmajor" style="background-color: ${COLORS.secondary}; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block;">
                        Navigáció a telephelyre →
                    </a>
                </div>
            </div>
        `;
    }

    const html = `
        ${getEmailHeader(subject)}
        <h2 style="margin-top: 0; font-size: 20px;">Kedves ${billingData.firstName || billingData.name}!</h2>
        <p style="font-size: 16px; line-height: 1.6;">
            Köszönjük rendelését! Sikeresen rögzítettük és megkezdtük a termék minőségi ellenőrzését.
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
            Amint mindent rendben találunk, jóváhagyjuk a rendelését és értesítjük ${isPickup ? 'az átvételi információkról' : 'a szállításról'}.
        </p>

        ${specialMessage}

        <h3 style="font-size: 14px; color: ${COLORS.textLight}; text-transform: uppercase;">Rendelt termékek:</h3>
        ${getItemsTableHtml(order.items, order.totalAmount, order.shippingCost)}

        ${getEmailFooter()}
    `;

    try {
        await resend.emails.send({
            from: 'Bontóáruház <info@bontoaruhaz.hu>',
            to: customerEmail,
            subject,
            html,
            headers: {
                "X-Entity-Ref-ID": order.id,
            }
        });
    } catch (error) {
        console.error('Error sending OrderReceived email:', error);
    }
}

/**
 * EMAIL 2: Order Confirmed / Shipping
 */
export async function sendOrderConfirmedEmail(order: any, customerEmail: string, invoiceUrl?: string) {
    if (!resend) return;

    const billingData = typeof order.billingAddress === 'string' ? JSON.parse(order.billingAddress) : order.billingAddress;
    
    const subject = `Rendelését jóváhagytuk: #${order.id.split('-')[0].toUpperCase()}`;

    const html = `
        ${getEmailHeader(subject, COLORS.success)}
        <h2 style="margin-top: 0; font-size: 20px; color: ${COLORS.success};">Kedves ${billingData.firstName || billingData.name}!</h2>
        <p style="font-size: 16px; line-height: 1.6;">
            Rendelését jóváhagytuk, megkezdtük az előkészítést és a csomagját hamarosan átadjuk a futárszolgálatnak.
        </p>

        ${order.trackingNumber ? `
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid ${COLORS.border}; margin: 25px 0; text-align: center;">
                <p style="margin-top: 0; font-size: 12px; color: ${COLORS.textLight}; text-transform: uppercase;">Szállító: PannonXP</p>
                <p style="font-size: 18px; margin: 5px 0; font-weight: bold;">${order.trackingNumber}</p>
                <a href="https://mypxp.pannonxp.hu/kereses?v=${order.trackingNumber}" style="display: inline-block; background-color: ${COLORS.primary}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">
                    Csomag nyomonkövetése →
                </a>
            </div>
        ` : ''}

        ${invoiceUrl ? `
            <div style="margin: 30px 0; text-align: center;">
                <a href="${invoiceUrl}" style="display: inline-block; background-color: ${COLORS.blue}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    Elektronikus számla letöltése
                </a>
            </div>
        ` : ''}

        <h3 style="font-size: 14px; color: ${COLORS.textLight}; text-transform: uppercase;">Rendelés összesítő:</h3>
        ${getItemsTableHtml(order.items, order.totalAmount, order.shippingCost)}
        
        ${getEmailFooter()}
    `;

    try {
        await resend.emails.send({
            from: 'Bontóáruház <info@bontoaruhaz.hu>',
            to: customerEmail,
            subject,
            html,
            headers: {
                "X-Entity-Ref-ID": order.id,
            }
        });
    } catch (error) {
        console.error('Error sending OrderConfirmed email:', error);
    }
}

/**
 * EMAIL 3: Ready for Pickup
 */
export async function sendOrderReadyForPickupEmail(order: any, customerEmail: string) {
    if (!resend) return;

    const billingData = typeof order.billingAddress === 'string' ? JSON.parse(order.billingAddress) : order.billingAddress;
    const subject = `Rendelése átvehető: #${order.id.split('-')[0].toUpperCase()}`;

    const html = `
        ${getEmailHeader(subject, COLORS.warning)}
        <h2 style="margin-top: 0; font-size: 20px;">Kedves ${billingData.firstName || billingData.name}!</h2>
        <p style="font-size: 16px; line-height: 1.6;">
            Rendelését jóváhagytuk, az alkatrész átvehető! 
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: ${COLORS.primary}; font-weight: bold;">
            Kérjük, hívjon minket a ${COMPANY_PHONE} számon az átvétel pontosításához.
        </p>

        <div style="background-color: #fffbeb; padding: 20px; border-radius: 12px; border: 1px solid #fef3c7; margin: 25px 0;">
            <p style="margin: 0; font-size: 14px; font-weight: bold;">Átvételi pont:</p>
            <p style="margin: 5px 0; font-size: 14px;">8111 Seregélyes-Jánosmajor</p>
            <p style="margin: 2px 0; font-size: 13px; color: ${COLORS.textLight};">Hétfő - Péntek: 08:00 - 17:00</p>
            <p style="margin: 10px 0 0 0; font-size: 14px;"><strong>Fizetés a helyszínen:</strong> Készpénz vagy azonnali banki átutalás.</p>
            <a href="https://www.google.com/maps/dir/?api=1&destination=8111+Seregélyes-Jánosmajor" style="color: ${COLORS.primary}; font-weight: bold; font-size: 13px; text-decoration: underline; margin-top: 10px; display: inline-block;">Útvonaltervezés →</a>
        </div>

        ${getItemsTableHtml(order.items, order.totalAmount, order.shippingCost)}
        ${getEmailFooter()}
    `;

    try {
        await resend.emails.send({
            from: 'Bontóáruház <info@bontoaruhaz.hu>',
            to: customerEmail,
            subject,
            html
        });
    } catch (error) {
        console.error('Error sending ReadyForPickup email:', error);
    }
}

/**
 * EMAIL 4: Manual Invoice / Pickup Final
 */
export async function sendOrderManualInvoiceEmail(order: any, customerEmail: string, invoiceUrl: string) {
    if (!resend) return;

    const billingData = typeof order.billingAddress === 'string' ? JSON.parse(order.billingAddress) : order.billingAddress;
    const subject = `Számla a rendeléséről: #${order.id.split('-')[0].toUpperCase()}`;

    const html = `
        ${getEmailHeader(subject, COLORS.success)}
        <h2 style="margin-top: 0; font-size: 20px;">Kedves ${billingData.firstName || billingData.name}!</h2>
        <p style="font-size: 16px; line-height: 1.6;">
            Köszönjük a vásárlást! Mellékelten küldjük a vásárlásáról kiállított elektronikus számlát.
        </p>

        <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid ${COLORS.border}; text-align: center; margin: 30px 0;">
            <p style="margin-top: 0; color: ${COLORS.textLight}; font-size: 14px;">A számla letöltéséhez kattintson az alábbi gombra:</p>
            <a href="${invoiceUrl}" style="display: inline-block; background-color: ${COLORS.blue}; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">
                Számla letöltése (PDF)
            </a>
        </div>

        <div style="margin: 30px 0; border-top: 1px solid ${COLORS.border}; pt-20px;">
            <p style="font-size: 14px; color: ${COLORS.textLight};">
                <strong>Rendelés összege:</strong> ${order.totalAmount.toLocaleString('hu-HU')} Ft
            </p>
        </div>
        ${getEmailFooter()}
    `;

    try {
        await resend.emails.send({
            from: 'Bontóáruház <info@bontoaruhaz.hu>',
            to: customerEmail,
            subject,
            html
        });
    } catch (error) {
        console.error('Error sending ManualInvoice email:', error);
    }
}
