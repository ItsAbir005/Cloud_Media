import { asyncWrap } from "../middlewares/asyncWrap";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import { Request, Response } from "express";

const ACCESS_SECRET = process.env.JWT_ACCESS!;
const REFRESH_SECRET = process.env.JWT_REFRESH!;

interface JwtPayload {
  id: string;
  email: string;
  name: string;
}

export const login = asyncWrap(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    throw new AppError("ERR_VALIDATION", "Email and password required", null, 400);
  }

  const user: JwtPayload = { id: "19", email: "abir@nit.ac.in", name: "Abir Maity" };
  
  const accessToken = jwt.sign(user, ACCESS_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(user, REFRESH_SECRET, { expiresIn: "7d" });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 
  });

  res.json({ success: true, data: { accessToken } });
});

export const refresh = asyncWrap(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    throw new AppError("ERR_REFRESH_MISSING", "Refresh token missing", null, 401);
  }

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as JwtPayload;
    const payload: JwtPayload = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    };

    const newAccess = jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
    const newRefresh = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

    res.cookie("refreshToken", newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, data: { accessToken: newAccess } });
  } catch {
    throw new AppError("ERR_REFRESH_INVALID", "Invalid refresh token", null, 401);
  }
});

export const me = asyncWrap(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("ERR_UNAUTH", "User not authenticated", null, 401);
  }

  res.json({ success: true, data: req.user });
});

export const logout = asyncWrap(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  
  res.json({ success: true, message: "Logged out" });
});