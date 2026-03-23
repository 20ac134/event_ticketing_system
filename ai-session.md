# ai-session.md

## Interaction 1: Debugging Event Creation API Failure

### Prompt (you sent to AI)
I'm encountering a NOT_FOUND error after deploying my Next.js app on Vercel.
The API route /api/events is not working in production, but works locally.
Can you help diagnose the issue?

### AI Response (trimmed)
The issue might be due to incorrect API route structure in Next.js App Router.

- Ensuring the route exists under `/app/api/events/route.ts`
- Verifying HTTP method exports (e.g., `export async function POST()`)
- Checking environment variables in Vercel
- Confirming the correct base URL is used in frontend requests

### What Your Team Did With It

- **What was useful**
  - Reminded us to verify environment variables on Vercel

- **What was incorrect or incomplete**
  - Did not immediately pinpoint that the issue was due to a missing deployment environment variable (`DATABASE_URL`)
  - Assumed routing issue when the actual issue was backend connection failure

- **How we verified and adapted**
  - Checked Vercel logs and confirmed database connection error
  - Added missing environment variables in Vercel dashboard manually
  - Retested API endpoints in production to confirm fix

---

## Interaction 2: Implementing Role-Based Access Control

### Prompt (you sent to AI)
How can I implement role-based access control in a Next.js app with users like organizer, staff, and attendee?

### AI Response (trimmed)
The following were suggested:

- Adding a `role` field to the user model
- Using middleware to protect routes
- Checking roles in API handlers
- Conditionally rendering UI components based on user role

### What Your Team Did With It

- **What was useful**
  - Provided a clear high-level structure for RBAC implementation
  - Suggested both backend and frontend enforcement

- **What was incorrect or not applicable**
  - Middleware approach suggested did not align well with our authentication library (Better Auth)
  - Some examples assumed JWT-based auth while our system used session-based auth

- **How we verified and adapted**
  - Implemented role checks inside API routes instead of middleware
  - Integrated role logic with Better Auth session handling
  - Tested different roles manually:
    - Organizer cannot access staff check-in page
    - Staff cannot purchase tickets
    - Attendee cannot access admin features

---

## Interaction 3: Fixing Real-Time Check-In Updates (SSE)

### Prompt (you sent to AI)
My Server-Sent Events (SSE) implementation is not updating the frontend in real time.
The client connects but doesn't receive updates consistently. What could be wrong?

### AI Response (trimmed)
The following were suggested:

- Ensuring proper `Content-Type: text/event-stream`
- Keeping the connection alive using headers
- Flushing data correctly after sending events
- Avoiding serverless timeout issues

### What Your Team Did With It

- **What was useful**
  - Correctly identified headers required for SSE
  - Highlighted potential issues with serverless environments

- **What was incorrect or misleading**
  - Did not account for Vercel serverless limitations affecting long-lived connections
  - Suggested techniques that worked locally but not in production

- **How we verified and adapted**
  - Confirmed SSE instability in Vercel environment
  - Added fallback polling mechanism for reliability
  - Tested real-time updates under multiple scenarios (multiple check-ins, rapid updates)
  - Verified functionality through manual testing and logging
