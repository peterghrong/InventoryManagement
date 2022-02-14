import { Prisma } from "@prisma/client";
import request from "supertest";
import { server, prisma } from "../server";
import WarehouseService from "../services/warehouse";
import { parseCSV } from "../utils/csvParser";

describe("Inventory validators test", () => {
    beforeEach(async () => {
        await prisma.productInWarehouse.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.warehouse.deleteMany({});
    });
    afterAll(async () => {
        server.close();
    });

    it("should fail on missing id or non integer id", async () => {
        const response = await request(server).get("/inventory/products/x");
        expect(response.status).toBe(400);
    });

    it("should fail on missing name or descriptions", async () => {
        const response = await request(server)
            .post("/inventory/products")
            .send({});
        expect(response.status).toBe(400);
    });

    it("should fail on missing name or descriptions", async () => {
        const product = await prisma.product.create({
            data: {
                name: "test",
                description: "test",
            },
        });
        const response = await request(server)
            .put(`/inventory/products/${product.id}`)
            .send({});
        expect(response.status).toBe(400);
    });
});

describe("Warehouse validators test", () => {
    beforeEach(async () => {
        await prisma.productInWarehouse.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.warehouse.deleteMany({});
    });
    afterAll(async () => {
        server.close();
    });

    it("should fail on missing id or non integer id", async () => {
        const response = await request(server).get("/warehouses/x");
        expect(response.status).toBe(400);
    });

    it("should fail on missing name or descriptions on post", async () => {
        const response = await request(server).post("/warehouses").send({});
        expect(response.status).toBe(400);
    });

    it("should fail on missing name or descriptions stock post", async () => {
        const product = await prisma.product.create({
            data: {
                name: "test",
                description: "test",
            },
        });
        const warehouse = await prisma.warehouse.create({
            data: {
                name: "test",
                address: "test",
            },
        });
        const response = await request(server)
            .post(`/warehouses/${warehouse.id}/${product.id}/stock`)
            .send({});
        expect(response.status).toBe(400);
    });

    it("should fail on missing params", async () => {
        const response = await request(server)
            .post(`/warehouses/x/y/order`)
            .send({});
        expect(response.status).toBe(400);
    });
});

describe("test csv parser", () => {
    it("should parse input json to csv", () => {
        const parsed = parseCSV({
            productId: 123,
            name: "test",
            description: "test",
            inStockQuantity: 123,
            backOrderQuantity: 123,
        });
        expect(parsed).toEqual(
            '"Product Id","Product Name","Product Description","In stock quantity","Back Ordered Quantity"\n123,"test","test",123,123'
        );
    });
});
