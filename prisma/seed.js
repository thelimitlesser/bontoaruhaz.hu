const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 0. Cleanup (Optional, but good for re-running)
    // await prisma.orderItem.deleteMany();
    // await prisma.order.deleteMany();
    // await prisma.part.deleteMany();
    // await prisma.donorVehicle.deleteMany();
    // await prisma.storageLocation.deleteMany();

    // 1. Create Admin
    const adminEmail = 'admin@autonexus.com';
    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            fullName: 'Admin User',
            role: 'ADMIN',
            isVerified: 'TRUE',
        },
    });
    console.log('Admin created:', adminUser.email);

    // 2. Create Partner Profile
    const partner = await prisma.partnerProfile.upsert({
        where: { userId: adminUser.id },
        update: {},
        create: {
            userId: adminUser.id,
            businessName: "Bontóáruház Saját",
            returnPolicy: "14 nap visszavásárlási garancia"
        }
    });

    // 3. Create Storage Locations (Upsert to avoid duplicates)
    // Since name is not @unique in schema (it should be probably, but UUID is ID), we'll FindFirst or Create
    let locA1 = await prisma.storageLocation.findFirst({ where: { name: 'A1-SOR-01' } });
    if (!locA1) locA1 = await prisma.storageLocation.create({ data: { name: 'A1-SOR-01', description: 'Motorikus' } });

    let locB2 = await prisma.storageLocation.findFirst({ where: { name: 'B2-SOR-05' } });
    if (!locB2) locB2 = await prisma.storageLocation.create({ data: { name: 'B2-SOR-05', description: 'Karosszéria' } });


    // 4. Create Donor Vehicle
    const donor = await prisma.donorVehicle.upsert({
        where: { vin: 'WBAVNHE900A123456' },
        update: {},
        create: {
            make: 'BMW',
            model: '320d E90',
            year: 2008,
            vin: 'WBAVNHE900A123456',
            engineCode: 'N47D20A',
            mileage: 245000,
            colorCode: 'TITANSILBER'
        }
    });

    // 5. Create Products
    // Check if exists by SKU
    let p1 = await prisma.part.findFirst({ where: { sku: 'KAR-BMW-001' } });
    if (!p1) {
        p1 = await prisma.part.create({
            data: {
                name: 'BMW E90 Bal Első Sárvédő',
                sku: 'KAR-BMW-001',
                priceGross: 25000,
                priceNet: 19685,
                oemNumbers: '41357135679',
                condition: 'USED',
                stock: 1,
                partnerId: partner.id,
                images: '',
                tecdocKTypes: '' // Added missing field
            }
        });
    }

    let p2 = await prisma.part.findFirst({ where: { sku: 'MOT-BMW-002' } });
    if (!p2) {
        p2 = await prisma.part.create({
            data: {
                name: 'BMW E90 High Pressure Pump',
                sku: 'MOT-BMW-002',
                priceGross: 45000,
                priceNet: 35433,
                oemNumbers: '13517805358',
                condition: 'USED',
                stock: 1,
                partnerId: partner.id,
                images: '',
                tecdocKTypes: '' // Added missing field
            }
        });
    }

    // 6. Create Customer & Order
    const customerEmail = 'vevo@example.com';
    const customer = await prisma.user.upsert({
        where: { email: customerEmail },
        update: {},
        create: {
            email: customerEmail,
            fullName: 'Kovács János',
            role: 'CUSTOMER',
        }
    });

    // Order 1: PENDING (Create always for demo, or limit)
    await prisma.order.create({
        data: {
            userId: customer.id,
            status: 'PENDING',
            totalAmount: 25000,
            shippingAddress: JSON.stringify({ name: 'Kovács János', city: 'Budapest', zip: '1111', street: 'Fő utca 1.' }),
            billingAddress: JSON.stringify({ name: 'Kovács János', city: 'Budapest', zip: '1111', street: 'Fő utca 1.' }),
            items: {
                create: [
                    { partId: p1.id, quantity: 1, priceAtTime: 25000 }
                ]
            }
        }
    });

    // Order 2: SHIPPED
    await prisma.order.create({
        data: {
            userId: customer.id,
            status: 'SHIPPED',
            totalAmount: 45000,
            shippingAddress: JSON.stringify({ name: 'Kovács János', city: 'Pécs', zip: '7600', street: 'Király u. 12.' }),
            billingAddress: JSON.stringify({ name: 'Kovács János', city: 'Pécs', zip: '7600', street: 'Király u. 12.' }),
            items: {
                create: [
                    { partId: p2.id, quantity: 1, priceAtTime: 45000 }
                ]
            }
        }
    });

    console.log('Seed completed successfully');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
