import { body, param, sanitize } from "express-validator";

const sanitizeCount = () => {
    return body("count").toInt();
};

const sanitizeQuantity = () => {
    return body("quantity").toInt();
};

const sanitizeProductId = () => {
    return [param("id").toInt()];
};

export { sanitizeCount, sanitizeQuantity, sanitizeProductId };
