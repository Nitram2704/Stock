# Stock Management IoT System

A premium real-time stock management system designed for IoT integration.

## Project Structure

- `/web`: Next.js 15 Frontend (Dashboard, Inventory Management).
- `/server`: NestJS Backend (IoT API, Business Logic).
- `/supabase`: Database migrations and schema.
- `simulate_scan.ps1`: PowerShell script to simulate IoT sensor scans.

## Setup Instructions

### 1. Database (Supabase)
1. Create a new project in [Supabase](https://supabase.com/).
2. Go to the **SQL Editor** and run the content of `supabase/migrations/20260210_initial_schema.sql`.
3. Enable **Realtime** for the `movements` table in the Supabase Dashboard (Database -> Replication -> Realtime).

### 2. Backend Configuration
1. Navigate to `server/`.
2. Create a `.env` file with:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3001
   ```
3. Run `npm install` and `npm run start:dev`.

### 3. Frontend Configuration
1. Navigate to `web/`.
2. Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Run `npm install` and `npm run dev`.

### 4. Testing the IoT Scan
1. Open the dashboard at `http://localhost:3000`.
2. Run the `simulate_scan.ps1` script in PowerShell.
3. Observe the **Real-time Activity Feed** update instantly without reloading.

## Features
- **Real-time Updates:** <2s latency via Supabase Realtime.
- **Premium Design:** Dark industrial aesthetic with Slate-900 and Blue-500 accents.
- **RBAC:** Role-based access control (Admin, Manager, Operator).
- **IoT Ready:** Dedicated REST endpoint for sensor scans.
