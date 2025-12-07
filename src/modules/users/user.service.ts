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
  if (!user) {
    throw new Error("Unauthorized, user token missing.");
  }

  const isAdmin = user.role === "admin";
  const isCustomer = user.role === "customer";

  if (isCustomer && String(user.id) !== paramsUserId) {
    throw new Error("Customers can only update their own profile.");
  }

  const allowedFieldsForAdmin = ["name", "email", "phone", "role"];
  const allowedFieldsForCustomer = ["name", "email", "phone"];

  const allowedFields = isAdmin
    ? allowedFieldsForAdmin
    : allowedFieldsForCustomer;

  // Validate payload contains only allowed fields
  const payloadKeys = Object.keys(payload);
  const invalidFields = payloadKeys.filter(
    (key) => !allowedFields.includes(key)
  );

  if (invalidFields.length > 0) {
    throw new Error(`Invalid fields for update: ${invalidFields.join(", ")}`);
  }

  // Customers cannot update role
  if (isCustomer && "role" in payload) {
    throw new Error("Customers are not allowed to update the role field.");
  }

  if (payloadKeys.length === 0) {
    throw new Error("No valid fields provided for update.");
  }

  // Dynamic SQL building
  const setClauses: string[] = [];
  const values: unknown[] = [];

  payloadKeys.forEach((field, index) => {
    setClauses.push(`${field} = $${index + 1}`);
    values.push(payload[field]);
  });

  // Add condition parameter
  const targetIdParam = `$${values.length + 1}`;
  values.push(paramsUserId);

  const query = `
    UPDATE users
    SET ${setClauses.join(", ")}
    WHERE id = ${targetIdParam}
    RETURNING id, name, email, phone, role
  `;

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    throw new Error("User not found.");
  }

  return result.rows[0];
};

const deleteUser = async (
  user: JwtPayload | undefined,
  targetIdParam: string
) => {
  if (!user) {
    throw new Error("Unauthorized, user token missing.");
  }

  if (user.role !== "admin") {
    throw new Error("Unauthorized, only admins can delete users.");
  }

  const targetId = Number(targetIdParam);

  const userCheck = await pool.query(`SELECT * FROM users WHERE id = $1`, [
    targetId,
  ]);

  if (userCheck.rowCount === 0) {
    throw new Error("User not found");
  }

  const activeBookings = await pool.query(
    `SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active'`,
    [targetId]
  );

  if (activeBookings.rowCount && activeBookings.rowCount > 0) {
    throw new Error("Cannot delete user: user has active bookings");
  }

  const result = await pool.query(`DELETE FROM users WHERE id = $1`, [
    targetId,
  ]);

  if (result.rowCount === 0) {
    throw new Error("Failed to delete user");
  }

  return true;
};

export const UsersServices = { getUsers, updateUser, deleteUser };
