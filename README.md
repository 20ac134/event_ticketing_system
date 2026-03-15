# Event Ticket System

A full-stack event ticketing and check-in platform built with Next.js, featuring QR code tickets, staff check-in, real-time attendance updates, and role-based access control. Suitable for university course final project evaluation.

---

## 1. Project Overview

This project implements an **event ticket system** that allows organizers to create events, define ticket types and registration forms, and manage staff assignments. Attendees can register for events, receive electronic tickets with QR codes, and staff can perform check-in via QR scanning or manual code entry. Organizers view **real-time attendance** via Server-Sent Events (SSE). The system uses **JWT-based authentication** with three roles: **Organizer**, **Staff**, and **Attendee**.

**Key capabilities:**

- **Organizers**: Create events, upload posters (stored in Cloudflare R2), manage ticket types and registration fields, assign staff, and monitor live attendance.
- **Staff**: Access assigned events and check in attendees by scanning QR codes or entering ticket codes.
- **Attendees**: Browse events, register (with custom form fields), complete a simulated payment, and view their tickets with QR codes for check-in.

The application is deployed on **Vercel** with **PostgreSQL** (via Prisma) and **Cloudflare R2** for poster storage.

---

## 2. Live Deployment

The project is deployed on **Vercel** and connected to **GitHub** for automatic deployment on push.

**Live application:** [https://event-ticket-system-sigma.vercel.app/](https://event-ticket-system-sigma.vercel.app/)

---

## 3. Features

| Feature | Description |
|--------|-------------|
| **User roles** | Organizer, Staff, Attendee with distinct permissions and UI flows |
| **Event management** | Create/edit events with title, description, location, dates, and poster image |
| **Ticket types** | Multiple ticket types per event (name, price, quantity limit) |
| **Custom registration forms** | Configurable form fields (text, email, phone, number, select, checkbox) per event |
| **QR code tickets** | Each ticket has a unique check-in code; QR code generated for display on “My Tickets” page |
| **Staff check-in** | Staff can scan QR (camera) or manually enter ticket code to check in attendees |
| **Real-time attendance** | Organizer dashboard shows live check-in count and recent check-ins via SSE |
| **Poster upload** | Event posters uploaded to Cloudflare R2 (S3-compatible), served via API |
| **Authentication** | Register, login, logout with JWT stored in HTTP-only cookie; session-based API access |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client (Browser)                               │
│  Next.js App Router (React + TypeScript + Tailwind CSS + shadcn/ui)     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS / REST + SSE
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Vercel (Serverless)                               │
│  Next.js API Route Handlers  │  Server Components  │  Middleware        │
│  - /api/auth/* (login, register, logout, me)                             │
│  - /api/events/* (CRUD, ticket types, form fields, staff, poster)        │
│  - /api/events/[id]/checkin (staff check-in)                             │
│  - /api/events/[id]/attendance/stream (SSE for live attendance)          │
└─────────────────────────────────────────────────────────────────────────┘
                    │                                    │
                    │ Prisma ORM                         │ AWS SDK (S3 API)
                    ▼                                    ▼
┌──────────────────────────────┐         ┌──────────────────────────────┐
│   PostgreSQL (e.g. Vercel    │         │   Cloudflare R2               │
│   Postgres / Neon / Supabase)│         │   (S3-compatible object store)│
│   - Users, Events, Orders,   │         │   - Event poster images       │
│     Tickets, CheckIns, etc.  │         │   - Key: posters/{eventId}    │
└──────────────────────────────┘         └──────────────────────────────┘
```

- **Frontend**: Single Next.js application; pages and API routes run on the same deployment.
- **Backend**: REST-style API routes in `app/api/`; one SSE endpoint for attendance stream.
- **Auth**: JWT issued on login/register, stored in HTTP-only cookie; middleware or route handlers validate token and enforce role (organizer/staff/attendee).
- **Database**: All persistent data in PostgreSQL; Prisma handles schema and migrations.
- **Storage**: Poster files in R2; metadata (e.g. `posterFileKey`, `posterUrl`) in `Event` table.

---

## 5. Technology Stack

### Frontend

| Technology | Purpose |
|------------|--------|
| **Next.js 16** | React framework with App Router; server and client components, API routes, middleware |
| **React 19** | UI components and client-side state |
| **TypeScript** | Static typing across app and API |
| **Tailwind CSS 4** | Utility-first styling; responsive layout |
| **shadcn/ui** | Pre-built accessible components (buttons, forms, cards, etc.) |
| **React Hook Form** | Form state and validation on registration and event forms |
| **Zod** | Schema validation (shared between client and API) |
| **Lucide React** | Icons |
| **Sonner** | Toast notifications |
| **qrcode** | Generate QR code data URLs for ticket display |
| **@zxing/browser** | Decode QR codes from camera stream (staff check-in) |

### Backend

| Technology | Purpose |
|------------|--------|
| **Next.js API Route Handlers** | REST-style endpoints under `app/api/`; dynamic segments e.g. `[id]` |
| **Prisma** | ORM for PostgreSQL; migrations, type-safe client |
| **PostgreSQL** | Primary database (e.g. Vercel Postgres, Neon, Supabase) |
| **JWT (jose)** | Sign and verify session tokens (HS256); payload: `userId`, `role` |
| **bcryptjs** | Password hashing on register; verification on login |
| **Zod** | Request body validation in API routes |

### Cloud Storage

| Technology | Purpose |
|------------|--------|
| **Cloudflare R2** | S3-compatible object storage for event poster images |
| **AWS SDK (@aws-sdk/client-s3)** | PutObject, GetObject, DeleteObject for R2 (same API as S3) |

### DevOps & Deployment

| Technology | Purpose |
|------------|--------|
| **Vercel** | Hosting for Next.js app; serverless functions and edge where applicable |
| **Prisma Migrate** | Database schema migrations (run in build or deploy step) |
| **tsx** | Run TypeScript scripts (e.g. seed, reset-dev-data) without pre-compile |

---

## 6. Database Design

The schema is defined in `prisma/schema.prisma`. Summary of main entities and relationships:

### Core entities

- **User**  
  - `id`, `email` (unique), `passwordHash`, `name`, `role` (enum: ORGANIZER, STAFF, ATTENDEE), timestamps.  
  - Relations: events organized, staff assignments, orders, check-ins performed, tickets checked in.

- **Event**  
  - `id`, `title`, `description`, `location`, `startAt`, `endAt`, `posterFileKey`, `posterUrl`, `createdById`, timestamps.  
  - Relations: organizer (User), staff (EventStaff), ticket types, orders, form fields.

- **EventStaff**  
  - Links User (staff) to Event; unique `(eventId, userId)`. Used to authorize check-in and staff UI.

- **TicketType**  
  - Per event: `name`, `price`, `quantityLimit`, `soldCount`; links to Event and OrderItems/Tickets.

- **Order**  
  - `userId`, `eventId`, `status` (PENDING, PAID, CANCELLED), `paidAt`, timestamps.  
  - Relations: order items, registration answers.

- **OrderItem**  
  - Links Order to TicketType with `quantity`, `unitPrice`; has many Tickets.

- **Ticket**  
  - `orderItemId`, `ticketTypeId`, `tokenHash` (unique), `checkInCode` (unique, used for QR and check-in lookup), `attendeeName`, `status` (VALID, CHECKED_IN), `checkedInAt`, `checkedInById`.  
  - One-to-one with CheckIn when checked in.

- **CheckIn**  
  - `ticketId` (unique), `checkedInById`, `checkedInAt`. Used for attendance counts and SSE payload.

- **FormField**  
  - Per event: `label`, `type` (TEXT, EMAIL, PHONE, NUMBER, SELECT, CHECKBOX), `required`, `options` (JSON), `sortOrder`.

- **RegistrationAnswer**  
  - `orderId`, `formFieldId`, `value`; unique `(orderId, formFieldId)`.

### Indexes

- Event: `createdById`, `startAt`  
- EventStaff: `eventId`, `userId`  
- TicketType: `eventId`  
- Order: `userId`, `eventId`, `status`  
- OrderItem: `orderId`, `ticketTypeId`  
- Ticket: `orderItemId`, `ticketTypeId`; unique on `tokenHash`, `checkInCode`  
- CheckIn: `checkedInById`, `checkedInAt`  
- FormField: `eventId`  
- RegistrationAnswer: `orderId`, `formFieldId`

---

## 7. Cloud Storage Integration (Poster / Image Upload)

**Provider:** Cloudflare R2 (S3-compatible).

**Storage and access:**

- **Upload:** Organizers upload an event poster via the dashboard form. The API validates the file type (PNG, JPEG, JPG, WebP), then uploads it to R2 under the object key `posters/{eventId}`. A new upload for the same event overwrites the existing object.
- **Storage:** Files live in the R2 bucket only; the database stores the key (`posterFileKey`) and the **public URL path** used by the app: `/api/events/[id]/poster`.
- **Access:** Posters are served through the Next.js API route `GET /api/events/[id]/poster`. That route fetches the object from R2 with `GetObject` and streams the response with the correct `Content-Type`. No direct R2 URLs are exposed to the client; all access goes through this path.
- **Delete:** Implemented in `lib/r2.ts` for replacing or removing posters when needed.

**Implementation:**

- `lib/r2.ts`: Builds the S3 client from env vars; exports `uploadPoster`, `getPoster`, `deletePoster`, `isAllowedPosterType`.
- `app/api/events/[id]/poster/route.ts`: POST for upload (organizer-only), GET for public read (streams from R2).

**Allowed types:** PNG, JPEG, JPG, WebP (by MIME type and/or file extension).

---

## 8. Development Setup

Follow these steps to run the project locally.

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** (or yarn/pnpm)
- **PostgreSQL** (local or hosted, e.g. Docker, Neon, Supabase)
- (Optional) **Cloudflare R2** bucket and API credentials for poster upload

### Step-by-step

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-ticket-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This runs `postinstall` and executes `prisma generate`.

3. **Configure environment**
   - Copy `.env.example` to `.env.local` (or `.env`).
   - Set at least:
     - `DATABASE_URL`: PostgreSQL connection string.
     - `JWT_SECRET`: Long random string (e.g. 32+ chars) for signing JWTs.
   - For poster upload locally, add R2 variables (see Environment Variables below).

4. **Database**
   - Ensure PostgreSQL is running and `DATABASE_URL` is correct.
   - Run migrations:
     ```bash
     npx prisma migrate deploy
     ```
   - (Optional) Seed data:
     ```bash
     npm run seed
     ```
   - (Optional) Reset dev data:
     ```bash
     npx tsx prisma/reset-dev-data.ts
     ```

5. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

6. **Backfill check-in codes (if needed)**
   If tickets exist without `checkInCode`, run:
   ```bash
   npx tsx prisma/backfill-checkin-code.ts
   ```

---

## 9. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/dbname`) |
| `JWT_SECRET` | Yes | Secret for signing/verifying JWT; use a long random string in production |
| `R2_ACCOUNT_ID` | For R2 | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | For R2 | R2 API token access key ID |
| `R2_SECRET_ACCESS_KEY` | For R2 | R2 API token secret |
| `R2_BUCKET` | For R2 | R2 bucket name |
| `R2_ENDPOINT` | For R2 | R2 S3 API endpoint (e.g. `https://<account_id>.r2.cloudflarestorage.com`) |

- **Local:** Use `.env.local` or `.env`; do not commit secrets.
- **Vercel:** Set all variables in Project → Settings → Environment Variables for Production/Preview/Development as needed.

---

## 10. Deployment Guide (Vercel)

### 10.1 Prerequisites

- Vercel account
- GitHub (or GitLab/Bitbucket) repository connected to Vercel
- Hosted PostgreSQL (e.g. Vercel Postgres, Neon, Supabase)
- Cloudflare R2 bucket and API credentials (for poster upload)

### 10.2 Database

1. Create a PostgreSQL database (e.g. Vercel Postgres, Neon, Supabase).
2. Copy the connection string (direct or pooled, as required by your provider).
3. Use this as `DATABASE_URL` in Vercel.

### 10.3 R2 (optional but recommended for posters)

1. In Cloudflare Dashboard: R2 → Create bucket (e.g. `event-posters`).
2. R2 → Manage R2 API Tokens → Create API token with Object Read & Write for the bucket.
3. Note: Account ID, Access Key ID, Secret Access Key, and endpoint (e.g. `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`).
4. Add these as environment variables in Vercel (see below).

### 10.4 Vercel project setup

1. **Import project**
   - Vercel Dashboard → Add New → Project → Import Git repository.
   - Select the event-ticket-system repo and configure (e.g. root directory: `.`).

2. **Build and output**
   - Framework Preset: **Next.js**.
   - Build Command: `npm run build` (or leave default; project uses `prisma generate && next build` in `package.json`).
   - Output: default (Next.js).

3. **Environment variables**
   In Project → Settings → Environment Variables, add:

   | Name | Value | Environments |
   |------|--------|--------------|
   | `DATABASE_URL` | Your PostgreSQL connection string | Production, Preview (and Development if needed) |
   | `JWT_SECRET` | Long random string (e.g. 32+ chars) | Production, Preview, Development |
   | `R2_ACCOUNT_ID` | Cloudflare account ID | Production, Preview |
   | `R2_ACCESS_KEY_ID` | R2 access key | Production, Preview |
   | `R2_SECRET_ACCESS_KEY` | R2 secret key | Production, Preview |
   | `R2_BUCKET` | R2 bucket name | Production, Preview |
   | `R2_ENDPOINT` | R2 S3 endpoint URL | Production, Preview |

   - For Production, mark sensitive values as “Encrypted” and restrict to Production if desired.
   - Redeploy after changing env vars.

4. **Migrations**
   - Option A (recommended): Run migrations in the build step. Ensure `DATABASE_URL` is available at build time and add to `package.json`:
     ```json
     "build": "prisma generate && prisma migrate deploy && next build"
     ```
   - Option B: Run migrations manually before first deploy:
     ```bash
     DATABASE_URL="your-production-url" npx prisma migrate deploy
     ```

5. **Deploy**
   - Push to the connected branch (e.g. `main`); Vercel will build and deploy.
   - Or: Vercel Dashboard → Deployments → Redeploy.

6. **Post-deploy**
   - Open the deployed URL and test: register, login, create event, upload poster, create ticket type, register as attendee, check-in as staff, view attendance stream as organizer.
   - If you use R2, confirm poster upload and `GET /api/events/[id]/poster` returns the image.

### 10.5 Troubleshooting

- **Build fails on Prisma:** Ensure `DATABASE_URL` is set for the environment (e.g. Production) and that `prisma generate` runs (it’s part of `npm run build`). If you run `prisma migrate deploy` in build, ensure the database is reachable from Vercel.
- **Runtime DB errors:** Check connection string (pooler vs direct, SSL). Some hosts require `?sslmode=require` or similar.
- **Poster upload fails:** Verify all R2 env vars are set and the token has read/write to the bucket; check R2 endpoint format.
- **SSE not updating:** Confirm the attendance stream endpoint is not cached; it uses `Cache-Control: no-cache` and `Connection: keep-alive`. Check browser Network tab for `/api/events/[id]/attendance/stream`.

---

## 11. Project Structure

```
event-ticket-system/
├── app/
│   ├── api/                          # API route handlers
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── me/route.ts
│   │   └── events/
│   │       ├── route.ts               # GET list, POST create
│   │       └── [id]/
│   │           ├── route.ts           # GET one, PATCH, DELETE
│   │           ├── poster/route.ts    # GET poster image, POST upload
│   │           ├── ticket-types/route.ts
│   │           ├── ticket-types/[ticketTypeId]/route.ts
│   │           ├── form-fields/route.ts
│   │           ├── staff/route.ts     # list, assign staff
│   │           ├── orders/route.ts    # create order, list orders
│   │           ├── checkin/route.ts   # POST check-in (staff)
│   │           └── attendance/
│   │               └── stream/route.ts # SSE for live attendance
│   ├── dashboard/                     # Organizer UI
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── events/
│   │       ├── new/page.tsx
│   │       └── [id]/
│   │           ├── page.tsx
│   │           ├── staff/page.tsx
│   │           ├── attendance/page.tsx (+ AttendanceLive.tsx)
│   │           ├── PosterUpload.tsx, TicketTypesSection.tsx, RegistrationFieldsSection.tsx
│   │           └── AddStaffForm.tsx
│   ├── events/                        # Public event pages
│   │   └── [id]/
│   │       ├── page.tsx
│   │       ├── register/page.tsx
│   │       └── EventPurchaseForm.tsx
│   ├── staff/                         # Staff UI
│   │   ├── page.tsx
│   │   └── checkin/[id]/page.tsx, CheckinForm.tsx
│   ├── my-tickets/page.tsx            # Attendee tickets + QR
│   ├── login/page.tsx, LoginForm.tsx
│   ├── register/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── auth.ts                        # JWT, session, requireOrganizer/Staff/Attendee
│   ├── db.ts                          # Prisma client singleton
│   ├── r2.ts                          # R2 upload/get/delete poster
│   └── attendance-sse.ts              # SSE subscribe/notify, getAttendancePayload
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   ├── reset-dev-data.ts
│   └── backfill-checkin-code.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 12. Individual Contributions

| Name | Contributions |
|------|----------------|
| **Alvin Chang** | Backend API implementation; authentication and user session handling (JWT, login/register); database schema design and Prisma integration; deployment configuration (Vercel, environment variables). |
| **Leyang Zhang** | Frontend development (Next.js App Router, React components); UI/UX improvements and styling (Tailwind, shadcn/ui); file upload and cloud storage integration (R2, poster API); documentation updates. |
| **Alvin Chang** | Real-time attendance (SSE) and check-in flow; QR code ticket generation and staff check-in UI; testing and debugging; event and ticket type logic across frontend and API. |

---

## 13. AI Assistance

AI tools (such as ChatGPT) were used during development for:

- Documentation (README refinement)
- Debugging and refactoring suggestions
- Code explanation and clarification
- General development productivity support

All design decisions, architecture, and final implementation have been reviewed and approved by the project authors. AI was used as a productivity aid only; the work remains our own and is submitted in accordance with the course’s academic integrity guidelines.

---

## 14. License

This project is submitted as a university final project. All rights reserved by the authors. No reuse or distribution without permission.
