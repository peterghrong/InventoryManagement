import { body, param } from "express-validator";

const warehouseValidator = () => {
    return [
        body("name").exists().isString(),
        body("address").exists().isString(),
    ];
};

const orderValidator = () => {
    return [
        param("product_id").exists(),
        param("warehouse_id").exists(),
        body("quantity").exists().isInt({ min: 0 }),
    ];
};

export { warehouseValidator, orderValidator };
