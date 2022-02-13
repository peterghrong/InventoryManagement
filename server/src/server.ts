import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import inventoriesRouter from "./routes/inventories";
import warehousesRouter from "./routes/warehouses";

const prisma = new PrismaClient();

const app = express();

app.use(express.json());
app.use(cors());
app.use("/inventory", inventoriesRouter);
app.use("/warehouses", warehousesRouter);
app.use("*", (_, res) => {
    res.status(404).json({ error: "Not Found" });
});

const server = app.listen(3000, () => {
    console.log("REST API server ready at: http://localhost:3000");
});

export { prisma, server };
