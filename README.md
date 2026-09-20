# KaamDo

**Har Kaam, Sahi Insaan**

Digital marketplace connecting customers with verified technicians, workers, and contractors.

## Tech Stack

### Web (Admin Panel)
- Next.js 16 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Redux Toolkit + TanStack Query
- MongoDB/Mongoose
- Zod + React Hook Form

### Mobile (Customer & Worker App)
- React Native + Expo
- TypeScript
- Redux Toolkit + TanStack Query
- React Navigation
- Socket.IO (real-time chat)
- Razorpay (payments)
- Expo Notifications (push notifications)
- React Native SVG (logo)

## Features

### Customer
- OTP-based phone authentication
- Service category browsing
- Worker search with filters
- Job creation (multi-step form)
- Real-time job tracking
- In-app chat with workers
- Razorpay payment integration
- Rating & review system
- Dispute resolution
- Promo code support

### Worker
- Online/offline toggle
- Job request accept/reject
- Navigation to customer location
- OTP-based work start verification
- Additional charge requests
- Completion requests
- Attendance tracking (GPS geofencing)
- Earnings dashboard
- Payout history

### Admin
- Dashboard with analytics
- User management (customers, workers, contractors)
- Service category management
- Job & project oversight
- KYC approval workflow
- Payment & commission tracking
- Dispute resolution
- Promotional campaigns
- Attendance monitoring

## Project Structure

```
KaamDo/
├── web/                    # Next.js admin panel
│   ├── src/
│   │   ├── app/           # Pages & API routes
│   │   ├── components/    # UI components
│   │   ├── hooks/         # React Query hooks
│   │   ├── lib/           # Utilities, models, auth
│   │   └── store/         # Redux store
│   └── public/            # Static assets
├── mobile/                 # React Native Expo app
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # Reusable components
│   │   ├── constants/     # Colors, spacing, fonts
│   │   ├── hooks/         # API hooks
│   │   ├── navigation/    # React Navigation
│   │   ├── screens/       # App screens
│   │   ├── services/      # Business logic
│   │   ├── store/         # Redux store
│   │   └── types/         # TypeScript types
│   └── assets/            # Logo, icons, splash
└── docs/
    └── project_prd.md     # Product Requirements
```

## Getting Started

### Web
```bash
cd web
npm install
cp .env.example .env.local  # Configure environment
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

## Environment Variables

### Web (.env.local)
```
MONGODB_URI=mongodb://localhost:27017/kaamdo
JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Mobile (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
EXPO_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_xxx
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=kaamdo
```

## Brand

- **Logo:** Stylized "K" mark with blue vertical bar, orange checkmark, blue bottom curve
- **Primary:** #2563EB (Blue)
- **Secondary:** #F97316 (Orange)
- **Tagline:** Har Kaam, Sahi Insaan

## License

Private — KaamDo © 2026
