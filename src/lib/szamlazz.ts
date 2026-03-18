const szamlazz = require('szamlazz.js');

const szamlazzUser = process.env.SZAMLAZZ_USER;
const szamlazzPass = process.env.SZAMLAZZ_PASS;

export const szamlazzClient = szamlazzUser && szamlazzPass 
    ? new szamlazz.Client({
        user: szamlazzUser,
        password: szamlazzPass,
        eInvoice: true, // Use e-invoice by default if possible
        requestInvoiceDownload: true, // We want the PDF
    }) 
    : null;

export async function createInvoiceForOrder(order: any, customerData: any) {
    if (!szamlazzClient) {
        console.log('Számlázz.hu credentials not found. Invoice not created.');
        return null;
    }

    try {
        const seller = new szamlazz.Seller({
            bank: {
                name: 'OTP Bank',
                accountNumber: '11700000-00000000-00000000' // Placeholder, update in .env
            },
            email: {
                replyToAddress: 'info@autonexus.hu'
            }
        });

        const buyer = new szamlazz.Buyer({
            name: customerData.companyName || `${customerData.lastName} ${customerData.firstName}`,
            email: customerData.email,
            sendEmail: true,
            address: {
                postalCode: customerData.billingPostalCode || customerData.postalCode,
                city: customerData.billingCity || customerData.city,
                address: customerData.billingAddress || customerData.address
            },
            taxNumber: customerData.taxNumber || ''
        });

        const items = order.items.map((item: any) => new szamlazz.Item({
            label: item.part.name,
            quantity: item.quantity,
            unit: 'db',
            vat: 27, // 27% VAT default
            netUnitPrice: Math.round(item.priceAtTime / 1.27)
        }));

        // Add shipping if applicable
        if (order.totalAmount > order.items.reduce((acc: number, i: any) => acc + i.priceAtTime * i.quantity, 0)) {
            const shippingCost = order.totalAmount - order.items.reduce((acc: number, i: any) => acc + i.priceAtTime * i.quantity, 0);
            items.push(new szamlazz.Item({
                label: 'Szállítási díj',
                quantity: 1,
                unit: 'szolg',
                vat: 27,
                netUnitPrice: Math.round(shippingCost / 1.27)
            }));
        }

        const invoice = new szamlazz.Invoice({
            paymentMethod: szamlazz.PaymentMethod.Bankcard, // Default to card
            currency: szamlazz.Currency.HUF,
            language: szamlazz.Language.Hungarian,
            seller,
            buyer,
            items
        });

        const result = await szamlazzClient.issueInvoice(invoice);
        
        if (result.success) {
            return {
                invoiceId: result.invoiceId,
                pdfUrl: result.pdfUrl || ''
            };
        } else {
            console.error('Invoicing failed:', result.errorMessage);
            return null;
        }
    } catch (error) {
        console.error('Error issuing invoice:', error);
        return null;
    }
}
