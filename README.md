# 🎓 DICT Support Portal

The **DICT Support Portal** (Directorate of Information and Communication Technology Support Portal) is a modern, web-based support ticket management system designed for **Redeemer's University**. It enables current students, staff, and prospective students to submit tickets, track issue progress, receive automated email notifications, and allows DICT administrators to manage, route, and resolve complaints efficiently.

---

## 🚀 Key Features

### 📩 Student & Staff Support
- **Ticket Submission**: Support for undergraduate (UG), postgraduate (PG), staff, and prospective students to lodge complaints with file attachments.
- **Categorized Department Routing**: Automatic routing of tickets based on nature of complaint:
  - **PG Portal Support** (`ict@run.edu.ng`)
  - **UG Portal Support** (`ict@run.edu.ng`)
  - **Email Support** (`ict@run.edu.ng`)
  - **Hardware / Network Support** (`ict@run.edu.ng`)
  - **Data Protection Support** (`dpo@run.edu.ng`)
  - **Staff Portal Support** (`ict@run.edu.ng`)
  - **Others** (`ict@run.edu.ng`)
- **Real-time Ticket Tracking**: Instant status lookup by Ticket ID and email address without requiring account login.

### ⚙️ Admin & Department Management
- **Role-Based Access Control**: Separate views and permissions for Super Admins, Department Admins, and Support Staff.
- **Department & Admin Management**: Manage support personnel assignments and handle department-specific tickets.
- **Analytics & Activity Dashboard**: Visual charts, ticket volume statistics, and resolution metrics.
- **Report Export**: Export admin activity and ticket analytics reports to PDF/CSV for departmental reporting.
- **Audit Logging**: Comprehensive admin activity tracking.

### ✉️ Email Notifications (Brevo Integration)
- Automated ticket creation confirmation emails to users.
- Notification emails to assigned DICT department staff.
- Automatic email alerts on ticket status changes (Open, In Progress, Resolved, Closed).
- Secure password reset email flow for admin accounts.

---

## 🔄 Recent Updates

- **DICT Rebranding**: Updated portal title, metadata, header banners, and email signatures to align with the **Directorate of Information and Communication Technology (DICT)**.
- **Refined Department Routing**: Replaced legacy department mappings with updated DICT support channels (PG, UG, Email, Hardware/Network, Data Protection, Staff Portal).
- **Admin Report Exporting**: Added export functionalities for generating PDF and structured reports from the admin dashboard.
- **Convex Email Actions**: Updated automated Brevo HTTP request payloads for uniform DICT Support Portal branding.

---

## 🛠️ Technology Stack

- **Frontend**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Lucide React Icons](https://lucide.dev/)
- **Backend & Database**: [Convex](https://www.convex.dev/) (Serverless database, reactive queries, mutations, and actions)
- **Database Migrations / Backup**: [Supabase](https://supabase.com/) PostgreSQL schemas & RLS policies
- **Email Delivery**: Brevo (formerly Sendinblue) Transactional Email API via Convex server actions
- **Reporting & Export**: `jspdf` & `jspdf-autotable`

---

## 📁 Project Structure

```
ticket-flow-uni/
├── convex/                     # Convex backend functions & database schema
│   ├── _generated/             # Generated Convex API bindings
│   ├── admin_analytics.js      # Analytics queries for admin dashboard
│   ├── auth.js                 # Authentication logic & password hashing
│   ├── departments.js          # Department admin mapping & queries
│   ├── emails.js               # Brevo transactional email actions
│   ├── roles.js                # Role definitions & RBAC checks
│   ├── schema.js               # Convex database schema definition
│   └── tickets.js              # Ticket CRUD & status mutation logic
├── src/
│   ├── components/             # Reusable UI components & Shadcn elements
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Helper utilities
│   ├── pages/                  # Application views & pages
│   │   ├── AdminDashboard.tsx           # Main admin control panel
│   │   ├── AdminActivityDashboard.tsx   # Activity & audit logs
│   │   ├── CreateTicket.tsx             # Ticket submission form
│   │   ├── TrackTicket.tsx              # Public ticket lookup
│   │   ├── DepartmentAdmin.tsx          # Department specific admin page
│   │   └── ...
│   ├── App.tsx                 # Application routes & layout
│   └── main.tsx                # Entry point
├── supabase/                   # Supabase SQL migration files
├── index.html                  # HTML entry template with metadata
├── package.json                # Dependencies and npm scripts
└── vite.config.ts              # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.x or higher)
- **npm** or **bun** / **yarn**
- A **Convex** account & deployment project

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Dalink-s-Nig-LTD/ticket-flow-uni.git
   cd ticket-flow-uni
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the project root:
   ```env
   VITE_CONVEX_URL=https://<your-convex-deployment>.convex.cloud
   ```

4. **Start the Convex Development Server**:
   ```bash
   npx convex dev
   ```

5. **Start the Frontend Local Development Server**:
   ```bash
   # On Windows (PowerShell/CMD)
   npm.cmd run dev

   # Or standard npm script
   npm run dev
   ```
   The application will be accessible at `http://localhost:8080/`.

---

## 📜 License

This software is developed for Redeemer's University Directorate of Information and Communication Technology (DICT). All rights reserved.
