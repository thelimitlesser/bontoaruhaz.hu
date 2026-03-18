import { Resend } from 'resend';

const resendSecret = process.env.RESEND_API_KEY;

export const resend = resendSecret ? new Resend(resendSecret) : null;

export const ADMIN_EMAIL = process.env.ADMIN_EMAILS?.split(',')[0] || 'admin@autonexus.hu';

export async function sendOrderReceivedEmail(order: any, customerEmail: string) {
    if (!resend) {
        console.log('Resend API key not found. Email not sent.');
        return;
    }

    try {
        await resend.emails.send({
            from: 'AutoNexus <no-reply@autonexus.hu>',
            to: customerEmail,
            subject: 'Rendelésedet megkaptuk - AutoNexus',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 12px;">
                    <h1 style="color: #f97316;">Rendelés fogadva!</h1>
                    <p>Kedves Vásárlónk!</p>
                    <p>Sikeresen fogadtuk a rendelésedet (#${order.id.split('-')[0]}).</p>
                    <p>Munkatársunk hamarosan ellenőrzi a készletet és a szállítási részleteket. Amint jóváhagytuk a rendelést, küldünk egy visszaigazoló e-mailt a számlával együtt.</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Rendelés összesítése:</h3>
                        <p>Végösszeg: <strong>${order.totalAmount.toLocaleString()} Ft</strong></p>
                    </div>
                    <p>Köszönjük, hogy az AutoNexus-t választottad!</p>
                </div>
            `
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

export async function sendOrderConfirmedEmail(order: any, customerEmail: string, invoiceUrl?: string) {
    if (!resend) {
        console.log('Resend API key not found. Email not sent.');
        return;
    }

    try {
        await resend.emails.send({
            from: 'AutoNexus <no-reply@autonexus.hu>',
            to: customerEmail,
            subject: 'Rendelésedet jóváhagytuk! - AutoNexus',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 12px;">
                    <h1 style="color: #10b981;">Rendelés jóváhagyva!</h1>
                    <p>Kedves Vásárlónk!</p>
                    <p>Örömmel értesítünk, hogy a rendelésedet (#${order.id.split('-')[0]}) jóváhagytuk és elindítottuk a szállítási folyamatot.</p>
                    <p>A számlát csatolva találod, vagy letöltheted az alábbi linken:</p>
                    ${invoiceUrl ? `<a href="${invoiceUrl}" style="display: inline-block; background-color: #f97316; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-bold: true;">Számla letöltése</a>` : '<p>A számlát hamarosan külön e-mailben is megkapod.</p>'}
                    <p>Várható szállítás: 1-2 munkanap.</p>
                    <p>Köszönjük a vásárlást!</p>
                </div>
            `
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
