import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRole } from "../types/user.types";
import config from "../config";

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          errors: "Authorization header missing or invalid",
        });
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(
        token as string,
        config.jwt_secrate as string
      ) as JwtPayload;

      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized for this",
          errors: "User role mismatch",
        });
      }

      next();
    } catch (err: any) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        errors: err.message,
      });
    }
  };
};

export default auth;
