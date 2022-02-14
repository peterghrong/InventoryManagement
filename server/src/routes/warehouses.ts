import { Router } from "express";
import {
    createWarehouse,
    deleteWarehouse,
    fulfillOrder,
    getProductsInWarehouse,
    getWarehouses,
    orderProduct,
    stockProduct,
    updateWarehouse,
} from "../controllers/warehouses";
import {
    orderValidator,
    warehouseIdValidator,
    warehouseValidator,
} from "../utils/validators/warehouseValidator";
import { validate } from "../utils/validators/validate";

/**
 * Define various routes for the Warehouses controller
 */
const warehousesRouter = Router();

warehousesRouter.get("", getWarehouses);
warehousesRouter.get(
    "/:id",
    warehouseIdValidator(),
    validate,
    getProductsInWarehouse
);
warehousesRouter.delete(
    "/:id",
    warehouseIdValidator(),
    validate,
    deleteWarehouse
);
warehousesRouter.put(
    "/:id",
    warehouseIdValidator().concat(warehouseValidator()),
    validate,
    updateWarehouse
);
warehousesRouter.post("", warehouseValidator(), validate, createWarehouse);
warehousesRouter.post(
    "/:warehouse_id/:product_id/fulfill",
    orderValidator(),
    validate,
    fulfillOrder
);
warehousesRouter.post(
    "/:warehouse_id/:product_id/stock",
    orderValidator(),
    validate,
    stockProduct
);
warehousesRouter.post(
    "/:warehouse_id/:product_id/order",
    orderValidator(),
    validate,
    orderProduct
);
export default warehousesRouter;
