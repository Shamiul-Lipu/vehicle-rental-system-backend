## vehicle-rental-system-backend

> A backend API for managing vehicle rentals, customers, and bookings with secure authentication and role-based access.

**Live URL:** [https://vehicle-rental-system-backend-theta.vercel.app/](https://vehicle-rental-system-backend-theta.vercel.app/)

---

### Features

- **Vehicles:** Add, update, delete, and track availability of vehicles.
- **Users (Customers/Admins):** Manage user accounts and profiles with role-based access.
- **Bookings:** Create, update, and manage bookings with automatic total cost calculation.
- **Authentication:** JWT-based authentication and secure access control for Admin and Customer roles.
- **Business Rules:**
  - Cannot delete vehicles or users with active bookings.
  - Overlapping bookings for the same vehicle are blocked.
  - Vehicle availability updates automatically on booking creation, cancellation, or return.

---

### Technology Stack

- **Backend:** Node.js + TypeScript
- **Web Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication & Security:** bcrypt (password hashing), jsonwebtoken (JWT)
- **Other Tools:** Postman (API testing), dotenv (environment variables)

---

> A backend API for managing vehicle rentals, customers, and bookings.

## ![Database Diagram](https://raw.githubusercontent.com/Shamiul-Lipu/vehicle-rental-system-backend/main/dbDiagram.png)

## Setup & Usage

### Prerequisites

- **Node.js** – Make sure Node.js is installed on your PC
- **PostgreSQL** – Make sure PostgreSQL is installed and running
- **npm or yarn** – Make sure npm or yarn is installed to manage dependencies

### Installation

```bash
# Clone the repository
git clone https://github.com/Shamiul-Lipu/vehicle-rental-system-backend

# Navigate to project folder
cd vehicle-rental-system-backend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/database_name
JWT_SECRET=your_jwt_secret
```

### Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

- Access the app at: `http://localhost:5000`
- API base URL: `http://localhost:5000/api/v1`

### API Testing

- Use Postman or any API client to test endpoints.
- Ensure you include JWT tokens in the `Authorization` header for protected routes:

```http
Authorization: Bearer <jwt_token>
```

---

## API Endpoints

### Authentication

| Method | Endpoint              | Access | Description                 |
| ------ | --------------------- | ------ | --------------------------- |
| POST   | `/api/v1/auth/signup` | Public | Register new user account   |
| POST   | `/api/v1/auth/signin` | Public | Login and receive JWT token |

### Vehicles

| Method | Endpoint                      | Access     | Description                                                                              |
| ------ | ----------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| POST   | `/api/v1/vehicles`            | Admin only | Add new vehicle with name, type, registration, daily rent price, and availability status |
| GET    | `/api/v1/vehicles`            | Public     | View all vehicles in the system                                                          |
| GET    | `/api/v1/vehicles/:vehicleId` | Public     | View specific vehicle details                                                            |
| PUT    | `/api/v1/vehicles/:vehicleId` | Admin only | Update vehicle details, daily rent price, or availability status                         |
| DELETE | `/api/v1/vehicles/:vehicleId` | Admin only | Delete vehicle (only if no active bookings exist)                                        |

### Users

| Method | Endpoint                | Access       | Description                                                                 |
| ------ | ----------------------- | ------------ | --------------------------------------------------------------------------- |
| GET    | `/api/v1/users`         | Admin only   | View all users in the system                                                |
| PUT    | `/api/v1/users/:userId` | Admin or Own | Admin: Update any user's role or details. Customer: Update own profile only |
| DELETE | `/api/v1/users/:userId` | Admin only   | Delete user (only if no active bookings exist)                              |

### Bookings

| Method | Endpoint                      | Access            | Description                                                                                                                                                    |
| ------ | ----------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/v1/bookings`            | Customer or Admin | Create booking with start/end dates. Validates vehicle availability, calculates total price (daily rate × duration), and updates vehicle status to "booked"    |
| GET    | `/api/v1/bookings`            | Role-based        | Admin: View all bookings. Customer: View own bookings only                                                                                                     |
| PUT    | `/api/v1/bookings/:bookingId` | Role-based        | Customer: Cancel booking (before start date only). Admin: Mark as "returned" (updates vehicle to "available"). System auto-mark as "returned" when period ends |
