# Club Management System (Review-1)

A professional, frontend-only Club Management System built with **HTML**, **CSS**, and **Vanilla JavaScript**. This project demonstrates core web development concepts including DOM manipulation, Event Handling, and LocalStorage persistence without any external libraries or frameworks.

## 🚀 Features

- **Authentication System**: 
  - Simulated login with role-based access (Admin & Member).
  - Secure session management using LocalStorage.
- **Interactive Dashboard**:
  - Dynamic summary cards (Members, Funds, Events).
  - Real-time recent activity feed.
- **Member Management (Admin)**:
  - Add, Edit, Delete members.
  - Real-time search/filtering.
- **Event Management**:
  - Create and manage events (Admin).
  - One-click registration (Member).
  - **Attendance Tracking**: Interactive checkbox list for admins.
- **Announcements**:
  - Post urgent updates (Admin).
  - Chronological feed for all users.
- **Fund Tracker**:
  - Income & Expense recording.
  - Automatic balance scaling and history view.

## 🛠️ Technology Stack

- **HTML5**: Semantic structure.
- **CSS3**: Custom properties (variables), Glassmorphism UI, Flexbox/Grid layouts.
- **JavaScript (ES6+)**: Modular logic, LocalStorage API, DOM manipulation.

## 📂 Folder Structure

```
/Club Management System
├── index.html          # Login Page
├── css/
│   └── style.css       # Global Styles & Theming
├── js/
│   ├── app.js          # Layout & Sidebar Logic
│   ├── auth.js         # Authentication Utilities
│   ├── storage.js      # Data Persistence Layer
│   ├── members.js      # Member Logic
│   ├── events.js       # Event Logic
│   ├── announcements.js# Announcement Logic
│   └── funds.js        # Fund Logic
└── pages/
    ├── dashboard.html  # Main Overview
    ├── members.html    # Member CRUD
    ├── events.html     # Event Operations
    ├── announcements.html
    └── funds.html      # Financial Tracker
```

## 🔑 Login Credentials

| Role | Username | Password | Access |
|------|----------|----------|--------|
| **Admin** | `admin` | `password` | Full Control |
| **Member** | `member` | `password` | View/Register |

## 📦 usage

1. Open `index.html` in your web browser.
2. Login with the credentials above.
3. **Note:** All data is saved to your browser's LocalStorage. To reset the app, clear your browser data or run `localStorage.clear()` in the console.

---
*Created for Review-1 Evaluation*
