# Backend Design for Hero Showroom Website

## Goal

Turn the current static HTML/CSS/JS website into a real web application with secure accounts, persistent bookings, service requests, payments, support tickets, and an admin dashboard.

## Recommended Stack

Use a custom backend because the site needs secure authentication, booking control, payment verification, and admin management.

- Runtime: Node.js
- API framework: Express
- Database: PostgreSQL in production, SQLite for simple local development if needed
- ORM: Prisma
- Authentication: secure HTTP-only cookie session or JWT stored in HTTP-only cookies
- Password security: bcrypt or argon2 password hashing
- Payment gateway: Razorpay, PayU, Stripe, or another provider selected for your business
- File/media storage: keep current static assets locally at first; move uploads to cloud storage later

## Application Modules

### 1. Auth and Users

Purpose:
- Register users
- Login/logout
- Read/update profile
- Protect booking/account/admin routes

Main rules:
- Never store plain passwords
- Do not trust user identity from localStorage
- Use roles: `customer`, `staff`, `admin`

### 2. Vehicle Catalog

Purpose:
- Store vehicle models, variants, colors, prices, images, and availability
- Stop hardcoding prices only in HTML

This lets booking pages fetch live model and variant data from the backend.

### 3. Bookings

Purpose:
- Save vehicle bookings and service bookings permanently
- Track status: `pending`, `confirmed`, `cancelled`, `completed`, `rescheduled`
- Store customer details, selected vehicle/service, preferred date, preferred slot, and payment status

### 4. Payments

Purpose:
- Create payment orders
- Verify payment signatures/webhooks server-side
- Mark bookings as paid only after verified payment confirmation

Do not confirm paid bookings from frontend-only JavaScript.

### 5. Service Appointments

Purpose:
- Store available service types
- Handle preferred dates and time slots
- Prevent duplicate booking of the same slot if required

### 6. Support and Contact

Purpose:
- Save contact form messages
- Save support tickets from user accounts
- Let staff/admin reply and update ticket status

### 7. Admin Dashboard

Purpose:
- View users, bookings, payments, service requests, support tickets, and contact messages
- Update booking status
- Export reports
- Manage vehicle catalog and offers

## Core Database Tables

### users

```text
id
name
email
phone
password_hash
role
created_at
updated_at
```

### user_profiles

```text
id
user_id
address
city
state
pincode
created_at
updated_at
```

### vehicles

```text
id
slug
name
category
engine
description
main_image
is_active
created_at
updated_at
```

### vehicle_variants

```text
id
vehicle_id
name
price
booking_amount
colors_json
image
is_active
created_at
updated_at
```

### service_types

```text
id
name
description
price
is_active
created_at
updated_at
```

### bookings

```text
id
booking_number
user_id
booking_type          vehicle | service
vehicle_id
variant_id
service_type_id
customer_name
customer_phone
customer_email
customer_address
customer_city
customer_pincode
preferred_date
preferred_slot
amount
status
payment_status        unpaid | pending | paid | failed | refunded
created_at
updated_at
```

### payments

```text
id
booking_id
provider
provider_order_id
provider_payment_id
amount
currency
status
raw_payload_json
created_at
updated_at
```

### support_tickets

```text
id
ticket_number
user_id
category
subject
message
status               open | in_progress | resolved | closed
staff_response
created_at
updated_at
```

### contact_messages

```text
id
name
email
phone
message
status               new | contacted | closed
created_at
updated_at
```

## API Design

Base URL:

```text
/api
```

### Auth

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PATCH  /api/users/me
```

### Vehicles

```text
GET    /api/vehicles
GET    /api/vehicles/:slug
GET    /api/vehicles/:slug/variants
```

### Bookings

```text
POST   /api/bookings
GET    /api/bookings/me
GET    /api/bookings/:id
PATCH  /api/bookings/:id/reschedule
PATCH  /api/bookings/:id/cancel
```

### Payments

```text
POST   /api/payments/create-order
POST   /api/payments/verify
POST   /api/payments/webhook
GET    /api/payments/:bookingId
```

### Service

```text
GET    /api/service-types
GET    /api/service-slots?date=YYYY-MM-DD
```

### Support and Contact

```text
POST   /api/contact
POST   /api/support-tickets
GET    /api/support-tickets/me
```

### Admin

```text
GET    /api/admin/bookings
PATCH  /api/admin/bookings/:id/status
GET    /api/admin/users
GET    /api/admin/contact-messages
PATCH  /api/admin/contact-messages/:id/status
GET    /api/admin/support-tickets
PATCH  /api/admin/support-tickets/:id
POST   /api/admin/vehicles
PATCH  /api/admin/vehicles/:id
```

## Main User Flows

### Register/Login

1. User submits name, email, phone, password.
2. Backend validates input.
3. Backend hashes password.
4. Backend creates user.
5. Backend creates secure session cookie.
6. Frontend calls `/api/auth/me` to show account state.

### Vehicle Booking

1. User selects vehicle, variant, and color.
2. Frontend calls `POST /api/bookings`.
3. Backend creates booking with `payment_status = unpaid`.
4. Frontend calls `POST /api/payments/create-order`.
5. Payment provider handles payment.
6. Backend verifies payment.
7. Backend marks booking as `confirmed` and `paid`.

### Service Booking

1. User selects service type, preferred date, and slot.
2. Backend checks slot availability.
3. Backend creates service booking.
4. Payment is optional depending on service type.
5. User sees booking in account dashboard.

### Contact/Support

1. Contact form saves to `contact_messages`.
2. Logged-in support request saves to `support_tickets`.
3. Admin/staff can reply and update status.

## Frontend Integration Plan

Replace localStorage-only logic in these files:

- `auth-system.js`
- `booking-script.js`
- `payment-script.js`
- `account-script.js`
- `service-script.js`

New frontend behavior:

- Use `fetch("/api/auth/me")` to detect logged-in user.
- Use `POST /api/auth/login` and `POST /api/auth/register` instead of fake local login.
- Use `POST /api/bookings` instead of saving bookings only to localStorage.
- Use `GET /api/bookings/me` on account page.
- Use `POST /api/contact` for contact form.
- Keep localStorage only for harmless UI preferences, not real user or payment data.

## Security Checklist

- Hash passwords with bcrypt or argon2.
- Use HTTPS in production.
- Store secrets in `.env`, never in frontend JavaScript.
- Validate all request bodies.
- Use rate limiting for login/register/contact endpoints.
- Use role checks for admin routes.
- Verify payment signatures on the server.
- Protect cookies with `httpOnly`, `secure`, and `sameSite`.
- Sanitize admin-displayed user content.
- Log important backend errors without exposing secrets to users.

## Build Phases

### Phase 1: Minimum Real Backend

- Create `/backend` Express app.
- Add Prisma database schema.
- Add register/login/logout/me APIs.
- Add create booking and my bookings APIs.
- Update frontend auth and account pages to call backend.

### Phase 2: Payments and Service Slots

- Add payment order creation.
- Add payment verification/webhook.
- Add service date and slot handling.
- Store actual amount, selected variant, and booking status.

### Phase 3: Admin System

- Add admin login role.
- Add admin dashboard pages or API.
- Add booking status updates.
- Add contact/support management.

### Phase 4: Production Readiness

- Add deployment config.
- Add backup strategy.
- Add logging and monitoring.
- Add email/SMS notifications.
- Add tests for auth, bookings, payments, and admin permissions.

## First Implementation Recommendation

Start with Phase 1. Do not begin with payments. First make accounts and bookings real. Once bookings are stored correctly in a database, payment integration becomes much safer and easier.
