import { NextFunction } from "express";
import { validationResult } from "express-validator";
import { statusCodes } from "../statusCodes";
import { Request, Response } from "express";

const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    res.status(statusCodes.BAD_REQUEST).json({
        errors: errors.array(),
    });
    return;
};

export { validate };
