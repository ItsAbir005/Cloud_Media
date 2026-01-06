import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";

const ACCESS_SECRET = process.env.JWT_ACCESS!;

interface JwtPayload {
  id: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      throw new AppError("ERR_UNAUTH", "No token provided", null, 401);
    }

    const token = auth.split(" ")[1];
    if (!token) {
      throw new AppError("ERR_UNAUTH", "Invalid authorization format", null, 401);
    }

    const decoded = jwt.verify(token, ACCESS_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("ERR_ACCESS_INVALID", "Invalid access token", null, 401));
    }
  }
};