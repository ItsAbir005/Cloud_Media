import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AppError } from "../errors/AppError";
const ACCESS_SECRET = process.env.JWT_ACCESS!;
const REFRESH_SECRET = process.env.JWT_REFRESH!;
export const generateAccessToken = (userId: any) => {
    const token = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "15m" });
    return token;
};

export const generateRefreshToken = (userId: any) => {
    const token = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" });
    return token;
};
export const hashToken = async (token: string) => bcrypt.hash(token, 10);
export const verifyRefreshToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, REFRESH_SECRET);
        return decoded;
    } catch (error) {
        throw new AppError("ERR_REFRESH_INVALID", "Invalid refresh token", null, 401);
    }
};
