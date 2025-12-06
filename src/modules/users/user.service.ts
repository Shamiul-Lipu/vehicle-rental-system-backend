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

  if (isCustomer && user.id !== paramsUserId) {
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

// User must be authenticated
// User must be admin
// User with target ID must exist
// Fetch bookings where
// customer_id = target user
// status = 'active'
// If any active booking exists then deny deletion
// Else delete user
// Return success response
const deleteUser = async (
  user: JwtPayload | undefined,
  targetIdParam: string
) => {
  if (!user) {
    throw new Error("Unauthorized, user token missing.");
  }

  if (user.role !== "admin") {
    ("Unauthorized, Only admins can delete users");
  }

  const result = await pool.query(` DELETE FROM users WHERE id = $1`, [
    targetIdParam,
  ]);

  if (result.rowCount === 0) {
    throw new Error("User not found.");
  }

  return true;
};

export const UsersServices = { getUsers, updateUser, deleteUser };
