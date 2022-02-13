import { Router } from "express";
import {
    createWarehouse,
    fulfillOrder,
    getProductsInWarehouse,
    getWarehouses,
    orderProduct,
    stockProduct,
} from "../controllers/warehouses";
import {
    orderValidator,
    warehouseValidator,
} from "../utils/validators/warehouseValidator";
import { validate } from "../utils/validators/validate";
import { sanitizeQuantity } from "../utils/sanitizers/productSanitizer";

/**
 * Define various routes for the items controller
 */
const warehousesRouter = Router();

warehousesRouter.get("", getWarehouses);
warehousesRouter.get("/:id", getProductsInWarehouse);
warehousesRouter.post("", warehouseValidator(), validate, createWarehouse);
warehousesRouter.post(
    "/:warehouse_id/:product_id/fulfill",
    orderValidator(),
    validate,
    sanitizeQuantity(),
    fulfillOrder
);
warehousesRouter.post(
    "/:warehouse_id/:product_id/stock",
    orderValidator(),
    validate,
    sanitizeQuantity(),
    stockProduct
);
warehousesRouter.post(
    "/:warehouse_id/:product_id/order",
    orderValidator(),
    validate,
    sanitizeQuantity(),
    orderProduct
);
export default warehousesRouter;
