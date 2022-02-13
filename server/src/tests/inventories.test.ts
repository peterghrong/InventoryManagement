import { Prisma } from "@prisma/client";
import request from "supertest";
import { server, prisma } from "../server";
import InventoryService from "../services/inventory";

describe("InventoryService tests", () => {
    let product;
    beforeEach(async () => {
        await prisma.productInWarehouse.deleteMany({});
        await prisma.warehouse.deleteMany({});
        await prisma.product.deleteMany({});
        product = await prisma.product.create({
            data: {
                name: "test",
                description: "test",
            },
        });
    });
    afterAll(async () => {
        server.close();
    });

    it("should get products", async () => {
        const products = await InventoryService.getAll();
        expect(products).toEqual([
            { description: "test", id: product.id, name: "test" },
        ]);
    });

    it("should get single product", async () => {
        const getProduct = await InventoryService.getProduct(product.id);
        expect(getProduct).toEqual({
            description: "test",
            id: product.id,
            name: "test",
        });
    });

    it("should create product", async () => {
        const createProduct = await InventoryService.createProduct(
            "test",
            "test"
        );
        expect(createProduct).toMatchObject({
            name: "test",
            description: "test",
        });
    });

    it("should update product", async () => {
        const updateProduct = await InventoryService.updateProduct(
            product.id,
            "new test",
            "new test"
        );
        expect(updateProduct).toEqual({
            name: "new test",
            id: product.id,
            description: "new test",
        });
    });

    it("should fail to update due to unknown id", async () => {
        await expect(
            InventoryService.updateProduct(product.id - 1, "Test", "test")
        ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
    });

    it("should get product detail", async () => {
        const inventory = await prisma.warehouse.create({
            data: {
                name: "test",
                address: "test",
                products: {
                    create: [
                        {
                            inStockQuantity: 5,
                            product: {
                                connect: { id: product.id },
                            },
                        },
                    ],
                },
            },
        });
        const productDetail = await InventoryService.getProductDetail(
            product.id
        );
        expect(productDetail).toMatchObject([
            {
                backOrderQuantity: 0,
                inStockQuantity: 5,
                warehouse: { address: "test", name: "test" },
            },
        ]);
    });

    it("should delete product", async () => {
        const deletedProduct = await InventoryService.deleteProduct(product.id);
        expect(deletedProduct).toMatchObject({
            count: 1,
        });
    });

    it("should get product summary", async () => {
        const inventory = await prisma.warehouse.create({
            data: {
                name: "test",
                address: "test",
                products: {
                    create: [
                        {
                            inStockQuantity: 5,
                            product: {
                                connect: { id: product.id },
                            },
                        },
                    ],
                },
            },
        });
        const second = await prisma.warehouse.create({
            data: {
                name: "test",
                address: "joe",
                products: {
                    create: [
                        {
                            inStockQuantity: 5,
                            product: {
                                connect: { id: product.id },
                            },
                        },
                    ],
                },
            },
        });
        const summary = await InventoryService.getProductSummary();
        expect(summary).toEqual([
            {
                backOrderQuantity: 0,
                description: "test",
                inStockQuantity: 10,
                name: "test",
                productId: product.id,
            },
        ]);
    });
});

describe("/inventory/products api test", () => {
    let product;
    beforeEach(async () => {
        await prisma.productInWarehouse.deleteMany({});
        await prisma.warehouse.deleteMany({});
        await prisma.product.deleteMany({});
        product = await prisma.product.create({
            data: {
                name: "test",
                description: "test",
            },
        });
    });
    afterAll(async () => {
        server.close();
    });

    it("should get products", async () => {
        const response = await request(server).get("/inventory/products");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            products: [expect.objectContaining(product)],
        });
    });

    it("it should get product detail for product not already in warehouse", async () => {
        const response = await request(server).get(
            `/inventory/products/${product.id}`
        );
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ productDetail: [] });
    });

    it("should get product detail", async () => {
        const inventory = await prisma.warehouse.create({
            data: {
                name: "test",
                address: "test",
                products: {
                    create: [
                        {
                            inStockQuantity: 5,
                            product: {
                                connect: { id: product.id },
                            },
                        },
                    ],
                },
            },
        });
        const response = await request(server).get(
            `/inventory/products/${product.id}`
        );
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            productDetail: expect.objectContaining([
                {
                    backOrderQuantity: 0,
                    inStockQuantity: 5,
                    warehouse: expect.objectContaining({
                        address: "test",
                        name: "test",
                    }),
                },
            ]),
        });
    });

    it("should create a product", async () => {
        const response = await request(server)
            .post("/inventory/products")
            .send({
                name: "new test",
                description: "new test",
            });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            product: expect.objectContaining({
                name: "new test",
                description: "new test",
            }),
        });
    });

    it("should update a product", async () => {
        const response = await request(server)
            .put(`/inventory/products/${product.id}`)
            .send({
                name: "new test",
                description: "new test",
            });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            product: expect.objectContaining({
                name: "new test",
                description: "new test",
            }),
        });
    });

    // it("It should return error on post", async () => {
    //     const missingAttrsResponse = await request(server)
    //         .post("/inventory/products")
    //         .send({
    //             count: 1,
    //         });
    //     expect(missingAttrsResponse.status).toBe(400);
    //     expect(missingAttrsResponse.body).toEqual({
    //         errors: expect.objectContaining([
    //             expect.objectContaining({
    //                 msg: "Invalid value",
    //                 param: "name",
    //             }),
    //         ]),
    //     });
    //     const rangeErrorResponse = await request(server)
    //         .post("/inventory/items")
    //         .send({
    //             name: "range error",
    //             description: "range error",
    //             count: -1,
    //         });
    //     expect(rangeErrorResponse.status).toBe(400);
    //     expect(rangeErrorResponse.body).toEqual({
    //         errors: [
    //             expect.objectContaining({
    //                 msg: "Invalid value",
    //                 param: "count",
    //                 value: "-1",
    //             }),
    //         ],
    //     });
    // });

    // it("should update items", async () => {
    //     const response = await request(server)
    //         .put(`/inventory/products/${item.id}`)
    //         .send({
    //             name: "update test",
    //             description: "update test",
    //             count: 2,
    //         });
    //     expect(response.status).toBe(200);
    //     expect(response.body).toEqual({
    //         item: expect.objectContaining({
    //             id: item.id,
    //             name: "update test",
    //             description: "update test",
    //             count: 2,
    //         }),
    //     });
    // });

    // it("should return errors on put", async () => {
    //     const response = await request(server)
    //         .put(`/inventory/products/${item.id}`)
    //         .send({
    //             name: "missing params",
    //             description: "missing params",
    //         });
    //     expect(response.status).toBe(400);
    //     expect(response.body).toEqual({
    //         errors: expect.objectContaining([
    //             expect.objectContaining({
    //                 msg: "Invalid value",
    //                 param: "count",
    //             }),
    //         ]),
    //     });

    //     const secondResponse = await request(server)
    //         .put(`/inventory/${item.id + 1}`)
    //         .send({
    //             name: "invalid id",
    //             description: "invalid id",
    //             count: 1,
    //         });
    //     expect(secondResponse.status).toBe(401);
    //     expect(secondResponse.body).toEqual({
    //         message: `Item with id: ${item.id + 1} not found`,
    //     });
    // });

    // it("should delete items", async () => {
    //     const response = await request(server).delete(`/items/${item.id}`);
    //     expect(response.status).toBe(200);
    //     expect(response.body).toEqual({
    //         item: expect.objectContaining({
    //             id: item.id,
    //             name: "test",
    //             description: "test",
    //             count: 1,
    //         }),
    //     });
    // });

    // it("should return error on delete", async () => {
    //     const response = await request(server).delete(`/items/${item.id + 1}`);
    //     expect(response.status).toBe(401);
    //     expect(response.body).toEqual({
    //         message: `Item with id: ${item.id + 1} not found`,
    //     });
    // });

    it("should get blob data", async () => {
        const response = await request(server).get(
            "/inventory/products/summary/download"
        );
        expect(response.status).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).toBeInstanceOf(Buffer);
    });
});

// //     it("should get blob data", async () => {
// //         const response = await request(server).get("/items/download");
// //         expect(response.status).toBe(200);
// //         expect(response.body).not.toBeNull();
// //         expect(response.body).toBeInstanceOf(Buffer);
// //     });
