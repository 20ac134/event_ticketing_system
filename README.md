# Event Ticket System

A full-stack event ticketing and check-in platform built with Next.js, featuring QR code tickets, staff check-in, real-time attendance updates, and role-based access control.

---

## 1. Team Information

| Name          | Student Number | Email                            |
|---------------|----------------|----------------------------------|
| Kairui Zhang  | 1007114640     | kairui.zhang@mail.utoronto.ca    |
| Leyang Zhang  | 1006032598     | leyang.zhang@mail.utoronto.ca    |
| Alvin Chang   | 1008109930     | chinhung.chang@mail.utoronto.ca  |

---

## 2. Motivation

Event management is a common real-world problem. Many small organizations lack access to affordable and customizable ticketing solutions. Our system addresses this by providing:

- A simple platform for organizers to create and manage events
- A seamless registration and ticketing experience for attendees
- A real-time check-in system for staff

This system is significant because it combines full-stack development, real-time systems, and role-based access control, which are essential skills in modern web applications.

---

## 3. Objectives

The main objectives of the event ticket system are to build a full-stack web application using Next.js, implement role-based access control using JWT-based authentication for organizers, staff, and attendees, and design a robust relational database schema. The system aims to support event creation and ticket purchasing while enabling QR code-based check-in functionality. Additionally, the project includes real-time attendance updates, integration of cloud storage for event image uploads, and deployment of the application to a production environment.

---

## 4. Technical Stack

### Project Structure

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

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client (Browser)                              │
│  Next.js App Router (React + TypeScript + Tailwind CSS + shadcn/ui)     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS / REST + SSE
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Vercel (Serverless)                              │
│  Next.js API Route Handlers  │  Server Components  │  Middleware        │
│  - /api/auth/* (login, register, logout, me)                            │
│  - /api/events/* (CRUD, ticket types, form fields, staff, poster)       │
│  - /api/events/[id]/checkin (staff check-in)                            │
│  - /api/events/[id]/attendance/stream (SSE for live attendance)         │
└─────────────────────────────────────────────────────────────────────────┘
                    │                                    │
                    │ Prisma ORM                         │ AWS SDK (S3 API)
                    ▼                                    ▼
┌──────────────────────────────┐         ┌───────────────────────────────┐
│   PostgreSQL (e.g. Vercel    │         │   Cloudflare R2               │
│   Postgres / Neon / Supabase)│         │   (S3-compatible object store)│
│   - Users, Events, Orders,   │         │   - Event poster images       │
│     Tickets, CheckIns, etc.  │         │   - Key: posters/{eventId}    │
└──────────────────────────────┘         └───────────────────────────────┘
```

### Frontend

| Technology | Purpose |
|------------|--------|
| **Next.js 16** | React framework with App Router; server and client components, API routes, middleware |
| **React 19** | UI components and client-side state |
| **TypeScript** | Static typing across app and API |
| **Tailwind CSS 4** | Utility-first styling; responsive layout |
| **shadcn/ui** | Pre-built accessible components (buttons, forms, cards, etc.) |
| **React Hook Form + Zod** | Form state and validation on registration and event forms |
| **Lucide React** | Icons |
| **Sonner** | Notifications |
| **qrcode** | Generate QR code data URLs for ticket display |
| **@zxing/browser** | Decode QR codes from camera stream during staff check-in |

### Backend

| Technology | Purpose |
|------------|--------|
| **Next.js API Route Handlers** | REST-style endpoints under `app/api/`; dynamic segments e.g. `[id]` |
| **Prisma ORM** | ORM for PostgreSQL; migrations, type-safe client |
| **PostgreSQL** | Primary database (e.g. Local Postgres, Neon) |
| **JWT Authentication (jose)** | Sign and verify session tokens (HS256); payload: `userId`, `role` |
| **bcryptjs** | Password hashing on register; verification on login |


### Database Design

The schema is defined in `prisma/schema.prisma`. Summary of main entities and relationships are shown below.

#### Core entities

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

#### Indexes

- Event: `createdById`, `startAt`  
- EventStaff: `eventId`, `userId`  
- TicketType: `eventId`  
- Order: `userId`, `eventId`, `status`  
- OrderItem: `orderId`, `ticketTypeId`  
- Ticket: `orderItemId`, `ticketTypeId`; unique on `tokenHash`, `checkInCode`  
- CheckIn: `checkedInById`, `checkedInAt`  
- FormField: `eventId`  
- RegistrationAnswer: `orderId`, `formFieldId`

### Cloud Storage

| Technology | Purpose |
|------------|--------|
| **Cloudflare R2** | S3-compatible object storage for event images |
| **AWS SDK (@aws-sdk/client-s3)** | PutObject, GetObject, DeleteObject for R2 (same API as S3) |

### DevOps & Deployment

| Technology | Purpose |
|------------|--------|
| **Vercel** | Hosts the Next.js application with serverless deployment and automatic builds |
| **Prisma Migrate** | Manages database schema migrations during development and deployment |
| **tsx** | Run TypeScript scripts without pre-compile (e.g., seeding and database reset) |

---

## 5. Features

### Event Management

- Create and edit events with title, description, location, and dates
- Define ticket types: name, price, and quantity limit
- Configure custom registration forms
- Assign staff members to events

### Cloud Storage

- Upload event images to Cloudflare R2
- Secure API-based access to images

### Ticket System

- Purchase tickets with simulated payment
- Generate unique QR code tickets for display

### Staff Check-in

- QR code scanning using camera or manual code entry
- Prevent duplicate check-ins

### Real-Time Attendance (Advanced Feature)

- Live updates using Server-Sent Events (SSE)
- Organizer dashboard shows live check-in count and recent check-ins

### Authentication & Roles (Advanced Feature)

- User registration and login using JWT-based authentication
- Role-based access: Organizer, Staff and Attendee

---

## 6. User Guide

### Attendee

1. Register/Login
2. Browse events under **Events**
3. Select event and enter required information and number of tickets to buy
4. Complete purchase
5. View tickets under **My Tickets**
6. Present QR code at event to staff

### Organizer

1. Login as organizer
2. Create and manage events under **Dashboard**
3. Provide event details (title, description, location, dates, tickets, and required attendee information)
4. Upload images
5. Assign staff using the **Assign Staff** link at the bottom of the **Dashboard** page
6. Monitor attendance in real time using the **Attendance** link at the bottom of the **Dashboard** page

### Staff

1. Login as staff
2. Access assigned events under **Staff**
3. Open the check-in page by selecting an event
4. Give permission to use device's camera
5. Scan QR code or enter code manually to complete attendee check-in

---

## 7. Development Guide

### Clone the repository

  ```bash
   git clone https://github.com/20ac134/event_ticketing_system
   cd event-ticket-system
   ```

### Install dependencies

  ```bash
  npm install
  ```
  This runs `postinstall` and executes `prisma generate`.

### Configure environment

- Define the following environment variables in the .env file

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/dbname`) |
| `JWT_SECRET` | Secret for signing/verifying JWT; use a long random string in production |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key ID |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET` | R2 bucket name |
| `R2_ENDPOINT` | R2 S3 API endpoint (e.g. `https://<account_id>.r2.cloudflarestorage.com`) |

### Database

Run migrations:

```bash
npx prisma migrate deploy
```

Seed data (default user accounts):

```bash
npm run seed
```

Reset dev data (optional):

```bash
npx tsx prisma/reset-dev-data.ts
```

### Run development server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 8. Deployment Information

### Neon - Cloud database

- Login to account
- Create new project
- Under project dashboard click **Connect** button at top right
- The connection string replaces the **DATABASE_URL** environment variable if you want to use a cloud database instead of local PostgreSQL

### Cloudfare R2 - Cloud image storage

- Login to account
- Under Build -> Database and Storage ->  R2 Object Storage (you can find **R2_ACCOUNT_ID** and **R2_ENDPOINT**)
- Create an API token with Object Read & Write permissions (provides **R2_ACCESS_KEY_ID** and **R2_SECRET_ACCESS_KEY**)
- Create Bucket and name the bucket (name will be **R2_BUCKET**)
- go to the bucket setting and enable Public Development URL

#### Storage and access:

- Upload: 
  - Organizers upload an event poster via the dashboard form. The API validates the file type (PNG, JPEG, JPG, WebP), then uploads it to R2 under the object key `posters/{eventId}`. A new upload for the same event overwrites the existing object.
- Storage: 
  - Files are stored only in the R2 bucket; the database stores the key (`posterFileKey`) and the public URL path used by the app: `/api/events/[id]/poster`.
- Access: 
  - Posters are served through the Next.js API route `GET /api/events/[id]/poster`. That route fetches the object from R2 with `GetObject` and streams the response with the correct `Content-Type`. No direct R2 URLs are exposed to the client; all access goes through this path.
- Delete: 
  - Implemented in `lib/r2.ts` for replacing or removing posters when needed.

#### Implementation:

- `lib/r2.ts`: 
  - Builds the S3 client from env vars; exports `uploadPoster`, `getPoster`, `deletePoster`, `isAllowedPosterType`.
- `app/api/events/[id]/poster/route.ts`: 
  - POST for upload (organizer-only), GET for public read (streams from R2).

#### Allowed types:

- PNG, JPEG, JPG, WebP (by MIME type and/or file extension).
- under 5MB.

### Vercel - System deployment

- Login to account
- Vercel Dashboard → Add New → Project → Import Git repository.
- Select the event-ticket-system repository and configure it (e.g., root directory: `.`).
- Framework Preset: **Next.js**.
- Build Command: `npm run build` (or leave default; project uses `prisma generate && next build` in `package.json`).
- Output: default (Next.js).
- Manually enter the environment variables defined in the `.env` file
- Deploy
- Live URL: https://event-ticketing-system-4lcq.vercel.app/
- Push to the connected branch in GitHub (e.g. `main`), Vercel will automatically build and redeploy.
- Or: Vercel Dashboard → Deployments → Redeploy.

### Troubleshooting

#### Build fails on Prisma:

- Ensure **DATABASE_URL** is set for the environment (e.g. Production) and that `prisma generate` runs (it’s part of `npm run build`). If you run `prisma migrate deploy` in build, ensure the database is reachable from Vercel.

####  Runtime DB errors:

- Check connection string (pooler vs direct, SSL). Some hosts require `?sslmode=require` or similar.

####  Poster upload fails:

- Verify all R2 env vars are set and the token has read/write to the bucket; check R2 endpoint format.

####  SSE not updating:

- Confirm the attendance stream endpoint is not cached; it uses `Cache-Control: no-cache` and `Connection: keep-alive`. Check browser Network tab for `/api/events/[id]/attendance/stream`.

---

## 9. AI Assistance & Verification (Summary)

### Where AI was used
- Debugging deployment and backend API issues (e.g., Vercel NOT_FOUND errors, environment variables)
- Understanding Next.js App Router structure and API routing
- Gaining insights about the role-based access control (organizer, staff, attendee)
- Troubleshooting real-time features using Server-Sent Events (SSE)

### Example limitation
AI sometimes produced incorrect or incomplete API logic, which required manual correction.

(Full example documented in `ai-session.md`)

### Verification methods
- Manual testing of all user flows:
  - Registration
  - Ticket purchase
  - Check-in
- Deployment verification:
  - Checking Vercel logs for runtime and environment variable errors
- API logging
- Edge case testing:
  - Duplicate check-ins
  - Invalid QR codes
  - Real-time update consistency (SSE fallback testing)

---

## 10. Individual Contributions

| Name | Contributions |
|------|----------------|
| **Kairui Zhang** | Backend API implementation; authentication and user session handling (JWT, login/register); database schema design and Prisma integration; deployment configuration (Vercel, environment variables). |
| **Leyang Zhang** | Frontend development (Next.js App Router, React components); UI/UX improvements and styling (Tailwind, shadcn/ui); file upload and cloud storage integration (R2, poster API); documentation updates. |
| **Alvin Chang** | Real-time attendance (SSE) and check-in flow; QR code ticket generation and staff check-in UI; testing and debugging; event and ticket type logic across frontend and API. |

---

## 11. Lessons Learned and Conclusion

Through this project, we gained valuable experience in full-stack application architecture, secure authentication and authorization, real-time data handling using Server-Sent Events (SSE), cloud storage integration, and deployment with debugging in a production environment. One major challenge we encountered was coordinating frontend and backend interactions, particularly for real-time updates and ensuring secure authentication across different user roles. 

In summary, this project demonstrates a scalable and practical event ticketing system while reinforcing key software engineering concepts and best practices.