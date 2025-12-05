import bcrypt from "bcryptjs";
import { pool } from "../../config/db";
import { allowedRoles, UserRole } from "../../types/user.types";
import jwt from "jsonwebtoken";
import config from "../../config";

const registerUser = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;

  if (typeof password !== "string" || password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  if (!allowedRoles.includes(role as UserRole)) {
    throw new Error(`Role must be "admin" or "customer"`);
  }

  const hashedPassword = await bcrypt.hash(password as string, 10);

  const result = await pool.query(
    `INSERT INTO users(name, email, password, phone, role)
       VALUES($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role`,
    [name, email, hashedPassword, phone, role]
  );

  return result.rows[0];
};

const loginUser = async (payload: Record<string, unknown>) => {
  const { email, password } = payload;

  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);

  if (result.rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.rows[0];

  const isMatched = await bcrypt.compare(password as string, user.password);

  if (!isMatched) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    config.jwt_secrate as string,
    {
      expiresIn: "7d",
    }
  );

  delete user.password;
  return { token, user };
};

export const AuthServices = { registerUser, loginUser };
