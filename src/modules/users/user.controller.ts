import { Request, Response } from "express";
import { UsersServices } from "./user.service";

const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await UsersServices.getUsers();
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Users retrieved failed",
      errors: err.constraint || err.message,
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const result = await UsersServices.updateUser(
      req.body,
      req.user,
      req.params.userId as string
    );
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Users updated failed",
      errors: err.constraint || err.message,
    });
  }
};

export const UsersControllers = {
  getUsers,
  updateUser,
};
