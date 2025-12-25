import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export const globalError = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("ERROR:", err);

    if (err instanceof AppError) {
        return res.status(err.status).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details
            }
        });
    }

    return res.status(500).json({
        success: false,
        error: {
            code: "ERR_INTERNAL_SERVER",
            message: "Internal Server Error",
            details: null
        }
    });
};
