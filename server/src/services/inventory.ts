import { Product } from "@prisma/client";
import { prisma } from "../server";

export default class InventoryService {
    /**
     *
     * @returns All products in warehouse
     */
    static async getAll() {
        const products: Product[] = await prisma.product.findMany();
        return products;
    }

    /**
     *
     * @param id of product
     * @returns product informations
     */
    static async getProduct(id: number) {
        const product: Product | null = await prisma.product.findFirst({
            where: { id: id },
        });
        return product;
    }

    /**
     *
     * @param name of product
     * @param description of product
     * @returns product created
     */
    static async createProduct(name: string, description: string) {
        const product: Product = await prisma.product.create({
            data: {
                name: name,
                description: description,
            },
        });
        return product;
    }

    /**
     *
     * @param id of product
     * @param name of product
     * @param description of product
     * @returns updated product
     */
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

    /**
     *
     * @param id of product
     * @returns deleted product
     */
    static async deleteProduct(id: number) {
        await prisma.productInWarehouse.deleteMany({
            where: { productId: id },
        });
        const products = await prisma.product.delete({
            where: { id: id },
        });
        return products;
    }

    /**
     *
     * @param id of product
     * @returns inventory detail of the product
     */
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

    /**
     *
     * @returns product details including [product id, name, description, in stock quantity, back ordered quantity]
     */
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
