import request from "supertest";
import { server, prisma } from "../server";
describe("/warehouses test", () => {
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

    it("should create an warehouse", async () => {
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

    // it("It should update warehouse products", async () => {
    //     await prisma.product.create({
    //         data: {
    //             count: 1,
    //             name: "test",
    //             Warehouse: {
    //                 connect: {
    //                     id: warehouse.id,
    //                 },
    //             },
    //         },
    //     });
    //     const product = await request(server)
    //         .put(`/warehouses/${warehouse.id}`)
    //         .send({
    //             product: {
    //                 name: "test",
    //                 description: "test",
    //                 count: 10,
    //             },
    //         });
    //     expect(product.status).toBe(200);
    //     expect(product.body).toEqual({
    //         product: expect.objectContaining({
    //             count: 10,
    //             description: "test",
    //             name: "test",
    //             warehouseId: warehouse.id,
    //         }),
    //     });
    // });
});
