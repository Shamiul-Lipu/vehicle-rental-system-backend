import { Request, Response } from "express";
import { BookingServices } from "./bookings.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const result = await BookingServices.createBooking(req.user, req.body);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: result.data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Booking failed",
      errors: err.constraint || err.message,
    });
  }
};

const getAllBookings = async (req: Request, res: Response) => {
  try {
    const result = await BookingServices.getAllBookings(req.user);

    if (req.user?.role === "admin") {
      return res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: result.data,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Your bookings retrieved successfully",
        data: result.data,
      });
    }
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Booking failed",
      errors: err.constraint || err.message,
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  try {
    const result = await BookingServices.updateBooking(
      req.user,
      req.params.bookingId as string,
      req.body
    );

    res.status(200).json({
      success: true,
      message: result.data.message,
      data: result.data.responseData,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Booking failed",
      errors: err.constraint || err.message,
    });
  }
};

export const BookingControllers = {
  createBooking,
  getAllBookings,
  updateBooking,
};
