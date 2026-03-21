# Household of Faith Multipurpose Cooperative - Ajo Savings Platform

Household of Faith is a digital rotational savings (Ajo/Esusu) application built with Next.js and Supabase. It automates trust-based savings circles, handles wallet transactions securely, and manages payout cycles automatically.

## 🛠 Tech Stack
* **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide React
* **Backend:** Supabase (Auth, Database, Edge Functions)
* **Language:** TypeScript
* **State/Feedback:** Sonner (Toasts), Server Actions
* **Deployment:** Vercel

## 📂 Project Structure

```text
household-of-faith
├── app/
│   ├── auth/                      # Authentication page (Login/Register)
│   │   └── page.tsx  
│   ├── components/                # Shared UI Components
│   │   └── Modal.tsx              # Reusable Modal Wrapper
│   ├── dashboard/                 # Protected Routes (Requires Login)
│   │   ├── admin/
│   │   │   ├── actions.ts         # Admin Server Actions
│   │   │   ├── page.tsx           # Admin Dashboard & Stats
│   │   ├── ajo/
│   │   │   ├── [id]/              # Dynamic Group Dashboard
│   │   │   ├── actions.ts         # Core Logic: Contributions, Private Groups, Auto-Payouts
│   │   │   └── page.tsx          
│   │   ├── profile/
│   │   │   └── page.tsx      
│   │   ├── wallet/
│   │   │   └── page.tsx
│   │   ├── layout.tsx             # Dashboard Shell (Sidebar)
│   │   └── page.tsx               # User Overview
│   ├── layout.tsx                 # Root Layout (Branding, Fonts)
│   └── page.tsx                   # Landing Page
├── lib/  
│    ├── supabase  
│         └── client.ts                             
└── middleware.ts                  # Route Protection (Supabase Auth)

```

## ✨ Key Features

1. **Authentication & KYC:** Secure email login and admin-managed identity verification.
2. **Wallet System:** Fund wallet, withdraw funds, and real-time balance updates.
3. **Ajo Groups:** Create Public or Private groups with automated cycles and smart payouts.
4. **Admin Dashboard:** Approve/Reject user verification and system overview.

## ⚙️ Local Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Environment Variables:**
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email
```

3. **Run the server:**
```bash
npm run dev
```

## 📄 License

This project is licensed under the MIT License.
