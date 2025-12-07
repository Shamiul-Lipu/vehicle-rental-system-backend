import { JwtPayload } from "jsonwebtoken";
import { pool } from "../../config/db";

const createBooking = async (
  user: JwtPayload | undefined,
  payload: Record<string, unknown>
) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  if (!user) throw new Error("Unauthorized, user token missing.");

  if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date) {
    throw new Error("Missing required fields.");
  }

  // Strict YYYY-MM-DD
  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  if (
    !DATE_REGEX.test(rent_start_date as string) ||
    !DATE_REGEX.test(rent_end_date as string)
  ) {
    throw new Error("Dates must be in YYYY-MM-DD format.");
  }

  const start = new Date(rent_start_date as string);
  const end = new Date(rent_end_date as string);
  if (isNaN(start.getTime()) || isNaN(end.getTime()))
    throw new Error("Invalid date.");
  if (end <= start)
    throw new Error("rent_end_date must be after rent_start_date.");

  // Check user exists
  const customer = await pool.query("SELECT id FROM users WHERE id = $1", [
    Number(customer_id),
  ]);
  if (customer.rowCount === 0) throw new Error("Customer does not exist.");

  // Check vehicle exists
  const vehicleRes = await pool.query("SELECT * FROM vehicles WHERE id = $1", [
    Number(vehicle_id),
  ]);
  if (vehicleRes.rowCount === 0) throw new Error("Vehicle does not exist.");
  const vehicle = vehicleRes.rows[0];

  // Check for overlapping active bookings
  const conflictingBooking = await pool.query(
    `SELECT id FROM bookings
     WHERE vehicle_id = $1
     AND status = 'active'
     AND NOT (rent_end_date <= $2 OR rent_start_date >= $3)`,
    [Number(vehicle_id), rent_start_date, rent_end_date]
  );

  if (conflictingBooking.rowCount && conflictingBooking.rowCount > 0) {
    throw new Error("Vehicle is not available for these dates.");
  }

  // Calculate total price
  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const total_price = days * Number(vehicle.daily_rent_price);
  if (total_price <= 0) throw new Error("Failed to calculate total price.");

  // Create booking
  const newBooking = await pool.query(
    `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
     VALUES ($1, $2, $3, $4, $5, 'active')
     RETURNING *`,
    [
      Number(customer_id),
      Number(vehicle_id),
      rent_start_date,
      rent_end_date,
      total_price,
    ]
  );
  const booking = newBooking.rows[0];

  // Update vehicle availability
  await pool.query(
    `UPDATE vehicles
     SET availability_status = 'booked'
     WHERE id = $1`,
    [Number(vehicle_id)]
  );

  return {
    data: {
      ...booking,
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: vehicle.daily_rent_price,
      },
    },
  };
};

const getAllBookings = async (user: JwtPayload | undefined) => {
  if (!user) {
    throw new Error("Unauthorized: token missing.");
  }
  const isAdmin = user.role === "admin";

  let query;
  let values: any[] = [];

  if (isAdmin) {
    // ADMIN:
    query = `
      SELECT 
        b.*,
        u.name AS customer_name,
        u.email AS customer_email,
        v.vehicle_name,
        v.registration_number
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.id DESC
    `;
  } else {
    // CUSTOMER:
    query = `
      SELECT 
        b.*,
        v.vehicle_name,
        v.registration_number,
        v.type
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.customer_id = $1
      ORDER BY b.id DESC
    `;
    values = [user.id];
  }

  const result = await pool.query(query, values);
  const data = result.rows.map((row) => ({
    id: row.id,
    customer_id: isAdmin ? row.customer_id : undefined,
    vehicle_id: row.vehicle_id,
    rent_start_date: row.rent_start_date,
    rent_end_date: row.rent_end_date,
    total_price: row.total_price,
    status: row.status,
    ...(isAdmin
      ? {
          customer: { name: row.customer_name, email: row.customer_email },
          vehicle: {
            vehicle_name: row.vehicle_name,
            registration_number: row.registration_number,
          },
        }
      : {
          vehicle: {
            vehicle_name: row.vehicle_name,
            registration_number: row.registration_number,
            type: row.type,
          },
        }),
  }));

  return { data };
};

const updateBooking = async (
  user: JwtPayload | undefined,
  bookingId: string,
  payload: { status: string }
) => {
  if (!user) throw new Error("Unauthorized: user token missing.");

  const { status } = payload;
  if (!["cancelled", "returned"].includes(status)) {
    throw new Error("Invalid status. Allowed: 'cancelled', 'returned'.");
  }

  // Fetch booking and vehicle info
  const bookingRes = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [
    bookingId,
  ]);

  if (bookingRes.rowCount === 0) throw new Error("Booking does not exist.");
  const booking = bookingRes.rows[0];

  const isAdmin = user.role === "admin";
  const isCustomer =
    user.role === "customer" && booking.customer_id === user.id;

  if (status === "cancelled") {
    if (!isCustomer)
      throw new Error("Only the customer can cancel their booking.");

    const today = new Date().toISOString().split("T")[0];
    if (booking.rent_start_date <= today!) {
      throw new Error("Cannot cancel a booking that has already started.");
    }
  } else if (status === "returned") {
    if (!isAdmin)
      throw new Error("Only an admin can mark a booking as returned.");
  }

  // Update booking status
  const updatedBookingRes = await pool.query(
    `UPDATE bookings
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [status, bookingId]
  );
  const updatedBooking = updatedBookingRes.rows[0];

  // Update vehicle availability if needed
  if (["cancelled", "returned"].includes(status)) {
    await pool.query(
      `UPDATE vehicles
       SET availability_status = 'available'
       WHERE id = $1`,
      [booking.vehicle_id]
    );
  }

  // Return response in API format
  const responseData: any = {
    ...updatedBooking,
    rent_start_date: updatedBooking.rent_start_date.toISOString().split("T")[0],
    rent_end_date: updatedBooking.rent_end_date.toISOString().split("T")[0],
  };

  if (status === "returned") {
    responseData.vehicle = { availability_status: "available" };
  }

  const message =
    status === "cancelled"
      ? "Booking cancelled successfully"
      : "Booking marked as returned. Vehicle is now available";

  return {
    data: { responseData, message },
  };
};

export const BookingServices = {
  createBooking,
  getAllBookings,
  updateBooking,
};
