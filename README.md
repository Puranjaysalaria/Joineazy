# JoinEazy - Assignment & Review Dashboard

A premium, recruiter-impressive Assignment & Review Dashboard built with **React.js** and **Tailwind CSS**. Designed to demonstrate high-end frontend engineering, modern UI/UX principles, and robust state management.

## 🚀 Key Features

- **Role-Based Access**: Specialized views for Admins (Professors) and Students.
- **Dynamic Floating Backdrop**: Animated background orbs creating a modern SaaS atmosphere.
- **Admin Insights Dashboard**: Real-time statistics header (Total Students, Active Assignments).
- **Student Personal Hub**: Tailored welcome card with a dynamic course progress ring.
- **Double-Verification Flow**: Secure student submission process with confirmation modals.
- **Resubmission & Editing**: Students can update their work as long as the deadline hasn't passed.
- **Strict Deadline Enforcement**: Automated 'Locking' of submissions and disabling of 'Submit' buttons once the due date is exceeded.
- **Premium Confirmation Modals**: Portalled, glassmorphism overlays with warning icons.

## 🏗️ Architecture & Design Decisions

### Architecture Overview
The application is a **Single Page Application (SPA)** built with **Vite + React**. 
- **State Management**: Uses a centralized state in `App.jsx` with a mock database synchronized to `localStorage` for session persistence.
- **Portals**: Employs **React Portals** to render modals and toasts. This ensures overlays are not clipped by parent containers and maintain perfect z-index layering.
- **Animations**: Custom Tailwind keyframes for the "Floating Backdrop" and slide-in effects to provide a premium, app-like feel.

### Design Decisions
- **Glassmorphism**: Chosen for its modern, premium aesthetic. Uses `backdrop-blur`, subtle borders, and low-opacity surfaces.
- **Color Palette**: A curated dark theme using deep violets and emerald greens to signify "Premium" and "Success".
- **UX Logic**: Mandatory file attachment and double-confirmation for submissions to mimic real-world educational platforms.

## 📂 Folder Structure

```text
joineazy/
├── src/
│   ├── components/
│   │   ├── AdminDashboard.jsx    # Assignment creation, deletion & tracking
│   │   ├── StudentDashboard.jsx  # Personal task list & submission workflow
│   │   └── Login.jsx             # Role-based entry point
│   ├── App.jsx                   # Central state & routing logic
│   ├── index.css                 # Design system & custom animations
│   └── main.jsx                  # React entry point
├── tailwind.config.js            # Design tokens & extended theme
└── README.md                     # Project documentation
```

## 🛠️ Project Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Puranjaysalaria/Joineazy.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start development server**:
   ```bash
   npm run dev
   ```

---
Built with ❤️ for the Internship Application.
