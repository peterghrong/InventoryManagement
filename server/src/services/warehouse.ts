import { Product, Warehouse } from "@prisma/client";
import { prisma } from "../server";

export default class WarehouseService {
    static async getAll() {
        const warehouses: Warehouse[] = await prisma.warehouse.findMany();
        return warehouses;
    }
    static async getWarehouse(id: number) {
        const warehouse: Warehouse | null = await prisma.warehouse.findFirst({
            where: {
                id: id,
            },
        });
        return warehouse;
    }

    static async create(name: string, address: string) {
        const warehouse: Warehouse = await prisma.warehouse.create({
            data: {
                name: name,
                address: address,
            },
        });
        return warehouse;
    }

    static async update(id: number, name: string, address: string) {
        const warehouse: Warehouse = await prisma.warehouse.update({
            where: { id: id },
            data: {
                name: name,
                address: address,
            },
        });
        return warehouse;
    }

    static async getProductsInWarehouse(warehouse_id: number) {
        const productInWarehouse = await prisma.productInWarehouse.findMany({
            where: { warehouseId: warehouse_id },
            select: {
                inStockQuantity: true,
                backOrderQuantity: true,
                product: true,
            },
        });
        return productInWarehouse;
    }

    static async orderProduct(
        product_id: number,
        warehouse_id: number,
        quantity: number
    ) {
        const productInWarehouse = await prisma.productInWarehouse.findUnique({
            where: {
                productId_warehouseId: {
                    productId: product_id,
                    warehouseId: warehouse_id,
                },
            },
        });
        if (productInWarehouse == null) {
            await prisma.productInWarehouse.create({
                data: {
                    product: {
                        connect: {
                            id: product_id,
                        },
                    },
                    warehouse: {
                        connect: {
                            id: warehouse_id,
                        },
                    },
                },
            });
        }
        const backOrderQuantity: number =
            productInWarehouse == null
                ? 0
                : productInWarehouse.backOrderQuantity;

        const orderedProduct = await prisma.productInWarehouse.update({
            where: {
                productId_warehouseId: {
                    productId: product_id,
                    warehouseId: warehouse_id,
                },
            },
            data: {
                backOrderQuantity: backOrderQuantity + quantity,
            },
        });
        return orderedProduct;
    }

    static async stockProducts(
        product_id: number,
        warehouse_id: number,
        quantity: number
    ) {
        const productInWarehouse = await prisma.productInWarehouse.findUnique({
            where: {
                productId_warehouseId: {
                    productId: product_id,
                    warehouseId: warehouse_id,
                },
            },
        });
        if (productInWarehouse == null) {
            await prisma.productInWarehouse.create({
                data: {
                    product: {
                        connect: {
                            id: product_id,
                        },
                    },
                    warehouse: {
                        connect: {
                            id: warehouse_id,
                        },
                    },
                },
            });
        }
        const inStockQuantity: number =
            productInWarehouse == null ? 0 : productInWarehouse.inStockQuantity;
        const backOrderQuantity: number =
            productInWarehouse == null
                ? 0
                : productInWarehouse.backOrderQuantity;

        const stockedProduct = await prisma.productInWarehouse.update({
            where: {
                productId_warehouseId: {
                    productId: product_id,
                    warehouseId: warehouse_id,
                },
            },
            data: {
                inStockQuantity: inStockQuantity + quantity,
                backOrderQuantity:
                    backOrderQuantity - quantity < 0
                        ? 0
                        : backOrderQuantity - quantity,
            },
        });
        return stockedProduct;
    }

    static async fulfillOrder(
        product_id: number,
        warehouse_id: number,
        quantity: number
    ) {
        const productInWarehouse = await prisma.productInWarehouse.findUnique({
            where: {
                productId_warehouseId: {
                    productId: product_id,
                    warehouseId: warehouse_id,
                },
            },
        });
        if (productInWarehouse == null) {
            await prisma.productInWarehouse.create({
                data: {
                    product: {
                        connect: {
                            id: product_id,
                        },
                    },
                    warehouse: {
                        connect: {
                            id: warehouse_id,
                        },
                    },
                },
            });
        }
        const inStockQuantity: number =
            productInWarehouse == null ? 0 : productInWarehouse.inStockQuantity;
        if (inStockQuantity - quantity < 0) {
            throw new RangeError();
        }

        const fulfilledProduct = await prisma.productInWarehouse.update({
            where: {
                productId_warehouseId: {
                    productId: product_id,
                    warehouseId: warehouse_id,
                },
            },
            data: {
                inStockQuantity: inStockQuantity - quantity,
            },
        });
        return fulfilledProduct;
    }
}
