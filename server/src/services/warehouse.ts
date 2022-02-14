import { Prisma, Warehouse } from "@prisma/client";
import { prisma } from "../server";

export default class WarehouseService {
    /**
     *
     * @returns All avaialable warehouses
     */
    static async getAll() {
        const warehouses: Warehouse[] = await prisma.warehouse.findMany();
        return warehouses;
    }

    /**
     *
     * @param id of warehouse
     * @returns warehouse
     */
    static async getWarehouse(id: number) {
        const warehouse: Warehouse | null = await prisma.warehouse.findFirst({
            where: {
                id: id,
            },
        });
        return warehouse;
    }

    /**
     *
     * @param name of warehouse
     * @param address of warehouse
     * @returns created warehouse
     */
    static async createWarehouse(name: string, address: string) {
        const warehouse: Warehouse = await prisma.warehouse.create({
            data: {
                name: name,
                address: address,
            },
        });
        return warehouse;
    }

    /**
     *
     * @param id of warehouse
     * @param name of warehouse
     * @param address of warehouse
     * @returns updated warehouse
     */
    static async updateWarehouse(id: number, name: string, address: string) {
        const warehouse: Warehouse = await prisma.warehouse.update({
            where: { id: id },
            data: {
                name: name,
                address: address,
            },
        });
        return warehouse;
    }

    /**
     *
     * @param id of warehouse
     * @returns deleted warehouse
     */
    static async deleteWarehouse(id: number) {
        await prisma.productInWarehouse.deleteMany({
            where: { warehouseId: id },
        });
        const warehouse: Warehouse = await prisma.warehouse.delete({
            where: { id: id },
        });
        return warehouse;
    }

    /**
     *
     * @param warehouseId of warehouse
     * @returns all products in warehouse
     */
    static async getProductsInWarehouse(warehouseId: number) {
        const productInWarehouse = await prisma.productInWarehouse.findMany({
            where: { warehouseId: warehouseId },
            select: {
                inStockQuantity: true,
                backOrderQuantity: true,
                product: true,
            },
        });
        return productInWarehouse;
    }

    /**
     *
     * @param productId
     * @param warehouseId
     * @returns foundOrCreated warehouse
     */
    static async checkOrCreate(productId: number, warehouseId: number) {
        const productInWarehouse = await prisma.productInWarehouse.findUnique({
            where: {
                productId_warehouseId: {
                    productId: productId,
                    warehouseId: warehouseId,
                },
            },
        });
        if (productInWarehouse == null) {
            const createdProduct = await prisma.productInWarehouse.create({
                data: {
                    product: {
                        connect: {
                            id: productId,
                        },
                    },
                    warehouse: {
                        connect: {
                            id: warehouseId,
                        },
                    },
                },
            });
            return createdProduct;
        }
        return productInWarehouse;
    }

    /**
     *
     * @param productId of product to order
     * @param warehouseId of warehouse to order to
     * @param quantity of product to order to warehouse
     * @returns product detail in the warehouse
     */
    static async orderProduct(
        productId: number,
        warehouseId: number,
        quantity: number
    ) {
        const productInWarehouse = await WarehouseService.checkOrCreate(
            productId,
            warehouseId
        );
        const backOrderQuantity: number = productInWarehouse.backOrderQuantity;
        const orderedProduct = await prisma.productInWarehouse.update({
            where: {
                productId_warehouseId: {
                    productId: productId,
                    warehouseId: warehouseId,
                },
            },
            data: {
                backOrderQuantity: backOrderQuantity + quantity,
            },
        });
        return orderedProduct;
    }

    /**
     *
     * @param productId of product
     * @param warehouseId of warehouse
     * @param quantity of product
     * @returns product detail in the warehouse
     */
    static async stockProducts(
        productId: number,
        warehouseId: number,
        quantity: number
    ) {
        const productInWarehouse = await WarehouseService.checkOrCreate(
            productId,
            warehouseId
        );
        const inStockQuantity: number = productInWarehouse.inStockQuantity;
        const backOrderQuantity: number = productInWarehouse.backOrderQuantity;

        const stockedProduct = await prisma.productInWarehouse.update({
            where: {
                productId_warehouseId: {
                    productId: productId,
                    warehouseId: warehouseId,
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

    /**
     *
     * @param productId of product
     * @param warehouseId of warehouse
     * @param quantity of product
     * @returns product detail in the warehouse
     */
    static async fulfillOrder(
        productId: number,
        warehouseId: number,
        quantity: number
    ) {
        const productInWarehouse = await prisma.productInWarehouse.findUnique({
            where: {
                productId_warehouseId: {
                    productId: productId,
                    warehouseId: warehouseId,
                },
            },
        });
        if (productInWarehouse == null) {
            throw new Prisma.PrismaClientKnownRequestError(
                "Not found",
                "P2025",
                ""
            );
        }
        const inStockQuantity: number =
            productInWarehouse == null ? 0 : productInWarehouse.inStockQuantity;
        if (inStockQuantity - quantity < 0) {
            throw new RangeError();
        }

        const fulfilledProduct = await prisma.productInWarehouse.update({
            where: {
                productId_warehouseId: {
                    productId: productId,
                    warehouseId: warehouseId,
                },
            },
            data: {
                inStockQuantity: inStockQuantity - quantity,
            },
        });
        return fulfilledProduct;
    }
}
