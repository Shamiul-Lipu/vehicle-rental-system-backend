import { Router } from "express";
import { BookingControllers } from "./bookings.controller";
import auth from "../../middleware/auth";

const router = Router();

router.post("/", auth("admin", "customer"), BookingControllers.createBooking);

router.get("/", auth("admin", "customer"), BookingControllers.getAllBookings);

router.put(
  "/:bookingId",
  auth("admin", "customer"),
  BookingControllers.updateBooking
);

export const BookingRoutes = router;
