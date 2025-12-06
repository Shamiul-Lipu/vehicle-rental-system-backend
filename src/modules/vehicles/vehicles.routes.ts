import { Router } from "express";
import { VehiclesControllers } from "./vehicles.controller";
import auth from "../../middleware/auth";

const router = Router();

router.post("/", auth("admin"), VehiclesControllers.createVehicles);

router.get("/", VehiclesControllers.getAllVehicles);

router.get("/:vehicleId", VehiclesControllers.getVehicleById);

router.put("/:vehicleId", auth("customer"), VehiclesControllers.updateVehicle);

export const VehiclesRoutes = router;
