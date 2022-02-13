import { Prisma, Product, ProductInWarehouse, Warehouse } from "@prisma/client";
import { statusCodes } from "../utils/statusCodes";
import { Request, Response } from "express";
import WarehouseService from "../services/warehouse";
import InventoryService from "../services/inventory";

/**
 * Get all Warehouses
 * @route GET /items
 */
const getWarehouses = async (_: Request, res: Response): Promise<void> => {
    try {
        const warehouses: Warehouse[] = await WarehouseService.getAll();
        res.status(statusCodes.SUCCESS).json({ warehouses: warehouses });
    } catch (err) {
        res.status(statusCodes.SERVER_ERROR).json({
            message: "Internal Server Error",
        });
    }
};

const getProductsInWarehouse = async (
    req: Request,
    res: Response
): Promise<void> => {
    const {
        params: { id },
    } = req;
    try {
        const products = await WarehouseService.getProductsInWarehouse(
            Number(id)
        );
        res.status(statusCodes.SUCCESS).json({
            products: products,
        });
    } catch (err) {
        console.log(err);
        res.status(statusCodes.SERVER_ERROR).json({
            message: "Internal Server Error",
        });
    }
};

const createWarehouse = async (req: Request, res: Response): Promise<void> => {
    try {
        const newWarehouse: Warehouse = await WarehouseService.create(
            req.body.name,
            req.body.address
        );
        res.status(statusCodes.SUCCESS).json({
            warehouse: newWarehouse,
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2002") {
                res.status(statusCodes.BAD_REQUEST).json({
                    message: `Warehouse address: ${req.body.address} duplicated`,
                });
                return;
            }
        }
        res.status(statusCodes.SERVER_ERROR).json({
            message: "Internal server Error",
        });
    }
};

const orderProduct = async (req: Request, res: Response): Promise<void> => {
    const {
        params: { warehouse_id, product_id },
        body: { quantity },
    } = req;
    try {
        const product = await InventoryService.getProduct(Number(product_id));
        const warehouse = await WarehouseService.getWarehouse(
            Number(warehouse_id)
        );
        if (product == null || warehouse == null) {
            res.status(statusCodes.NOT_FOUND).json({
                message: `Warehouse number ${warehouse_id} or Product number ${product_id} does not exist.`,
            });
            return;
        }

        const stocked = await WarehouseService.orderProduct(
            Number(product_id),
            Number(warehouse_id),
            Number(quantity)
        );
        res.status(statusCodes.SUCCESS).json({
            stocked: stocked,
        });
    } catch (err) {
        console.log(err);
        res.status(statusCodes.SERVER_ERROR).json({
            message: "Internal server Error",
        });
    }
};

const stockProduct = async (req: Request, res: Response): Promise<void> => {
    const {
        params: { warehouse_id, product_id },
        body: { quantity },
    } = req;
    try {
        const product = await InventoryService.getProduct(Number(product_id));
        const warehouse = await WarehouseService.getWarehouse(
            Number(warehouse_id)
        );
        if (product == null || warehouse == null) {
            res.status(statusCodes.NOT_FOUND).json({
                message: `Warehouse number ${warehouse_id} or Product number ${product_id} does not exist.`,
            });
            return;
        }

        const stocked = await WarehouseService.stockProducts(
            Number(product_id),
            Number(warehouse_id),
            Number(quantity)
        );
        res.status(statusCodes.SUCCESS).json({
            stocked: stocked,
        });
    } catch (err) {
        console.log(err);
        res.status(statusCodes.SERVER_ERROR).json({
            message: "Internal server Error",
        });
    }
};

const fulfillOrder = async (req: Request, res: Response): Promise<void> => {
    const {
        params: { product_id, warehouse_id },
        body: { quantity },
    } = req;
    try {
        const product = await InventoryService.getProduct(Number(product_id));
        const warehouse = await WarehouseService.getWarehouse(
            Number(warehouse_id)
        );
        if (product == null || warehouse == null) {
            res.status(statusCodes.NOT_FOUND).json({
                message: `Warehouse number ${warehouse_id} or Product number ${product_id} does not exist.`,
            });
            return;
        }

        const stocked = await WarehouseService.fulfillOrder(
            Number(product_id),
            Number(warehouse_id),
            Number(quantity)
        );
        res.status(statusCodes.SUCCESS).json({
            stocked: stocked,
        });
    } catch (err) {
        if (err instanceof RangeError) {
            res.status(statusCodes.BAD_REQUEST).json({
                message: "Not enough products in stock to fulfill order",
            });
        }
        res.status(statusCodes.SERVER_ERROR).json({
            message: "Internal server Error",
        });
    }
};

export {
    getWarehouses,
    createWarehouse,
    orderProduct,
    stockProduct,
    fulfillOrder,
    getProductsInWarehouse,
};
