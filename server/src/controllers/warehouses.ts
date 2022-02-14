import { Prisma, Product, ProductInWarehouse, Warehouse } from "@prisma/client";
import { statusCodes } from "../utils/statusCodes";
import { Request, Response } from "express";
import WarehouseService from "../services/warehouse";
import InventoryService from "../services/inventory";

/**
 * Get all Warehouses
 * @route GET /warehouses
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

/**
 * Get all products in warehouse
 * @route GET /warehouses/:id/products
 */
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

/**
 * Create a warehouse
 * @route POST /warehouses
 */
const createWarehouse = async (req: Request, res: Response): Promise<void> => {
    try {
        const newWarehouse: Warehouse = await WarehouseService.createWarehouse(
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

/**
 *
 * Upadte an inventory product
 * @route PUT /warehouses/product/:id
 */
const updateWarehouse = async (req: Request, res: Response): Promise<void> => {
    const {
        params: { id },
        body: { name, address },
    } = req;

    try {
        const updateWarehouse = await WarehouseService.updateWarehouse(
            Number(id),
            name,
            address
        );
        res.status(statusCodes.SUCCESS).json({
            warehouse: updateWarehouse,
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") {
                res.status(statusCodes.NOT_FOUND).json({
                    message: `Warehouse with id: ${id} not found`,
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
 * Delete a warehouse and remove all products stored in that warehouse
 * @route DELETE /warehouses/:id
 */
const deleteWarehouse = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedWarehouse = await WarehouseService.deleteWarehouse(
            Number(req.params.id)
        );
        res.status(statusCodes.SUCCESS).json({
            warehouse: deletedWarehouse,
        });
    } catch (err) {
        res.status(statusCodes.SERVER_ERROR).json({
            message: "Internal server Error",
        });
    }
};

/**
 * Order products to warehouse
 * @route POST /warehouses/:warehouse_id/:product_id/order
 */
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
        res.status(statusCodes.SERVER_ERROR).json({
            message: "Internal server Error",
        });
    }
};

/**
 * Stock product to warehouse
 * @route POST /warehouses/:warehouse_id/:product_id/stock
 */
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
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") {
                res.status(statusCodes.NOT_FOUND).json({
                    message: `Product ${product_id} does not exist in warehouse ${warehouse_id}`,
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
 * Fulfill order from warehouse
 * @route POST /warehouses/:warehouse_id/:product_id/fulfill
 */
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
            return;
        }
        res.status(statusCodes.SERVER_ERROR).json({
            message: "Internal server Error",
        });
    }
};

export {
    getWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    orderProduct,
    stockProduct,
    fulfillOrder,
    getProductsInWarehouse,
};
