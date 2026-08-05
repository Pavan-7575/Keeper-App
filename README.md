# Keeper App - Enterprise Full-Stack Note Management System

An enterprise-grade, full-stack production application built on top of the classic Keeper App. Features comprehensive JWT & OAuth2 authentication, PostgreSQL relational database storage, live audio reminders, notification sound selection, note categorization, tagging, searching, filtering, stats dashboard, profile management, and light/dark theme modes.

---

## 🚀 Key Features

### 🔐 Authentication & Authorization
- **Multi-Method Login**: Login using **Email + Password** OR **Username + Password**.
- **Social OAuth2 Integration**: Login & auto account creation via **Google** and **Facebook** powered by Passport.js.
- **JWT Token Management**: Short-lived Access Tokens (15m) + Secure HTTP-only Refresh Tokens (7d).
- **Password Security**: Passwords hashed using **bcrypt** with 12 salt rounds.
- **Complete Auth Flow**: Login, Register, Forgot Password, Reset Password with token link, Email Verification.
- **User Data Isolation**: Logged-in users can only access their own private notes.

### 📝 Notes & Management
- **Rich Note Content**: Title, Content, Background Colors, Pin, Archive, Trash, Favorite, Mark as Done/Pending.
- **Categories & Tags**: Group notes into custom user categories and tag with custom labels.
- **Reminders & Web Audio Tones**: Set date and time reminders with customizable notification tones (*Chime*, *Bell*, *Digital Pulse*, *Gentle Wave*).
- **Instant Search**: Search across note title, content, category name, or labels.
- **Filters & Sorting**:
  - **Filters**: Total, Completed, Pending, Pinned, Favorites, Archived, Trash.
  - **Sorting**: Newest First, Oldest First, Alphabetical (A-Z), Reminder Date.
- **Quick Operations**: Duplicate notes, restore from trash, edit in modal.

### 🎨 Frontend UI & Modern Aesthetics
- **Keeper Signature Theme**: Maintains the iconic yellow (`#f5ba13`) brand identity with sleek Material Design.
- **Dark Mode / Light Mode**: Seamless theme toggling with CSS custom properties.
- **Responsive Dashboard**: Stats overview cards displaying counts for completed, pending, pinned, archived, and favorited notes.
- **Profile Management**: Update user display names, username, password, and upload custom profile pictures.

### 🛡️ Security & Enterprise Best Practices
- **PostgreSQL Database**: Parameterized queries using `node-postgres` (`pg`) to prevent SQL Injection.
- **API Security**: Express Rate Limiter, Helmet headers, CORS policies, Cookie Parser, Express Validator input sanitization.
- **MVC Architecture**: Backend clean separation into Controllers, Models, Routes, Middlewares, Config, Database, Services, Utils.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, HTML5, CSS3, Lucide Icons, Web Audio API, Vite.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (node-postgres `pg` pool).
- **Authentication**: JWT, bcrypt, Passport.js (Google & Facebook OAuth2).
- **Security & Utils**: Helmet, CORS, Morgan, Express Rate Limit, Express Validator, Multer, Nodemailer, Cookie Parser.

---

## 📁 Project Folder Structure

```
Keeper App/
├── backend/
│   ├── config/
│   │   ├── db.js              # PostgreSQL Connection Pool
│   │   └── passport.js        # Google & Facebook OAuth Strategies
│   ├── controllers/
│   │   ├── authController.js  # JWT Auth & Password reset logic
│   │   ├── noteController.js  # Note CRUD & Stats logic
│   │   ├── categoryController.js
│   │   ├── reminderController.js
│   │   └── userController.js  # Profile & Avatar upload logic
│   ├── database/
│   │   ├── schema.sql         # SQL DDL CREATE TABLE statements
│   │   └── initDb.js          # DB auto-initialization script
│   ├── middlewares/
│   │   ├── authMiddleware.js  # JWT token verification
│   │   ├── validationMiddleware.js
│   │   ├── uploadMiddleware.js# Multer avatar upload
│   │   ├── rateLimiter.js     # Rate limiting middleware
│   │   └── errorHandler.js    # Express error handler
│   ├── models/
│   │   ├── User.js            # User DB Model (pg)
│   │   ├── Note.js            # Note DB Model (pg)
│   │   ├── Category.js
│   │   ├── Reminder.js
│   │   └── OAuth.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── noteRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── reminderRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   └── emailService.js    # Nodemailer email sender
│   ├── utils/
│   │   ├── jwtUtils.js
│   │   └── responseUtils.js
│   ├── uploads/               # User uploaded avatars
│   ├── package.json
│   └── server.js              # Main Express Server
├── public/
│   └── styles.css             # Theme tokens, dark mode & components CSS
├── src/
│   ├── components/
│   │   ├── Auth/              # Login, Register, Forgot/Reset Password, Verify
│   │   ├── Profile/           # Profile & Avatar management
│   │   ├── App.jsx            # Main React layout
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Note.jsx
│   │   ├── CreateArea.jsx
│   │   ├── DashboardStats.jsx
│   │   └── ReminderModal.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── NotesContext.jsx
│   ├── services/
│   │   └── api.js             # API client with auto-token refresh
│   ├── utils/
│   │   └── audio.js           # Web Audio API Synthesizer
│   └── main.jsx
├── .env                       # Environment variables
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** Database installed and running

### 2. Environment Configuration
Create a `.env` file in the root directory (or copy `.env.example`):

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# PostgreSQL Connection
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_pg_password
PGDATABASE=keeper_db

# JWT Secrets
JWT_SECRET=super_secret_keeper_access_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=super_secret_keeper_refresh_key
JWT_REFRESH_EXPIRES_IN=7d

# OAuth Keys (Optional for local testing)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# SMTP Email Configuration (Optional - falls back to console logs)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=Keeper App <no-reply@keeperapp.com>
```

### 3. Database Setup
Create the database in PostgreSQL:
```sql
CREATE DATABASE keeper_db;
```
Run the schema initialization script:
```bash
cd backend
npm install
npm run db:init
```

### 4. Running the Backend Server
```bash
cd backend
npm run dev
```
*Backend server will start at `http://localhost:5000`*

### 5. Running the Frontend App
In a new terminal window:
```bash
npm install
npm run dev
```
*Frontend application will start at `http://localhost:5173`*

---

## 🔑 OAuth Setup Guide

### Google OAuth2
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a Project -> Enable OAuth 2.0 API.
3. Add Authorized Redirect URI: `http://localhost:5000/api/auth/google/callback`.
4. Copy `Client ID` and `Client Secret` into `.env`.

### Facebook OAuth2
1. Go to [Facebook Developers](https://developers.facebook.com/).
2. Create App -> Setup Facebook Login.
3. Add Valid OAuth Redirect URI: `http://localhost:5000/api/auth/facebook/callback`.
4. Copy `App ID` and `App Secret` into `.env`.

---

## 📷 Screenshots Overview

*(Include screenshots of Dashboard, Note Grid, Dark Mode, Profile Page, Auth Modals here)*

---

## 📄 License
Licensed under the [MIT License](LICENSE).
