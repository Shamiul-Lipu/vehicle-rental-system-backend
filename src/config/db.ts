import { Pool } from "pg";
import config from ".";

export const pool = new Pool({
  connectionString: `${config.database_url}`,
});

export const initDB = async () => {
  try {
    // User table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE CHECK (email = LOWER(email)),
            password TEXT NOT NULL CHECK (LENGTH(password) >= 6),
            phone TEXT NOT NULL,
            role TEXT CHECK (role IN ('admin', 'customer')) NOT NULL
        );
    `);
    // Vehicles table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS vehicles (
            id SERIAL PRIMARY KEY,
            vehicle_name TEXT NOT NULL,
            type TEXT CHECK (type IN ('car', 'bike', 'van', 'SUV')) NOT NULL,
            registration_number TEXT NOT NULL UNIQUE,
            daily_rent_price NUMERIC CHECK (daily_rent_price > 0) NOT NULL,
            availability_status TEXT CHECK (availability_status IN ('available', 'booked')) NOT NULL
        );        
    `);
    // Bookings table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER REFERENCES users(id),
            vehicle_id INTEGER REFERENCES vehicles(id),
            rent_start_date DATE NOT NULL,
            rent_end_date DATE NOT NULL CHECK (rent_end_date > rent_start_date),
            total_price NUMERIC CHECK (total_price > 0) NOT NULL,
            status TEXT CHECK (status IN ('active', 'cancelled', 'returned')) NOT NULL
        );            
    `);

    console.log("All tables initialized successfully");
  } catch (error: any) {
    console.error("Error initializing DB:", error.message);
  }
};
