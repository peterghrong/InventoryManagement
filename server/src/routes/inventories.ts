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
    inventoryValidator,
    productIdValidator,
} from "../utils/validators/inventoryValidator";
import { validate } from "../utils/validators/validate";

/**
 * Define various routes for the items controller
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
    inventoryValidator(),
    validate,
    createProduct
);

inventoriesRouter.put(
    "/products/:id",
    inventoryValidator(),
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
