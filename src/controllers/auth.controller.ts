import { Request, Response } from "express";
import { asyncWrap } from "../middlewares/asyncWrap";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../services/auth.service";
export const login = asyncWrap(async (req: Request, res: Response) => {
  const user = { id: "123", email: "mock@mail.com", name: "Abir" }; // OAuth replace later
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
  res.json({ success: true, data: { accessToken } });
});
export const refresh = asyncWrap(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  const user = verifyRefreshToken(token);
  const newAccess = generateAccessToken(user);
  const newRefresh = generateRefreshToken(user);

  res.cookie("refreshToken", newRefresh, { httpOnly: true, secure: true });
  res.json({ success: true, data: { accessToken: newAccess } });
});
