
const BILLINGO_BASE_URL = 'https://api.billingo.hu/v3';

export interface BillingoPartner {
    id?: number;
    name: string;
    address: {
        country_code: string;
        post_code: string;
        city: string;
        address: string;
    };
    emails: string[];
    taxcode?: string;
    phone?: string;
}

export interface BillingoDocumentItem {
    name: string;
    unit_price: number;
    unit_price_type: 'net' | 'gross';
    quantity: number;
    unit: string;
    vat: string; // e.g., "27%"
}

/**
 * Get or create a partner in Billingo by email or tax number.
 */
async function upsertPartner(customerData: any) {
    const apiKey = process.env.BILLINGO_API_KEY;
    if (!apiKey) throw new Error("BILLINGO_API_KEY hiányzik");

    const email = customerData.email;

    const partnerData: any = {
        name: customerData.name || `${customerData.lastName || ''} ${customerData.firstName || ''}`.trim() || customerData.companyName || 'Névtelen Vevő',
        address: {
            country_code: 'HU',
            post_code: String(customerData.billingPostalCode || customerData.postalCode || customerData.zip || '1000'),
            city: String(customerData.billingCity || customerData.city || 'Budapest'),
            address: String(customerData.billingAddress || customerData.address || customerData.street || '')
        },
        emails: [email],
        phone: customerData.phone || customerData.phoneNumber || undefined,
        taxcode: undefined
    };

    // Directly create partner (Billingo v3 API handles duplicates or creates unique document partners)
    const res = await fetch(`${BILLINGO_BASE_URL}/partners`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': apiKey
        },
        body: JSON.stringify(partnerData)
    });

    const data = await res.json();
    if (!res.ok) {
        console.error("Billingo Partner Creation Error Details:", JSON.stringify(data));
        // If partner endpoint is restricted, throw clean error
        if (data.error?.message?.includes("subscription") || data.message?.includes("subscription")) {
            throw new Error(`Billingo API hiba (Partner létrehozás): Kérjük ellenőrizd az API kulcs jogosultságait a Billingo fiókodban.`);
        }
        throw new Error(`Billingo partner hiba: ${data.error?.message || data.message || JSON.stringify(data)}`);
    }

    return data.id;
}

export async function createBillingoInvoice(order: any, customerData: any) {
    const apiKey = process.env.BILLINGO_API_KEY;
    if (!apiKey || apiKey === '') {
        console.warn('Billingo API key not found. Invoice not created.');
        return null;
    }

    try {
        // 1. Prepare inline partner and items (no separate partner lookup required)
        const items: BillingoDocumentItem[] = order.items.map((item: any) => ({
            name: item.productName || item.part.name,
            unit_price: item.priceAtTime,
            unit_price_type: 'gross',
            quantity: item.quantity,
            unit: 'db',
            vat: 'AAM'
        }));

        const subtotal = order.items.reduce((acc: number, i: any) => acc + i.priceAtTime * i.quantity, 0);
        if (order.totalAmount > subtotal) {
            items.push({
                name: 'Szállítási díj',
                unit_price: order.totalAmount - subtotal,
                unit_price_type: 'gross',
                quantity: 1,
                unit: 'szolg',
                vat: 'AAM'
            });
        }

        // Determine payment method and rounding
        let billingoPaymentMethod = 'cash_on_delivery';
        let shouldRound = true;

        if (order.paymentMethod === 'CARD') {
            billingoPaymentMethod = 'online_bankcard';
            shouldRound = false;
        } else if (order.shippingMethod === 'PICKUP') {
            billingoPaymentMethod = 'cash';
            shouldRound = true;
        }

        const partnerData: any = {
            name: customerData.name || `${customerData.lastName || ''} ${customerData.firstName || ''}`.trim() || customerData.companyName || 'Névtelen Vevő',
            address: {
                country_code: 'HU',
                post_code: String(customerData.billingPostalCode || customerData.postalCode || customerData.zip || '1000'),
                city: String(customerData.billingCity || customerData.city || 'Budapest'),
                address: String(customerData.billingAddress || customerData.address || customerData.street || '')
            },
            emails: [customerData.email],
            phone: customerData.phone || customerData.phoneNumber || undefined,
            type: 'person'
        };

        const documentData = {
            partner: partnerData,
            block_id: 0,
            type: 'invoice',
            fulfillment_date: new Date().toISOString().split('T')[0],
            due_date: new Date().toISOString().split('T')[0],
            payment_method: billingoPaymentMethod,
            currency: 'HUF',
            conversion_rate: 1,
            language: 'hu',
            items: items,
            paid: true,
            settings: {
                mediated_service: false,
                without_financial_fulfillment: false,
                online_payment: false, 
                round: shouldRound ? 'five' : 'none'
            }
        };

        const res = await fetch(`${BILLINGO_BASE_URL}/documents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey
            },
            body: JSON.stringify(documentData)
        });

        const result = await res.json();
        if (!res.ok) {
            console.error("Billingo Document Creation Error Details:", JSON.stringify(result));
            throw new Error(`Billingo számla hiba: ${result.error?.message || result.message || JSON.stringify(result)}`);
        }

        // 3. Get public URL (Billingo v3 creates document first, then you can get its public link)
        let publicUrl = '';
        try {
            const urlRes = await fetch(`${BILLINGO_BASE_URL}/documents/${result.id}/public-url`, {
                method: 'GET',
                headers: {
                    'X-API-KEY': apiKey
                }
            });
            if (urlRes.ok) {
                const urlData = await urlRes.json();
                publicUrl = urlData.public_url || '';
            }
        } catch (err) {
            console.error("Hiba a Billingo publikus URL lekérésekor:", err);
        }

        return {
            invoiceId: String(result.id),
            pdfUrl: publicUrl
        };

    } catch (error: any) {
        const errorMsg = error.message || String(error);
        console.error('CRITICAL ERROR issuing Billingo invoice:', errorMsg);
        return { error: errorMsg };
    }
}
