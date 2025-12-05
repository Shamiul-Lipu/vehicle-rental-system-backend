import { JwtPayload } from "jsonwebtoken";
import { pool } from "../../config/db";

const getUsers = async () => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role FROM users`
  );
  return result.rows;
};

const updateUser = async (
  payload: Record<string, unknown>,
  user: JwtPayload | undefined,
  paramsUserId: string
) => {
  console.log("Payload:", payload);
  console.log("User:", user);
  console.log("Target ID:", paramsUserId);

  if (!user) {
    throw new Error("Unauthorized: user token missing.");
  }

  const isAdmin = user.role === "admin";
  const isCustomer = user.role === "customer";

  if (isCustomer && user.id !== paramsUserId) {
    throw new Error("Forbidden: customers can only update their own profile.");
  }

  return true;
};

export const UsersServices = { getUsers, updateUser };
