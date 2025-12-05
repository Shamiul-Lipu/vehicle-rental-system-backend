import { Request, Response } from "express";
import { AuthServices } from "./auth.service";

const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await AuthServices.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Signup failed",
      errors: err.constraint || err.message,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await AuthServices.loginUser(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Login failed",
      errors: err.constraint || err.message,
    });
  }
};

export const AuthControllers = { registerUser, loginUser };
