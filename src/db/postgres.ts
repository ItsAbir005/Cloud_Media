import dotenv from "dotenv";
dotenv.config();

import { AppError } from "../errors/AppError";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";

const connectionString = process.env.DATABASE_URL!;
export const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export const testPostgres = async (): Promise<void> => {
    try {
        await pool.query("SELECT 1");
        console.log("Postgres connected");
    } catch (err) {
        throw new AppError("ERR_POSTGRES_CONN", "Failed to connect to PostgreSQL", err);
    }
};

