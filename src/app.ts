import express from "express";
import { initDB } from "./config/db";
import { allApiRoutes } from "./routes/apiRoutes";

const app = express();

app.use(express.json());

// initialize DB
initDB();

// load all API modules
app.use("/api/v1", allApiRoutes);

export default app;
