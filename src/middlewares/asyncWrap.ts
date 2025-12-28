import { Request, Response, NextFunction } from "express";
export const asyncWrap = (fn: any) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);
