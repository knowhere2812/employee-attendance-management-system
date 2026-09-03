# Employee Attendance Management System

A simple MERN attendance application for employees and HR teams. It uses React + Vite on the client and Express + MongoDB on the server.

## Live Preview:https://employee-attendance-management-syst-zeta.vercel.app/

## Quick start

1. Install dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
2. Seed demo accounts (optional):
   ```bash
   cd server && npm run seed
   ```
3. Start the API in one terminal and the client in another:
   ```bash
   cd server && npm run dev
   cd client && npm run dev
   ```

The API runs on `http://localhost:5000`; Vite normally runs on `http://localhost:5173`.

## Vercel deployment

Deploy this repository as two Vercel projects:

- Backend: set the project root to `server`. The included `server/vercel.json` exposes the Express API.
- Frontend: set the project root to `client` and use the Vite framework preset.

Set these production environment variables:

- Backend: `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `CLIENT_URL` set to the deployed frontend URL.
- Frontend: `VITE_API_URL` set to the deployed backend URL ending in `/api`.

After deployment, the frontend calls the backend through `VITE_API_URL`, and the backend only accepts browser requests from `CLIENT_URL`.

## Demo accounts

- HR: `hr@company.com` / `Password123!`
- Employee: `employee@company.com` / `Password123!`

UI Images:
<img width="1898" height="718" alt="image" src="https://github.com/user-attachments/assets/0fd73c4a-e00b-474f-9b39-73cc83b36eac" />
<img width="1914" height="855" alt="image" src="https://github.com/user-attachments/assets/03513a29-62a6-456b-b8d0-3ffa1a0ed586" />
<img width="906" height="851" alt="image" src="https://github.com/user-attachments/assets/079f9dd8-a946-44aa-aa96-f08f9786bb37" />
<img width="1919" height="868" alt="image" src="https://github.com/user-attachments/assets/155773ca-908d-40db-a9b2-b02e22d55875" />

## Notes

- All attendance dates and office-time decisions use `Asia/Kolkata`.
- Run `npm run seed` again to reset the known demo users and add a small attendance sample. It does not delete other records.
- New employee registration creates an employee account. Create HR accounts directly in MongoDB or adjust a seed account for controlled deployments.
