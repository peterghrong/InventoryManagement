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
        await prisma.warehouse.create({
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
            description: "test",
            id: product.id,
            name: "test",
        });
    });

    it("should delete product and products in associated warehouse", async () => {
        const warehouse = await prisma.warehouse.create({
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
        await InventoryService.deleteProduct(product.id);
        const productInwarehouse = await prisma.productInWarehouse.findUnique({
            where: {
                productId_warehouseId: {
                    productId: product.id,
                    warehouseId: warehouse.id,
                },
            },
        });
        expect(productInwarehouse).toBeNull;
    });

    it("should get product summary", async () => {
        await prisma.warehouse.create({
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
        await prisma.warehouse.create({
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
        await prisma.warehouse.create({
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

    it("should fail to update a product", async () => {
        const response = await request(server)
            .put(`/inventory/products/${product.id + 1}`)
            .send({
                name: "new test",
                description: "new test",
            });
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            message: `Product with id: ${product.id + 1} not found`,
        });
    });

    it("should get blob data", async () => {
        const response = await request(server).get(
            "/inventory/products/summary/download"
        );
        expect(response.status).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).toBeInstanceOf(Buffer);
    });
});
