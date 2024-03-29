import { Router } from "express";
import {
    createProduct,
    deleteProduct,
    downloadProducts,
    getProductDetail,
    getProducts,
    updateProduct,
} from "../controllers/inventories";
import {
    inventoryParamsValidator,
    productIdValidator,
} from "../utils/validators/inventoryValidator";
import { validate } from "../utils/validators/validate";

/**
 * Define various routes for the Inventory controller
 */
const inventoriesRouter = Router();

inventoriesRouter.get("/products", getProducts);
inventoriesRouter.get(
    "/products/:id",
    productIdValidator(),
    validate,
    getProductDetail
);
inventoriesRouter.post(
    "/products",
    inventoryParamsValidator(),
    validate,
    createProduct
);
inventoriesRouter.put(
    "/products/:id",
    inventoryParamsValidator().concat(productIdValidator()),
    validate,
    updateProduct
);
inventoriesRouter.delete(
    "/products/:id",
    productIdValidator(),
    validate,
    deleteProduct
);
inventoriesRouter.get("/products/summary/download", downloadProducts);

export default inventoriesRouter;
