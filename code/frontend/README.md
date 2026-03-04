# Syncro – Frontend

> Universal Reverse Auction Marketplace — Phase 1 UI Prototype

## Prerequisites

| Tool | Minimum Version |
|------|----------------|
| [Node.js](https://nodejs.org/) | 18+ |
| npm | 9+ (comes with Node) |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:5173** (Vite default).

### 3. Build for production

```bash
npm run build
```

Output is written to the `dist/` folder.

---

## Navigating the App

Since the backend isn't integrated yet, authentication is mocked:

1. Go to **http://localhost:5173**
2. Click **Get Started** or **Login**
3. Fill in any email/password and submit — you'll be logged in automatically
4. Use the **Buyer / Seller** toggle in the top nav to switch roles

> All data displayed is mock data defined in `src/app/services/mockData.ts`

---

## Project Structure

```
src/
└── app/
    ├── components/
    │   ├── layout/          # AppLayout, TopNav, Sidebar
    │   ├── ui/              # Button, Card, Badge, Input, etc.
    │   ├── ProtectedRoute.tsx
    │   └── SellerOnboarding.tsx
    ├── context/
    │   └── AppContext.tsx   # Global state (role, theme, profiles)
    ├── pages/               # One file per route
    ├── services/
    │   └── mockData.ts      # All mock data (replace with API calls)
    └── routes.tsx           # Route definitions
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI, MUI |
| Animations | Motion (Framer Motion) |
| Charts | Recharts |
| Icons | Lucide React |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build production bundle to `dist/` |
