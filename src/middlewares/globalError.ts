import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export const globalError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("ERROR:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: (err.status < 500 || process.env.NODE_ENV === "development") 
          ? err.details 
          : undefined
      }
    });
  }
  return res.status(500).json({
    success: false,
    error: {
      code: "ERR_INTERNAL_SERVER",
      message: process.env.NODE_ENV === "production" 
        ? "Internal Server Error" 
        : err.message,
      details: process.env.NODE_ENV === "development" 
        ? { stack: err.stack } 
        : undefined
    }
  });
};