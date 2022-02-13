import { body, param } from "express-validator";

const inventoryValidator = () => {
    return [
        body("name").exists().isString(),
        body("description").exists().isString(),
    ];
};

const productIdValidator = () => {
    return [param("id").exists().isInt()];
};

export { inventoryValidator, productIdValidator };
