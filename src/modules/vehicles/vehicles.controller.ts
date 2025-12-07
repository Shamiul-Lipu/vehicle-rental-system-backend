import { Request, Response } from "express";
import { VehiclesServices } from "./vehicles.service";

const createVehicles = async (req: Request, res: Response) => {
  try {
    const result = await VehiclesServices.createVehicles(req.user, req.body);

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Vehicle creation failed",
      errors: err.constraint || err.message,
    });
  }
};

const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const result = await VehiclesServices.getAllVehicles();

    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No vehicles found",
        data: [],
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Vehicles retrieved successfully",
        data: result,
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch vehicles",
      errors: err.message,
    });
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  try {
    const result = await VehiclesServices.getVehicleById(
      req.params.vehicleId as string
    );

    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message || "Failed to fetch vehicle details",
      errors: err.message,
    });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  try {
    const result = await VehiclesServices.updateVehicle(
      req.params.vehicleId as string,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Vehicle update failed",
      errors: err.constraint || err.message,
    });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const result = await VehiclesServices.deleteVehicle(
      req.user,
      req.params.vehicleId as string
    );

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Vehicle deletion failed",
      errors: err.constraint || err.message,
    });
  }
};

export const VehiclesControllers = {
  createVehicles,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
