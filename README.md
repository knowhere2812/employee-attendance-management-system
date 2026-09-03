# Employee Attendance Management System

A simple MERN attendance application for employees and HR teams. It uses React + Vite on the client and Express + MongoDB on the server.

## Quick start

1. Install dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
2. Copy `server/.env.example` to `server/.env` and set `MONGO_URI` and `JWT_SECRET`.
3. Seed demo accounts (optional):
   ```bash
   cd server && npm run seed
   ```
4. Start the API in one terminal and the client in another:
   ```bash
   cd server && npm run dev
   cd client && npm run dev
   ```

The API runs on `http://localhost:5000`; Vite normally runs on `http://localhost:5173`.

## Demo accounts

- HR: `hr@company.com` / `Password123!`
- Employee: `employee@company.com` / `Password123!`

## Notes

- All attendance dates and office-time decisions use `Asia/Kolkata`.
- Run `npm run seed` again to reset the known demo users and add a small attendance sample. It does not delete other records.
- New employee registration creates an employee account. Create HR accounts directly in MongoDB or adjust a seed account for controlled deployments.
