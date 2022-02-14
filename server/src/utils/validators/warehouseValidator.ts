import { body, param } from "express-validator";

const warehouseValidator = () => {
    return [
        body("name").exists().isString(),
        body("address").exists().isString(),
    ];
};
const warehouseIdValidator = () => {
    return [param("id").exists().isInt()];
};

const orderValidator = () => {
    return [
        param("product_id").exists().isInt(),
        param("warehouse_id").exists().isInt(),
        body("quantity").exists().isInt({ min: 0 }),
    ];
};

export { warehouseValidator, orderValidator, warehouseIdValidator };
