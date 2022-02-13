import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    await prisma.productInWarehouse.deleteMany({});
    await prisma.warehouse.deleteMany({});
    await prisma.product.deleteMany({});
    const pizza = await prisma.product.create({
        data: {
            name: "Pizza",
            description: "Tasty Frozen pizza",
        },
    });
    const shoes = await prisma.product.create({
        data: {
            name: "shoes",
            description: "Addidas shoes size 8",
        },
    });
    const tshirt = await prisma.product.create({
        data: {
            name: "T-shirt",
            description: "Green T-shirts size L",
        },
    });

    const w1 = await prisma.warehouse.create({
        data: {
            name: "Joe's warehouse",
            address: "245 Rue Laval, Montreal",
        },
    });
    const w2 = await prisma.warehouse.create({
        data: {
            name: "Jean's warehouse",
            address: "142 Bay Street, Toronto",
        },
    });

    const relation1 = await prisma.productInWarehouse.create({
        data: {
            inStockQuantity: 5,
            product: { connect: { id: pizza.id } },
            warehouse: { connect: { id: w1.id } },
        },
    });
    const relation2 = await prisma.productInWarehouse.create({
        data: {
            inStockQuantity: 100,
            product: { connect: { id: pizza.id } },
            warehouse: { connect: { id: w2.id } },
        },
    });
    const relation3 = await prisma.productInWarehouse.create({
        data: {
            inStockQuantity: 35,
            product: { connect: { id: shoes.id } },
            warehouse: { connect: { id: w2.id } },
        },
    });
    const relation4 = await prisma.productInWarehouse.create({
        data: {
            inStockQuantity: 69,
            product: { connect: { id: tshirt.id } },
            warehouse: { connect: { id: w2.id } },
        },
    });
    const relation5 = await prisma.productInWarehouse.create({
        data: {
            inStockQuantity: 24,
            product: { connect: { id: tshirt.id } },
            warehouse: { connect: { id: w1.id } },
        },
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
