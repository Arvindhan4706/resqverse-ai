# ResQVerse AI

ResQVerse AI is a disaster-response command and coordination platform for educational simulation and demonstration. 
This application provides a human-centered interface for evaluating AI-driven disaster response strategies.

> **Note:** This system is for **simulation and demonstration purposes only**. It must not be used to control real emergency equipment or make unsupervised medical/evacuation decisions.

## Setup Instructions

### Frontend (React/Vite)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables example:
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Mock Mode Authentication

If Firebase is not configured in your `.env.local`, the application will automatically fall back to **Mock Authentication Mode**. You can log in using one of the pre-configured demo accounts provided on the login screen.

## Project Structure

This project is being built in 8 passes. 
- **Pass 1:** Foundation (React, Routing, Auth Screens, Design System)
- **Pass 2:** Data Layer (FastAPI, SQLite) [Upcoming]
- **Pass 3:** GIS Map (Leaflet) [Upcoming]
- **Pass 4:** AI Agents (Python) [Upcoming]
- **Pass 5:** Approvals & Workflow [Upcoming]
- **Pass 6:** Simulation Center [Upcoming]
- **Pass 7:** Dashboard & Live Data [Upcoming]
- **Pass 8:** Quality & Testing [Upcoming]
