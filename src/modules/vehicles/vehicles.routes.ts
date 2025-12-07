import { Router } from "express";
import { VehiclesControllers } from "./vehicles.controller";
import auth from "../../middleware/auth";

const router = Router();

router.post("/", auth("admin"), VehiclesControllers.createVehicles);

router.get("/", VehiclesControllers.getAllVehicles);

router.get("/:vehicleId", VehiclesControllers.getVehicleById);

router.put("/:vehicleId", auth("admin"), VehiclesControllers.updateVehicle);

router.delete("/:vehicleId", auth("admin"), VehiclesControllers.deleteVehicle);

export const VehiclesRoutes = router;
