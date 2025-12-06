import { JwtPayload } from "jsonwebtoken";
import { pool } from "../../config/db";

const createVehicles = async (
  user: JwtPayload | undefined,
  payload: Record<string, unknown>
) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;
  if (!user) {
    throw new Error("Unauthorized: user token missing.");
  }

  if (user.role !== "admin") {
    throw new Error("Unauthorized: only admins can delete users.");
  }

  const result = await pool.query(
    `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
    VALUES ($1, $2, $3, $4, $5) `,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );

  return result.rows[0];
};

const getAllVehicles = async () => {
  const result = await pool.query(`SELECT * FROM vehicles`);
  return result.rows;
};

const getVehicleById = async (vehicleId: string) => {
  const result = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [
    vehicleId,
  ]);

  if (result.rowCount === 0) {
    throw new Error("Vehicle not found.");
  }

  return result.rows[0];
};

const updateVehicle = async (
  vehicleId: string,
  payload: Record<string, unknown>
) => {
  const allowedFields = [
    "vehicle_name",
    "type",
    "registration_number",
    "daily_rent_price",
    "availability_status",
  ];
  const payloadKeys = Object.keys(payload);

  const invalidFields = payloadKeys.filter(
    (key) => !allowedFields.includes(key)
  );
  if (invalidFields.length > 0) {
    throw new Error(`Invalid fields for update: ${invalidFields.join(", ")}`);
  }

  if (payloadKeys.length === 0) {
    throw new Error("No valid fields provided for update.");
  }

  // Build dynamic SQL
  const setClauses: string[] = [];
  const values: unknown[] = [];

  payloadKeys.forEach((field, index) => {
    setClauses.push(`${field} = $${index + 1}`);
    values.push(payload[field]);
  });

  const vehicleIdParam = `$${values.length + 1}`;
  values.push(vehicleId);

  const query = `
    UPDATE vehicles
    SET ${setClauses.join(", ")}
    WHERE id = ${vehicleIdParam}
    RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status
  `;

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    throw new Error("Vehicle not found.");
  }

  return result.rows[0];
};

export const VehiclesServices = {
  createVehicles,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
};
