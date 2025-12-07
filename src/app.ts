import express, { Request, Response } from "express";
import { initDB } from "./config/db";
import { allApiRoutes } from "./routes/apiRoutes";

const app = express();

app.use(express.json());

// initialize DB
initDB();

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "App is running",
    timestamp: new Date().toISOString(),
  });
});

// load all API modules
app.use("/api/v1", allApiRoutes);

// 404 handler for unknown routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

export default app;
