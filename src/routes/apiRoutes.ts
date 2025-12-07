import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UsersRoutes } from "../modules/users/user.routes";
import { VehiclesRoutes } from "../modules/vehicles/vehicles.routes";
import { BookingRoutes } from "../modules/bookings/bookings.routes";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UsersRoutes);
router.use("/vehicles", VehiclesRoutes);
router.use("/bookings", BookingRoutes);

export const allApiRoutes = router;
