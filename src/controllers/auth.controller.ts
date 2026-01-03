import { asyncWrap } from "../middlewares/asyncWrap";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import { Request,Response } from "express";

const ACCESS_SECRET = process.env.JWT_ACCESS!;
const REFRESH_SECRET = process.env.JWT_REFRESH!;


export const login = asyncWrap(async (req: Request, res: Response) => {
  const user = { id: "19", email: "abir@nit.ac.in", name: "Abir Maity" };
  const accessToken = jwt.sign(user, ACCESS_SECRET, { expiresIn: "10m" });
  const refreshToken = jwt.sign(user, REFRESH_SECRET, { expiresIn: "14d" });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/auth/refresh"
  });

  res.json({ success: true, data: { accessToken } });
});

export const refresh = asyncWrap(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new AppError("ERR_REFRESH_MISSING", "Refresh token missing", null, 401);

  try {
    const user = jwt.verify(token, REFRESH_SECRET);
    const newAccess = jwt.sign(user, ACCESS_SECRET, { expiresIn: "10m" });
    const newRefresh = jwt.sign(user, REFRESH_SECRET, { expiresIn: "14d" });

    res.cookie("refreshToken", newRefresh, { httpOnly: true, secure: false, sameSite: "lax" });
    res.json({ success: true, data: { accessToken: newAccess } });

  } catch {
    throw new AppError("ERR_REFRESH_INVALID", "Invalid refresh token", null, 401);
  }
});

export const me = asyncWrap(async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth) throw new AppError("ERR_UNAUTH", "No token provided", null, 401);
  const token = auth.split(" ")[1];

  try {
    const user = jwt.verify(token, ACCESS_SECRET);
    res.json({ success: true, data: user });
  } catch {
    throw new AppError("ERR_ACCESS_INVALID", "Invalid access token", null, 401);
  }
});

export const logout = asyncWrap(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out" });
});

