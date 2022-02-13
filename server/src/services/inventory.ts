import { Prisma, Product, ProductInWarehouse, Warehouse } from "@prisma/client";
import { prisma } from "../server";

export default class InventoryService {
    static async getAll() {
        const products: Product[] = await prisma.product.findMany();
        return products;
    }

    static async getProduct(id: number) {
        const product: Product | null = await prisma.product.findFirst({
            where: { id: id },
        });
        return product;
    }

    static async createProduct(name: string, description: string) {
        const product: Product = await prisma.product.create({
            data: {
                name: name,
                description: description,
            },
        });
        return product;
    }

    static async updateProduct(id: number, name: string, description: string) {
        try {
            const product: Product = await prisma.product.update({
                where: { id: id },
                data: {
                    name: name,
                    description: description,
                },
            });
            return product;
        } catch (err) {
            throw err;
        }
    }

    static async deleteProduct(id: number) {
        const relations = await prisma.productInWarehouse.deleteMany({
            where: { productId: id },
        });
        const products = await prisma.product.deleteMany({
            where: { id: id },
        });
        return products;
    }

    static async getProductDetail(id: number) {
        const productDetail = await prisma.productInWarehouse.findMany({
            where: { productId: id },
            select: {
                inStockQuantity: true,
                backOrderQuantity: true,
                warehouse: true,
            },
        });
        return productDetail;
    }

    static async getProductSummary() {
        const productSummary = await prisma.productInWarehouse.groupBy({
            by: ["productId"],
            _sum: {
                inStockQuantity: true,
                backOrderQuantity: true,
            },
        });

        return await Promise.all(
            productSummary.map(async (summary) => {
                const { name, description } = (await prisma.product.findFirst({
                    where: { id: summary.productId },
                }))!;
                const {
                    productId,
                    _sum: { inStockQuantity, backOrderQuantity },
                } = summary;
                return {
                    productId,
                    inStockQuantity,
                    backOrderQuantity,
                    name,
                    description,
                };
            })
        );
    }
}
