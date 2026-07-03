# 🔗 LinkTrack
Project Live at: https://linktrackk.netlify.app/

**LinkTrack** is a modern, premium web application for URL shortening and in-depth link analytics. It features a stunning dark glassmorphism user interface, robust JWT authentication, instant QR code generation, and live visitor tracking (browser, device type, platform/OS, and traffic timeline).

---

## ✨ Features

- **Custom & Generated Short Links**: Shorten complex URLs into clean, readable links using custom aliases or auto-generated codes.
- **Link Expiration**: Set optional expiry dates and times on your short links. When a link expires, visitors are gracefully shown a stylish 410 Expired page.
- **Visitor Analytics Logs**: Track detailed visitor information on every click:
  - IP Address
  - Browser Client (Chrome, Firefox, Safari, Edge, etc.)
  - Device Type (Desktop, Mobile, Tablet)
  - Platform/OS (Windows, macOS, Linux, iOS, Android, etc.)
  - Exact Timestamp
- **Live Visual Metrics**: 
  - An interactive, custom-drawn **SVG Click Timeline** showing clicks over the last 7 days.
  - Progress-track distribution charts for devices, browsers, and platforms.
  - Key Performance Indicators (KPIs) showing *Total Clicks*, *Unique Visits*, and *Last Visited* time.
- **QR Code Campaign Tools**: Generate and download high-quality, scan-ready QR codes for offline or visual marketing campaigns.
- **JWT Protection**: Secure user authentication (Sign In & Register) to keep dashboards and analytics reports completely private.
- **Aesthetic Glassmorphism UI**: Beautiful, fully-responsive dashboard and charts designed using native HTML/CSS capabilities and micro-animations.

---

## 🛠️ Tech Stack

### Frontend
- **Framework & Tooling**: [React.js](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: React Router DOM (v6)
- **Icons**: Lucide React
- **QR Codes**: Node-QRCode
- **Styling**: Vanilla CSS (Tailored HSL variables, custom gradients, responsive grid, flexbox layout, and glassmorphism styling)

### Backend
- **Runtime & Framework**: Node.js + Express
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) + Bcrypt.js (password hashing)
- **validation**: Express Validator
- **Request Parsing**: Custom HTTP User-Agent parser for precise analytics logging

---

## 📁 Repository Structure

```text
LinkTrack/
├── backend/                  # Express API Server
│   ├── models/               # Mongoose schemas (User, ShortUrl, Visit)
│   ├── routes/               # API Router Handlers (auth, urls, analytics, redirect)
│   ├── utils/                # Custom User-Agent (ua) string parser
│   ├── .env                  # Port, MongoDB URI & JWT secret configuration
│   ├── server.js             # Main server execution and DB connection
│   └── package.json          # Node dependencies & startup scripts
│
├── frontend/                 # React SPA Client
│   ├── src/
│   │   ├── components/       # Shared UI Elements (Navbar, QrCodeModal)
│   │   ├── context/          # Global Authentication Context (AuthContext)
│   │   ├── pages/            # View Pages (Home/Auth, Dashboard, Analytics)
│   │   ├── services/         # Axios API Client configuration
│   │   ├── App.jsx           # Client router setup
│   │   ├── index.css         # Core CSS design tokens & animation stylesheet
│   │   └── main.jsx          # React app entry point
│   ├── index.html            # Document root markup
│   ├── vite.config.js        # Vite compilation configuration
│   └── package.json          # React dependencies & build scripts
```

---

## 🚀 Setup & Local Execution

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v16.x or higher)
- **MongoDB** (Running locally on `mongodb://127.0.0.1:27017` or an active cloud atlas connection)

---

### Step 1: Backend Server Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the server-side dependencies:
   ```bash
   npm install
   ```
3. Verify or configure your environment settings in `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/linktrack
   JWT_SECRET=linktrack_super_secret_jwt_key_2026
   BASE_URL=http://localhost:5000
   ```
4. Start the backend developer server:
   ```bash
   npm run dev
   ```
   *The server will boot up successfully and connect to MongoDB at `http://localhost:5000`.*

---

### Step 2: Frontend Client Setup

1. Open a new terminal session and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the client-side dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite developer server:
   ```bash
   npm run dev
   ```
4. Open your web browser and load the UI at the shown address:
   - **Local URL**: `http://localhost:5173`

---

## 🏗️ System Architecture

<p align="center">
  <img src="./documents/Architecure Diagram.png" 
       alt="URL Shortener Architecture Diagram"
       width="900"/>
</p>

---

## 🎬 Project Demo & Explanation

<p align="center">

🎥 **Watch the complete walkthrough of the URL Shortener project**


▶️ YouTube Video: https://youtu.be/yQIcImkHYFk


</p>

---

## 🔒 Security & Performance Features

- **Async Redirection Logs**: The backend handles user redirection immediately (302 status code), saving analytics visit details asynchronously so that the redirection latency for the end user is minimized.
- **Route Authorization Check**: Client-side router protection redirects unauthenticated users to the Home page, while the API checks JWT validation headers for database security.
- **Error Boundaries & Safety**: Features strict safety paths to ignore standard browser requests like `/favicon.ico` preventing incorrect click and analytics measurements.

“This project is a part of a hackathon run by https://katomaran.com " 
