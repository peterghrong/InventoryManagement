import { Prisma, Product } from "@prisma/client";
import { statusCodes } from "../utils/statusCodes";
import { Request, Response } from "express";
import InventoryService from "../services/inventory";
import { parseCSV } from "../utils/csvParser";

/**
 * Fetch all Inventory products
 * @route GET /inventory/products
 */
const getProducts = async (_: Request, res: Response): Promise<void> => {
    try {
        const products: Product[] = await InventoryService.getAll();
        res.status(statusCodes.SUCCESS).json({ products: products });
    } catch (err) {
        res.status(statusCodes.SERVER_ERROR).json({
            message: "Internal Server Error",
        });
    }
};

/**
 * @route GET /inventory/product/:id
 */
const getProductDetail = async (req: Request, res: Response): Promise<void> => {
    const {
        params: { id },
    } = req;
    try {
        const productDetail = await InventoryService.getProductDetail(
            Number(id)
        );
        res.status(statusCodes.SUCCESS).json({ productDetail: productDetail });
    } catch (err) {
        res.status(statusCodes.SERVER_ERROR).json({
            message: "Internal Server Error",
        });
    }
};

/**
 * create a product
 * @route POST /inventory/product/:id
 */
const createProduct = async (req: Request, res: Response): Promise<void> => {
    const {
        body: { name, description },
    } = req;
    try {
        const product: Product = await InventoryService.createProduct(
            name,
            description
        );
        res.status(statusCodes.SUCCESS).json({ product: product });
    } catch (err) {
        res.status(statusCodes.SERVER_ERROR).json({
            message: "Internal Server Error",
        });
    }
};

/**
 *
 * Upadte an inventory product
 * @route PUT /inventory/product/:id
 */
const updateProduct = async (req: Request, res: Response): Promise<void> => {
    const {
        params: { id },
        body: { name, description },
    } = req;

    try {
        const updateProduct = await InventoryService.updateProduct(
            Number(id),
            name,
            description
        );
        res.status(statusCodes.SUCCESS).json({
            product: updateProduct,
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") {
                res.status(statusCodes.NOT_FOUND).json({
                    message: `Product with id: ${id} not found`,
                });
                return;
            }
        }
        res.status(statusCodes.SERVER_ERROR).json({
            message: "Internal server Error",
        });
    }
};

/**
 *
 * Delete an inventory product and remove them from warehousese
 * @route DELETE /inventory/product/:id
 */
const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    const {
        params: { id },
    } = req;
    try {
        const deletedProduct = await InventoryService.deleteProduct(Number(id));
        res.status(statusCodes.SUCCESS).json({
            product: deletedProduct,
        });
    } catch (err) {
        res.status(statusCodes.SERVER_ERROR).json({
            message: "Internal server Error",
        });
    }
};

/**
 * Request all items then parse them into csv format
 * @route GET /inventory/products/summary/download
 */
const downloadProducts = async (_: Request, res: Response): Promise<void> => {
    try {
        const productSummary = await InventoryService.getProductSummary();
        const csvData = parseCSV(productSummary);
        res.status(statusCodes.SUCCESS).send(Buffer.from(csvData));
    } catch (err) {
        res.status(statusCodes.SERVER_ERROR).json({
            message: "Internal Server error",
        });
    }
};

export {
    getProducts,
    getProductDetail,
    updateProduct,
    createProduct,
    deleteProduct,
    downloadProducts,
};
