import { Resend } from 'resend';

const resendSecret = process.env.RESEND_API_KEY;

export const resend = resendSecret ? new Resend(resendSecret) : null;

export const ADMIN_EMAIL = process.env.ADMIN_EMAILS?.split(',')[0] || 'admin@autonexus.hu';

export async function sendOrderReceivedEmail(order: any, customerEmail: string) {
    if (!resend) {
        console.log('Resend API key not found. Email not sent.');
        return;
    }

    const isCard = order.paymentMethod === 'CARD';
    
    const itemsHtml = order.items.map((item: any) => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.part.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity} db</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.priceAtTime.toLocaleString()} Ft</td>
        </tr>
    `).join('');

    try {
        await resend.emails.send({
            from: 'AutoNexus <no-reply@autonexus.hu>',
            to: customerEmail,
            subject: 'Rendelésedet megkaptuk - Ellenőrzés alatt',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; color: #334155;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #f97316; margin-bottom: 10px;">Rendelés fogadva!</h1>
                        <p style="font-size: 16px; color: #64748b;">Rendelési szám: #${order.id.split('-')[0].toUpperCase()}</p>
                    </div>
                    
                    <p>Kedves Vásárlónk!</p>
                    <p>Sikeresen fogadtuk a rendelésedet! Jelenleg munkatársaink <strong>ellenőrzik a kiválasztott termékek minőségét és a készletet</strong>.</p>
                    <p>Amint mindent rendben találtunk, jóváhagyjuk a vásárlást és indítjuk a kiszállítást!</p>
                    
                    <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316; margin: 25px 0;">
                        <h3 style="margin-top: 0; color: #9a3412; font-size: 14px; text-transform: uppercase;">Fizetési információk:</h3>
                        ${isCard 
                            ? `<p style="margin-bottom: 0;">Mivel <strong>bankkártyával</strong> fizettél, az összeget jelenleg csak zároltuk a folyószámládon. A tényleges levonás csak akkor történik meg, ha jóváhagytuk a rendelést. A számlát is akkor fogod megkapni.</p>`
                            : `<p style="margin-bottom: 0;">Mivel <strong>utánvétet</strong> választottál, a fizetés a futárnál történik (készpénz vagy kártya). Elektronikus számládat a sikeres kézbesítés után juttatjuk el hozzád.</p>`
                        }
                    </div>

                    <div style="margin: 30px 0;">
                        <h3 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Rendelés részletei:</h3>
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <thead>
                                <tr style="background-color: #f8fafc;">
                                    <th style="padding: 10px; text-align: left;">Termék</th>
                                    <th style="padding: 10px; text-align: center;">Mennyiség</th>
                                    <th style="padding: 10px; text-align: right;">Ár</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold;">Összesen:</td>
                                    <td style="padding: 15px 10px; text-align: right; font-weight: bold; color: #f97316; font-size: 18px;">${order.totalAmount.toLocaleString()} Ft</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <p style="font-size: 13px; color: #64748b; margin-top: 40px; text-align: center;">
                        Köszönjük, hogy az AutoNexus-t választottad!<br>
                        Hamarosan keresünk a jóváhagyással.
                    </p>
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

    const isCard = order.paymentMethod === 'CARD';

    try {
        await resend.emails.send({
            from: 'AutoNexus <no-reply@autonexus.hu>',
            to: customerEmail,
            subject: 'Rendelésedet jóváhagytuk! - AutoNexus',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; color: #334155;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #10b981; margin-bottom: 10px;">Rendelés jóváhagyva!</h1>
                        <p style="font-size: 16px; color: #64748b;">Rendelési szám: #${order.id.split('-')[0].toUpperCase()}</p>
                    </div>
                    
                    <p>Kedves Vásárlónk!</p>
                    <p>Örömmel értesítünk, hogy a rendelésedet ellenőriztük és <strong>mindent rendben találtunk</strong>, így a vásárlást jóváhagytuk!</p>
                    <p>A kiszállítási folyamat elindult, csomagodat hamarosan átadjuk a PannonXP futárszolgálatnak.</p>
                    
                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 25px 0;">
                        ${isCard 
                            ? `<p style="margin: 0;">A kártyás fizetést véglegesítettük. A számlát az alábbi linken érheted el:</p>`
                            : `<p style="margin: 0;">A csomagodat útnak indítottuk. Fizetés az átvételkor esedékes. A számlát a sikeres kézbesítés után küldjük.</p>`
                        }
                        ${invoiceUrl ? `<a href="${invoiceUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px;">Számla letöltése</a>` : ''}
                    </div>

                    <div style="margin: 30px 0; border: 1px dashed #cbd5e1; padding: 15px; border-radius: 8px;">
                        <h4 style="margin-top: 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Szállítási információk:</h4>
                        <p style="margin-bottom: 5px;"><strong>Szállító:</strong> PannonXP</p>
                        ${order.trackingNumber ? `<p style="margin-bottom: 5px;"><strong>Követési kód:</strong> ${order.trackingNumber}</p>` : ''}
                        <p style="margin-bottom: 0;"><strong>Várható érkezés:</strong> 1-2 munkanap</p>
                    </div>

                    <p style="text-align: center; margin-top: 40px; color: #64748b; font-size: 13px;">
                        Köszönjük a bizalmadat!<br>
                        AutoNexus Csapata
                    </p>
                </div>
            `
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
