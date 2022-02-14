import { Prisma } from "@prisma/client";
import request from "supertest";
import { server, prisma } from "../server";
import WarehouseService from "../services/warehouse";

describe("WarehouseService test", () => {
    let warehouse;
    beforeEach(async () => {
        await prisma.productInWarehouse.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.warehouse.deleteMany({});
        warehouse = await prisma.warehouse.create({
            data: {
                name: "test",
                address: "test",
            },
        });
    });
    afterAll(async () => {
        server.close();
    });

    it("should get warehouse", async () => {
        const warehouses = await WarehouseService.getAll();
        expect(warehouses).toEqual([
            { address: "test", id: warehouse.id, name: "test" },
        ]);
    });

    it("should create warehouse", async () => {
        const warehouse = await WarehouseService.createWarehouse(
            "test",
            "test2"
        );
        expect(warehouse).toMatchObject({
            name: "test",
            address: "test2",
        });
    });

    it("should update warehouse", async () => {
        const warehouseUpdate = await WarehouseService.updateWarehouse(
            warehouse.id,
            "test",
            "test"
        );
        expect(warehouseUpdate).toEqual({
            name: "test",
            address: "test",
            id: warehouse.id,
        });
    });

    it("should delete warehouse", async () => {
        const warehouseDelete = await WarehouseService.deleteWarehouse(
            warehouse.id
        );
        expect(warehouseDelete).toEqual({
            address: "test",
            id: warehouse.id,
            name: "test",
        });
    });

    it("should delete a warehouse and the associated product", async () => {
        const product = await prisma.product.create({
            data: {
                name: "test",
                description: "test",
                productInWarehouse: {
                    create: [
                        {
                            warehouse: {
                                connect: {
                                    id: warehouse.id,
                                },
                            },
                        },
                    ],
                },
            },
        });
        await WarehouseService.deleteWarehouse(warehouse.id);
        const productInWarehouse = await prisma.productInWarehouse.findUnique({
            where: {
                productId_warehouseId: {
                    productId: product.id,
                    warehouseId: warehouse.id,
                },
            },
        });
        expect(productInWarehouse).toBeNull;
    });

    it("should get product in warehouse", async () => {
        const product = await prisma.product.create({
            data: {
                name: "test",
                description: "test",
                productInWarehouse: {
                    create: [
                        {
                            warehouse: {
                                connect: { id: warehouse.id },
                            },
                        },
                    ],
                },
            },
        });
        const warehouseUpdate = await WarehouseService.getProductsInWarehouse(
            warehouse.id
        );
        expect(warehouseUpdate).toEqual([
            {
                backOrderQuantity: 0,
                inStockQuantity: 0,
                product: { description: "test", id: product.id, name: "test" },
            },
        ]);
    });

    it("should increase product count", async () => {
        const product = await prisma.product.create({
            data: {
                name: "test",
                description: "test",
                productInWarehouse: {
                    create: [
                        {
                            backOrderQuantity: 3,
                            warehouse: {
                                connect: { id: warehouse.id },
                            },
                        },
                    ],
                },
            },
        });
        const stockedProduct = await WarehouseService.stockProducts(
            product.id,
            warehouse.id,
            5
        );
        expect(stockedProduct).toEqual({
            backOrderQuantity: 0,
            inStockQuantity: 5,
            productId: product.id,
            warehouseId: warehouse.id,
        });

        await prisma.productInWarehouse.deleteMany({});
        const stockedProductNoRelations = await WarehouseService.stockProducts(
            product.id,
            warehouse.id,
            5
        );
        expect(stockedProductNoRelations).toEqual({
            backOrderQuantity: 0,
            inStockQuantity: 5,
            productId: product.id,
            warehouseId: warehouse.id,
        });
    });

    it("should decrease product count", async () => {
        await expect(
            WarehouseService.fulfillOrder(1, warehouse.id, 2)
        ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
        const product = await prisma.product.create({
            data: {
                name: "test",
                description: "test",
                productInWarehouse: {
                    create: [
                        {
                            inStockQuantity: 5,
                            warehouse: {
                                connect: { id: warehouse.id },
                            },
                        },
                    ],
                },
            },
        });
        const fulfilledOrder = await WarehouseService.fulfillOrder(
            product.id,
            warehouse.id,
            2
        );
        expect(fulfilledOrder).toEqual({
            backOrderQuantity: 0,
            inStockQuantity: 3,
            productId: product.id,
            warehouseId: warehouse.id,
        });
        await expect(
            WarehouseService.fulfillOrder(product.id, warehouse.id, 5)
        ).rejects.toBeInstanceOf(RangeError);
    });

    it("Should increase back ordered count", async () => {
        const product = await prisma.product.create({
            data: {
                name: "test",
                description: "test",
                productInWarehouse: {
                    create: [
                        {
                            inStockQuantity: 5,
                            warehouse: {
                                connect: { id: warehouse.id },
                            },
                        },
                    ],
                },
            },
        });
        const fulfilledOrder = await WarehouseService.orderProduct(
            product.id,
            warehouse.id,
            2
        );
        expect(fulfilledOrder).toEqual({
            backOrderQuantity: 2,
            inStockQuantity: 5,
            productId: product.id,
            warehouseId: warehouse.id,
        });
    });
});

describe("/warehouses route test", () => {
    let warehouse;
    beforeEach(async () => {
        await prisma.productInWarehouse.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.warehouse.deleteMany({});
        warehouse = await prisma.warehouse.create({
            data: {
                name: "test",
                address: "test",
            },
        });
    });
    afterAll(async () => {
        server.close();
    });

    it("should get warehouses", async () => {
        const response = await request(server).get("/warehouses");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            warehouses: [expect.objectContaining(warehouse)],
        });
    });

    it("should create a warehouse", async () => {
        const warehouse = await request(server).post("/warehouses").send({
            name: "test2",
            address: "test2",
        });
        expect(warehouse.status).toBe(200);
        expect(warehouse.body).toEqual({
            warehouse: expect.objectContaining({
                name: "test2",
                address: "test2",
            }),
        });
    });

    it("should update a warehoues", async () => {
        const updateWarehouse = await request(server)
            .put(`/warehouses/${warehouse.id}`)
            .send({
                name: "test2",
                address: "test2",
            });
        expect(updateWarehouse.status).toBe(200);
        expect(updateWarehouse.body).toEqual({
            warehouse: {
                id: warehouse.id,
                name: "test2",
                address: "test2",
            },
        });
    });

    it("should delete a warehouse", async () => {
        const deleteResponse = await request(server).delete(
            `/warehouses/${warehouse.id}`
        );
        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body).toEqual({
            warehouse: {
                id: warehouse.id,
                name: "test",
                address: "test",
            },
        });
    });

    it("should return error on unique constraint", async () => {
        const inventory = await request(server).post("/warehouses").send({
            name: "test",
            address: "test",
        });
        expect(inventory.status).toBe(400);
        expect(inventory.body).toEqual({
            message: `Warehouse address: test duplicated`,
        });
    });

    it("should return error on missing params", async () => {
        const missingAttrsResponse = await request(server)
            .post("/warehouses")
            .send();
        expect(missingAttrsResponse.status).toBe(400);
        expect(missingAttrsResponse.body).toEqual({
            errors: expect.objectContaining([
                expect.objectContaining({
                    msg: "Invalid value",
                    param: "name",
                }),
            ]),
        });
    });

    it("should stock product by increasing count", async () => {
        const product = await prisma.product.create({
            data: {
                name: "test",
                description: "test",
                productInWarehouse: {
                    create: [
                        {
                            warehouse: {
                                connect: {
                                    id: warehouse.id,
                                },
                            },
                        },
                    ],
                },
            },
        });
        const stockProductResponse = await request(server)
            .post(`/warehouses/${warehouse.id}/${product.id}/stock`)
            .send({
                quantity: 1,
            });
        expect(stockProductResponse.status).toEqual(200);
        expect(stockProductResponse.body).toEqual({
            stocked: expect.objectContaining({
                backOrderQuantity: 0,
                inStockQuantity: 1,
                productId: product.id,
                warehouseId: warehouse.id,
            }),
        });
    });

    it("should fail to stock product due to missing product", async () => {
        const product = await prisma.product.create({
            data: {
                name: "test",
                description: "test",
            },
        });
        const stockProductResponse = await request(server)
            .post(`/warehouses/${warehouse.id}/${product.id + 1}/stock`)
            .send({
                quantity: 1,
            });
        expect(stockProductResponse.status).toEqual(401);
        expect(stockProductResponse.body).toEqual({
            message: `Warehouse number ${warehouse.id} or Product number ${
                product.id + 1
            } does not exist.`,
        });
    });

    it("should fulfill order by decreasing count", async () => {
        const product = await prisma.product.create({
            data: {
                name: "test",
                description: "test",
                productInWarehouse: {
                    create: [
                        {
                            inStockQuantity: 5,
                            warehouse: {
                                connect: {
                                    id: warehouse.id,
                                },
                            },
                        },
                    ],
                },
            },
        });
        const stockProductResponse = await request(server)
            .post(`/warehouses/${warehouse.id}/${product.id}/fulfill`)
            .send({
                quantity: 1,
            });
        expect(stockProductResponse.status).toEqual(200);
        expect(stockProductResponse.body).toEqual({
            stocked: expect.objectContaining({
                backOrderQuantity: 0,
                inStockQuantity: 4,
                productId: product.id,
                warehouseId: warehouse.id,
            }),
        });
    });
});
