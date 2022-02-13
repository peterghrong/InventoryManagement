import { body } from "express-validator";

const inputValidator = () => {
    return [
        body("name").exists().isString(),
        body("description").optional().isString(),
        body("count").exists().trim().isInt({ min: 0 }),
    ];
};

export { inputValidator };
