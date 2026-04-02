# EazyAssign — Student & Group Assignment Management

A **premium educational SaaS** built with React + Tailwind CSS, demonstrating role-based workflows, group collaboration, and modern UI/UX design principles.

> **Demo Credentials**
> - **Student**: Click "Student" → pick any name  
> - **Professor**: Click "Admin" → passcode: `admin123`

---

## 🌐 Live Demo

[View on Netlify →](https://joineazy.netlify.app) <!-- update after deploy -->

---

## ✨ Features

### Professor Flow
- **Course Dashboard** — Overview of all courses (task count, enrolled students)
- **Assignment Management** — Create, edit, delete assignments with:
  - Title, Description, Deadline (date + time)
  - OneDrive link
  - **Submission Type: Individual or Group** (toggle button)
- **Search & Filter** — Find assignments by name or filter by status (All / Pending / Completed)
- **Student Progress Tab** — Per-student submission tracking with progress bars, grade/feedback modals, and urgent reminder bells
- **Grading Modal** — Grade selector (A+ to F) with written feedback that appears on the student's card

### Student Flow
- **Course Dashboard** — Enrolled courses with circular progress rings and completion stats
- **Assignment List** — Per-course view showing submission type badges, deadlines, and acknowledgment status
- **Individual Acknowledgment** — One-click confirmation with **timestamp recording**
- **Group Acknowledgment** — Group leader acknowledges for all members; non-leaders see "waiting for leader" state
- **No Group Prompt** — Clear actionable message if student has no group on a group assignment
- **Group Panel** — Create a group (become leader), join existing groups, or leave — all in-app

### System-Wide
- Urgent Reminder notifications (pulsing badge, banner on student dashboard)
- Glassmorphism UI with ambient colour orbs + subtle animations
- Toast notifications for all actions
- Data persists across page refreshes via localStorage
- Schema versioning prevents stale data after updates

---

## 🎨 Design Choices

### Tech Stack
| Tool | Purpose |
|---|---|
| **React 19 + Vite** | Fast SPA with hot module reload |
| **Tailwind CSS** | Utility-first styling with custom design tokens |
| **Lucide React** | Consistent icon system |
| **React Portal** | Modals rendered above all other UI layers |
| **localStorage** | Client-side persistence (mock API pattern) |

### Visual Design Philosophy
- **Dark glassmorphism** — multi-layer backdrop blur panels with inset white borders give depth without weight
- **Colour-coded courses** — each course has a primary/success/warning theme that flows through the card, progress ring, and badge consistently
- **Micro-animations** — `slideDown`, `slideUp`, `modalIn`, and `fadeIn` keyframes provide sleek transitions without overwhelming the user
- **Mobile-first grid** — 1 → 2 → 3 column layouts at `sm` → `lg` breakpoints; modals use `max-h-[90vh] overflow-y-auto` for small screens

### Architecture Pattern — Mock API Layer
```
src/
  api/
    mockApi.js          ← async functions (swap with real fetch() for backend)
  components/
    ProfDashboard.jsx   ← Professor flow (courses + assignment management)
    StudentDashboard.jsx← Student flow (courses + group logic)
    CourseCard.jsx      ← Shared, colour-aware course card
    ProgressRing.jsx    ← SVG circular progress indicator
    Login.jsx           ← Role-based auth modal
  App.jsx               ← Central state, SPA router, DB mutations
```

The mock API layer uses async `delay()` functions that mirror real REST call patterns. Swapping to a real backend only requires changing functions in `src/api/mockApi.js` — zero component changes needed.

---

## 🗂️ Component Structure

```
App
├── Login
│   ├── Student Selection Modal (Portal)
│   └── Admin Passcode Modal (Portal)
├── ProfDashboard
│   ├── ProfCourseDashboard (view: dashboard)
│   │   └── CourseCard ×n
│   └── ProfCourseDetail (view: course)
│       ├── Filter Bar (search + status filter)
│       ├── Assignment Card ×n
│       ├── Student Progress Tab
│       │   └── ProgressRing + Per-assignment rows
│       ├── Create/Edit Assignment Modal (Portal)
│       ├── Delete Confirmation Modal (Portal)
│       ├── Grading Modal (Portal)
│       └── Reminder Confirmation Modal (Portal)
└── StudentDashboard
    ├── StudentCourseDashboard (view: dashboard)
    │   ├── Reminder Banner
    │   ├── ProgressRing (overall)
    │   └── CourseCard ×n
    └── StudentCourseDetail (view: course)
        ├── GroupPanel (create / join / leave)
        ├── AssignmentCard ×n
        │   ├── Individual Acknowledgment button
        │   ├── Group Leader Acknowledge button
        │   ├── "Waiting for leader" state
        │   └── "No group" warning prompt
        ├── Confirm Acknowledgment Modal (Portal)
        └── Group Confirm Modal (Portal)
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+

### Run Locally

```bash
# Clone the repo
git clone https://github.com/Puranjaysalaria/Joineazy.git
cd Joineazy

# Install dependencies
npm install

# Start dev server
npm run dev
```

App runs at **http://localhost:5173**

### Build for Production

```bash
npm run build
# Output in /dist — deploy this folder to Netlify or Vercel
```

### Deploy to Netlify (Drag & Drop)
1. Run `npm run build`
2. Go to [netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `/dist` folder onto the page
4. Done — live URL generated instantly

### Deploy to Netlify (CLI)
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

---

## 📸 UI Screenshots

### Professor Dashboard
Full course overview with stats and per-course task/student counts.

### Course Assignment Management
Assignments with Individual/Group type badges, search + filter, and progress bars.

### New Assignment Modal
Title, description, deadline, OneDrive link, and submission type toggle (Individual/Group).

### Student Course Dashboard
Enrolled courses with circular progress rings showing completion percentage.

### Student Assignment Detail
Assignment cards with acknowledgment buttons, group panel, and timestamp recording.

### Group Management Panel
Create a new group (become leader), join an existing group, or leave — all without leaving the page.

### Submission Confirmation Modal
Double-confirmation with timestamp preview before recording acknowledgment.

---

## 📋 Mock Data

Pre-seeded with:
- **1 Professor** (Prof. Anderson)
- **6 Students** (Alex, Jordan, Taylor, Morgan, Casey, Peyton)
- **3 Courses** (UXD101, FED201, DS301)
- **5 Assignments** (mix of Individual + Group types)
- **3 Groups** across courses
- **1 Pre-existing submission** (Alex → UX Research Case Study)

Data resets automatically when the schema version updates — preventing stale data across major code changes.

---

## 🔧 Environment

| Variable | Value |
|---|---|
| Admin Passcode | `admin123` |
| DB Version | `2.0.0` |
| Framework | React 19 + Vite 8 |
| CSS | Tailwind CSS 3 |
