# Student Centre Hub

> Multi-vendor campus marketplace for Mulungushi University, Kabwe, Zambia.

A full-stack platform where on-campus vendors can list products and services, students can browse, order, and book appointments, and administrators oversee the entire ecosystem. Built with **Django REST Framework** (backend) and **Next.js** (frontend).

---

## Overview

Student Centre Hub solves the problem of scattered campus commerce. Instead of students walking from shop to shop or vendors lacking an online presence, the platform centralises everything — from grocery orders at Twice Unimart to haircut bookings at Mulwanda's Salon.

**Roles**
- **Student** — Browse vendors, place orders, book services, track bookings, cancel pending/confirmed bookings, raise disputes
- **Vendor** — Manage products, fulfil orders, update order status, confirm/decline/complete bookings, view audit logs, manage shop settings
- **Admin** — Django admin panel for full oversight, suspend vendors, resolve disputes, broadcast promotions

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [API Reference](#api-reference)
- [Frontend Pages](#frontend-pages)
- [Authentication & Authorisation](#authentication--authorisation)
- [Payments (Flutterwave)](#payments-flutterwave)
- [Async Tasks (Celery)](#async-tasks-celery)
- [Audit Logging](#audit-logging)
- [Notifications](#notifications)
- [Setup & Installation](#setup--installation)
- [Seeding Data](#seeding-data)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)

---

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Python 3.12 | Runtime |
| Django 5.0.6 | Web framework |
| Django REST Framework 3.15.2 | API framework |
| djangorestframework-simplejwt 5.3.1 | JWT authentication (access + refresh tokens) |
| Celery 5.4.0 | Async task queue (notifications, broadcasts) |
| django-filter 24.2 | Query parameter filtering |
| drf-spectacular 0.27.2 | OpenAPI schema + Swagger UI / ReDoc |
| dj-database-url 2.2.0 | Database URL parsing (SQLite dev / PostgreSQL prod) |
| gunicorn 22.0.0 | Production WSGI server |
| whitenoise 6.7.0 | Static file serving |
| django-cors-headers 4.4.0 | CORS management |
| psycopg2-binary | PostgreSQL adapter |
| django-storages + boto3 | S3 media file storage (optional) |
| fcm-django | Firebase Cloud Messaging push notifications |
| pytest-django + coverage + factory-boy | Testing |

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 16.2.6 | React framework (App Router) |
| React 19.2.4 | UI library |
| TypeScript | Type safety |
| Tailwind CSS v4 | Utility-first CSS |
| axios | HTTP client with JWT interceptor |
| framer-motion 12 | Page/component animations |
| lucide-react | Icon library |

### Infrastructure
| Service | Purpose |
|---------|---------|
| PostgreSQL | Production database (Render) |
| Redis | Celery broker + cache (Render) |
| SQLite | Development database (zero-config) |
| Gunicorn | Production WSGI server |
| Celery worker | Async task processing |
| Celery beat | Scheduled tasks |
| Render | Backend hosting (web + worker + DB + Redis) |
| Vercel | Frontend hosting |

---

## Architecture

```
                  ┌─────────────────────────────────────┐
                  │         Vercel (Next.js)             │
                  │  Frontend - Student/Vendor UI         │
                  └──────────┬──────────────────────────┘
                             │ HTTPS / JSON (JWT Bearer)
                             ▼
                  ┌─────────────────────────────────────┐
                  │       Render (Django + Gunicorn)      │
                  │  DRF API  /api/v1/...                 │
                  │  Celery Worker (async tasks)          │
                  │  Celery Beat (scheduled tasks)        │
                  └──────┬──────────────┬────────────────┘
                         │              │
                         ▼              ▼
                  ┌────────────┐  ┌────────────┐
                  │ PostgreSQL │  │   Redis    │
                  │ (Render)   │  │ (broker)   │
                  └────────────┘  └────────────┘
```

### Key Design Decisions
- **No auto-login after registration** — users must sign in manually (improves security and UX clarity)
- **Stock decremented on order completion**, not placement — prevents locking inventory for orders that may never be fulfilled
- **Celery tasks run synchronously (eager mode)** in development — no Redis worker needed when `DEBUG=True`
- **Audit logs are immutable** — `AuditLog.save()` raises `PermissionError` on existing entries, guaranteeing a tamper-proof history
- **Polling (10s) over WebSockets** for booking status updates — simpler for MVP
- **Unique constraint** on `(vendor, slot_date, slot_time)` prevents double-booking
- **Revenue calculation** uses `order_status = 'completed'` (not `payment_status`) for robustness

---

## Data Model

The project has 9 Django apps, each containing 1–2 models:

### App: `users`
**`User`** — Custom user model with email as the username field.
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `email` | EmailField | Unique, login credential |
| `name` | CharField(255) | Full name |
| `phone` | CharField(20) | Optional |
| `role` | CharField(10) | `student`, `vendor`, `admin` |
| `student_id` | CharField(20) | e.g. `MU/2024/001` |
| `program` | CharField(100) | e.g. Computer Science |
| `year_of_study` | PositiveSmallIntegerField | 1–6 |
| `fcm_token` | TextField | Firebase push token |
| `is_verified` | BooleanField | Email verified? |
| `avatar` | ImageField | Profile picture |

**`OTPVerification`** — 6-digit code for email verification / password reset / 2FA (10-minute expiry).

### App: `vendors`
**`Vendor`** — Each vendor belongs to a user (`owner`).
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `owner` | OneToOneField(User) | The user who manages this vendor |
| `name` | CharField(255) | Shop name |
| `slug` | SlugField | URL-friendly identifier |
| `category` | CharField(30) | minimart, salon, general_dealers, tech_store, pharmacy, butchery, fast_food, other |
| `description` | TextField | About the shop |
| `contact_email` / `contact_phone` | — | Contact details |
| `logo` / `banner` | ImageField | Branding images |
| `status` | CharField(15) | active, suspended, pending |
| `has_bookable_services` | BooleanField | Does this vendor take bookings? |
| `opening_time` / `closing_time` | TimeField | Business hours |
| `operating_days` | JSONField | e.g. `["Monday","Friday"]` |

**`VendorRating`** — Student ratings (1–5), unique per `(vendor, student)`.

### App: `products`
**`Category`** — Product categories with name, slug, and icon.
**`Product`** — Individual products and bookable services.
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `vendor` | ForeignKey(Vendor) | Product owner |
| `category` | ForeignKey(Category) | Optional |
| `name` | CharField(255) | Product name |
| `price` | DecimalField(10,2) | Price in ZMW |
| `discount_price` | DecimalField(10,2) | Optional sale price |
| `stock` | PositiveIntegerField | Physical stock count |
| `is_service` | BooleanField | Bookable service (e.g. haircut) |
| `is_available` | BooleanField | Can this be ordered? |
| `image` | ImageField | Product photo |

### App: `orders`
**`Order`** — Order with lifecycle tracking.
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `student` | ForeignKey(User) | Who placed the order |
| `vendor` | ForeignKey(Vendor) | Who fulfils the order |
| `total_amount` | DecimalField(10,2) | Total in ZMW |
| `payment_method` | CharField(20) | cash, mobile_money, card |
| `payment_status` | CharField(15) | pending, success, failed, refunded |
| `order_status` | CharField(15) | placed, processing, ready, completed, cancelled |
| `notes` | TextField | Order instructions |

**`OrderItem`** — Line items with product reference, quantity, and unit price.

### App: `payments`
**`Payment`** — Payment transaction record linked 1:1 to an Order.
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `order` | OneToOneField(Order) | Related order |
| `method` | CharField(20) | cash, mobile_money, card |
| `status` | CharField(10) | pending, success, failed, refunded |
| `amount` | DecimalField(10,2) | Payment amount |
| `flutter_ref` / `flutter_tx_id` | CharField | Flutterwave references |
| `payment_link` | URLField | Flutterwave checkout URL |
| `raw_webhook` | JSONField | Raw webhook payload |

### App: `bookings`
**`Booking`** — Service appointment booking.
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `student` | ForeignKey(User) | Who booked |
| `vendor` | ForeignKey(Vendor) | Service provider |
| `service` | ForeignKey(Product) | Service (is_service=True) |
| `slot_date` | DateField | Appointment date |
| `slot_time` | TimeField | Appointment time |
| `status` | CharField(15) | pending, confirmed, completed, cancelled |
| `confirmation_code` | CharField(12) | Random code for verification |

### App: `notifications`
**`Notification`** — In-app notification record.
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `recipient` | ForeignKey(User) | Who receives it |
| `title` | CharField(255) | Notification title |
| `message` | TextField | Notification body |
| `type` | CharField(10) | order, payment, booking, promo, system |
| `is_read` | BooleanField | Read status |

### App: `disputes`
**`Dispute`** — Student-raised disputes on orders.
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `order` | ForeignKey(Order) | Related order |
| `raised_by` | ForeignKey(User) | Student who raised it |
| `status` | CharField(15) | open, under_review, resolved, dismissed |
| `description` / `resolution_notes` | TextField | Details |

### App: `audit`
**`AuditLog`** — Immutable audit trail for vendor actions.
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `vendor` | ForeignKey(Vendor) | Vendor who performed the action |
| `action` | CharField(30) | order_completed, stock_updated, product_created, product_updated, product_deleted |
| `description` | TextField | Human-readable summary |
| `metadata` | JSONField | Structured data (e.g. `{"product": "Coke", "old_stock": 50, "new_stock": 49}`) |
| `created_at` | DateTimeField | Auto-set, immutable |

---

## API Reference

Base URL: `/api/v1/`

All authenticated endpoints require a JWT Bearer token in the `Authorization` header.

### Authentication (`/api/v1/auth/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `register/` | No | Create student account |
| POST | `register/vendor/` | No | Create vendor account + shop |
| POST | `login/` | No | Authenticate, returns access + refresh JWT |
| POST | `logout/` | Yes | Blacklist refresh token |
| POST | `token/refresh/` | No | Refresh access token |
| GET/PATCH | `profile/` | Yes | View/update own profile |
| POST | `change-password/` | Yes | Change password |
| POST | `otp/request/` | No | Request OTP by email |
| POST | `otp/verify/` | No | Verify OTP code |

### Vendors (`/api/v1/vendors/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `` | No | List all active vendors (public) |
| GET | `<slug:slug>/` | No | Single vendor detail (public) |
| GET/PATCH | `me/` | Yes | Own vendor profile |
| POST | `create/` | Admin | Create vendor |
| PATCH | `<slug:slug>/update/` | Owner/Admin | Update vendor |
| POST | `<slug:slug>/suspend/` | Admin | Suspend/reinstate |
| GET | `<slug:slug>/ratings/` | No | List ratings |
| POST | `<slug:slug>/ratings/add/` | Student | Rate a vendor |

### Products (`/api/v1/products/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `` | No | Browse available products |
| GET | `categories/` | No | List categories |
| GET | `vendor/<slug:slug>/` | No | Products by vendor |
| GET | `<uuid:pk>/` | No | Product detail |
| POST | `create/` | Vendor | Create product (logs audit) |
| PATCH | `<uuid:pk>/update/` | Vendor | Update product (logs stock changes) |
| DELETE | `<uuid:pk>/delete/` | Vendor | Delete product (logs audit) |

### Orders (`/api/v1/orders/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `` | Student | Own orders |
| POST | `create/` | Student | Place order (validates stock) |
| GET | `vendor/` | Vendor | Incoming orders |
| GET | `admin/` | Admin | All orders (filterable) |
| GET | `<uuid:pk>/` | Student/Vendor/Admin | Order detail |
| PATCH | `<uuid:pk>/status/` | Vendor | Update status (completion decrements stock + logs audit) |

### Payments (`/api/v1/payments/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `initiate/<uuid:order_id>/` | Student | Start Flutterwave payment |
| POST | `webhook/flutterwave/` | No | Flutterwave webhook (HMAC-verified) |
| GET | `detail/<uuid:order_id>/` | Student | Payment details |

### Bookings (`/api/v1/bookings/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `` | Student | Own bookings |
| POST | `create/` | Student | Create booking |
| GET | `vendor/` | Vendor | Incoming bookings |
| PATCH | `<uuid:pk>/status/` | Vendor | Update status (confirm/decline/complete/cancel) |
| PATCH | `<uuid:pk>/cancel/` | Student | Cancel own pending/confirmed booking |
| GET | `availability/<uuid:vendor_id>/` | No | Check available slots by date |

### Disputes (`/api/v1/disputes/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `` | Student | Own disputes |
| POST | `create/` | Student | Raise a dispute |
| GET | `admin/` | Admin | All disputes |
| PATCH | `<uuid:pk>/resolve/` | Admin | Resolve dispute |

### Notifications (`/api/v1/notifications/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `` | Any | List own notifications |
| POST | `read/` | Any | Mark all as read |
| POST | `<uuid:pk>/read/` | Any | Mark one as read |
| POST | `broadcast/` | Admin | Broadcast promo to all students |

### Audit (`/api/v1/audit/`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `` | Vendor | Own audit trail |

### API Documentation
- Swagger UI: `/api/v1/docs/`
- ReDoc: `/api/v1/redoc/`
- OpenAPI schema: `/api/v1/schema/`

**51 API endpoints total.**

---

## Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing page | Hero, vendor showcase, features, footer |
| `/login` | Login | Student/vendor email + password login |
| `/register` | Register | Student account creation |
| `/register/vendor` | Vendor register | 2-step form (account + shop details) |
| `/cart` | Cart | LocalStorage-based shopping cart |
| `/checkout` | Checkout | Order review + place order |
| `/dashboard` | Dashboard | Student dashboard (orders, bookings, notifications) |
| `/orders` | Orders | Student order history |
| `/bookings` | Bookings | Student bookings list with 10s polling + cancellation |
| `/profile` | Profile | User profile settings |
| `/vendors` | Vendors | Browse all vendors (filterable) |
| `/vendors/[slug]` | Vendor detail | Products and services for a vendor |
| `/book/[slug]` | Book service | 3-step booking flow (service → date → time → confirm) |
| `/vendor` | Vendor dashboard | Revenue (orders + bookings), stats |
| `/vendor/products` | Products | Product management (list, create, edit, delete) |
| `/vendor/orders` | Orders | Order fulfilment (list, detail, status update) |
| `/vendor/bookings` | Bookings | Booking management (confirm/decline/complete/cancel) |
| `/vendor/settings` | Settings | Shop profile settings |
| `/vendor/audit` | Audit log | Immutable audit trail with action-type filters |

### Key Frontend Architecture
- **Axios client** (`lib/api.ts`) — Centralised instance with JWT auto-attach on requests, silent token refresh on 401, and redirect to login on refresh failure
- **Inline styles** throughout (no CSS modules)
- **framer-motion** for animations (landing page hero, page transitions)
- **lucide-react** for all icons
- **10-second polling** (setInterval with cleanup) on bookings list

---

## Authentication & Authorisation

### Flow
1. **Register** — POST to `/api/v1/auth/register/` or `register/vendor/`. Returns `{"message": "..."}`. No tokens issued.
2. **Login** — POST to `/api/v1/auth/login/` with email + password. Returns `access_token`, `refresh_token`, and user profile.
3. **Authenticate** — Frontend axios interceptor attaches `Bearer <access_token>` to every request.
4. **Refresh** — On 401, the interceptor silently calls `token/refresh/`, retries the original request, or redirects to `/login`.
5. **Logout** — POST to `/api/v1/auth/logout/` blacklists the refresh token.

### JWT Configuration
- Access token: 1 hour (configurable via `JWT_ACCESS_TOKEN_LIFETIME`)
- Refresh token: 24 hours (configurable via `JWT_REFRESH_TOKEN_LIFETIME`)
- Refresh token rotation enabled
- Blacklist after rotation enabled

### Permissions
| Level | Mechanism |
|-------|-----------|
| Endpoint-level | DRF `IsAuthenticated`, custom `IsVendorOwner`, `IsAdminUser` |
| Object-level | `IsVendorOwner` checks `vendor.owner == request.user` |
| Role-based | `User.role` field checked in views (`is_student`, `is_vendor_user` properties) |
| Audit immutable | `AuditLog.save()` raises `PermissionError` on update |

---

## Payments (Flutterwave)

The platform integrates with **Flutterwave v3 API** for card and mobile money payments in Zambian Kwacha (ZMW).

### Flow
1. Student places an order (payment_method = `mobile_money` or `card`)
2. Student initiates payment via `POST /api/v1/payments/initiate/<order_id>/`
3. Backend calls Flutterwave API, receives a checkout URL, returns it
4. Student is redirected to Flutterwave's hosted checkout
5. Flutterwave sends webhook to `POST /api/v1/payments/webhook/flutterwave/`
6. Webhook is verified via HMAC-SHA256 signature
7. On `charge.completed`: Payment + Order status updated, stock decremented, notifications fired
8. Student is redirected back to `/payment/callback`

### FlutterwaveService (`apps/payments/flutterwave.py`)
- `initiate_payment(order, customer)` — Creates a payment link
- `verify_transaction(tx_id)` — Secondary transaction verification
- `verify_webhook_signature(payload, signature)` — HMAC validation

### Payment Methods
- **Cash** — No Flutterwave integration; vendor collects payment on delivery
- **Mobile Money** — Via Flutterwave
- **Card** — Via Flutterwave

---

## Async Tasks (Celery)

Celery handles all asynchronous operations. In development (`DEBUG=True`), tasks run synchronously (eager mode) — no Redis broker needed.

### Defined Tasks (`apps/notifications/tasks.py`)
| Task | Trigger | Description |
|------|---------|-------------|
| `send_order_status_notification` | Order status change | Notify student of new status |
| `send_payment_success_notification` | Payment success | Notify student + vendor owner |
| `send_payment_failed_notification` | Payment failure | Notify student |
| `send_booking_confirmation` | Booking created | Notify student with confirmation code |
| `broadcast_promo` | Admin action | Push promo to all active students (FCM + in-app) |

### Celery Configuration
- **Broker**: Redis in production, `memory://` in dev
- **Result backend**: Redis in production, `cache+memory://` in dev
- **Serializer**: JSON
- **Timezone**: Africa/Lusaka
- **Beat scheduler**: Database-backed (`django_celery_beat`)
- **Eager mode** (`CELERY_TASK_ALWAYS_EAGER = True`) when DEBUG — tasks execute synchronously, no worker required

---

## Audit Logging

The audit system provides an immutable, tamper-proof trail of vendor actions.

### How it works
- **AuditLog model** — Stores `vendor`, `action`, `description`, `metadata` (JSON), and auto-set `created_at`
- **Immutable** — `save()` on an existing instance raises `PermissionError`. Only `created_at` filterable in list views
- **Auto-logged actions**:
  - `order_completed` — When vendor completes an order
  - `stock_updated` — When vendor edits a product's stock quantity (logs old/new values)
  - `product_created` — When vendor adds a new product (logs product name)
  - `product_updated` — When vendor edits a product (logs changed fields)
  - `product_deleted` — When vendor deletes a product (logs product name)
- **API** — `GET /api/v1/audit/` returns the logged-in vendor's audit log, ordered by most recent
- **Frontend** — `/vendor/audit` page with action-type filter buttons and timestamped timeline

---

## Notifications

### In-App Notifications
- Created via `Notification` model records
- Sent asynchronously via Celery tasks
- Types: `order`, `payment`, `booking`, `promo`, `system`
- API: list, mark single read, mark all read

### Push Notifications (FCM)
- **Firebase Cloud Messaging** integration via `fcm-django`
- FCM tokens stored on `User.fcm_token` field
- Sent alongside in-app notifications in Celery tasks
- Promo broadcasts target all active students

---

## Setup & Installation

### Prerequisites
- Python 3.12+
- Node.js 20+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/TGSMk21/StudentCenter.git
cd StudentCenter
```

### 2. Backend Setup
```bash
cd Backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows
venv/bin/activate         # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env: set SECRET_KEY to a random string, DEBUG=True

# Run migrations
python manage.py migrate

# Create admin user (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd Frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Edit .env.local: set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Start dev server
npm run dev
```

### 4. Open the App
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1/
- Django Admin: http://localhost:8000/admin/
- Swagger Docs: http://localhost:8000/api/v1/docs/

---

## Seeding Data

The seed script creates sample data for development and testing.

### Run the Seed
```bash
cd Backend
python manage.py runscript seed
```

### What Gets Seeded
| Entity | Count | Details |
|--------|-------|---------|
| Admin user | 1 | `admin@mu.ac.zm` / `Admin@2024!` |
| Student | 1 | `student@mu.ac.zm` / `password123` |
| Vendor users | 7 | Each with `password123` |
| Vendors | 7 | See below |
| Categories | 8 | Groceries, Food & Beverages, Hair & Beauty, Stationery, Tech & Gadgets, Pharmacy, Meat & Butchery, Printing Services |
| Products | 31 | Mixed physical goods and services |

### Seeded Vendors
| Vendor | Category | Bookable? | Owner Email |
|--------|----------|-----------|-------------|
| Twice Unimart | Minimart | No | twice@shop.mu.ac.zm |
| Mulwanda's Salon | Salon | Yes (4 services) | mulwanda@vendor.mu.ac.zm |
| Write General Dealers | General Dealers | Yes (3 services) | write@vendor.mu.ac.zm |
| Hamted Investments | Tech Store | Yes (2 services) | hamted@vendor.mu.ac.zm |
| Campus Pharmacy | Pharmacy | Yes (1 service) | pharmacy@vendor.mu.ac.zm |
| Shell's Butchery | Butchery | No | shell@vendor.mu.ac.zm |
| Tony's Fast Food | Fast Food | No | tony@vendor.mu.ac.zm |

The script is **idempotent** — it uses `get_or_create` so it can be run multiple times safely.

---

## Running Tests

```bash
cd Backend
python manage.py test
```

The test suite includes:
- **20 API tests** (in `apps/tests/`) — covers all major endpoints
- **9 user workflow tests** — end-to-end user scenarios (register, login, create order, book service, etc.)

### Test Configuration
- Uses a separate SQLite in-memory database (Django default test runner)
- `pytest-django` and `factory-boy` available for advanced testing
- Coverage reports via `coverage` tool

---

## Deployment

### Backend (Render)

Render automatically provisions PostgreSQL, Redis, web service, and worker from `render.yaml`.

#### Manual Steps
1. Push code to GitHub
2. Create a **Blueprint** on Render using `Backend/render.yaml`
3. Set required environment variables in Render dashboard
4. Deploy

#### Or deploy manually:
1. Create a **Web Service** on Render
   - Build command: `cd Backend && pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - Start command: `cd Backend && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 4 --timeout 120`
2. Create a **PostgreSQL** database (Render automatically sets `DATABASE_URL`)
3. Create a **Redis** instance (Render automatically sets `REDIS_URL` and `CELERY_BROKER_URL`)
4. Create a **Worker** for Celery
   - Start command: `cd Backend && celery -A config worker --loglevel=info --concurrency=4`

### Frontend (Vercel)

1. Import the GitHub repo in Vercel
2. Set Root Directory to `Frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com/api/v1`
4. Deploy
5. Update `vercel.json` rewrite destination to your Render URL

### Important Production Notes
- Set `DEBUG=False` in production
- Add `.onrender.com` to `ALLOWED_HOSTS`
- Set a strong `SECRET_KEY`
- Configure `FRONTEND_URL` for CORS and redirects
- Set up S3 for media files (or use local media/ with persistent storage)
- Configure Flutterwave live keys
- Set up FCM server key for push notifications

---

## Environment Variables

### Backend (`.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | — | Django secret key (required) |
| `DEBUG` | `False` | Debug mode |
| `ALLOWED_HOSTS` | `localhost` | Comma-separated hosts |
| `DATABASE_URL` | `sqlite:///db.sqlite3` | PostgreSQL in production |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection |
| `CELERY_BROKER_URL` | `redis://localhost:6379/1` | Celery broker |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend origin for CORS |
| `FLUTTERWAVE_PUBLIC_KEY` | — | Flutterwave API key |
| `FLUTTERWAVE_SECRET_KEY` | — | Flutterwave secret key |
| `FLUTTERWAVE_ENCRYPTION_KEY` | — | Flutterwave encryption key |
| `FLUTTERWAVE_WEBHOOK_SECRET` | — | Webhook HMAC secret |
| `FCM_SERVER_KEY` | — | Firebase Cloud Messaging key |
| `USE_S3` | `False` | Use S3 for media storage |
| `JWT_ACCESS_TOKEN_LIFETIME` | `3600` | Seconds |
| `JWT_REFRESH_TOKEN_LIFETIME` | `86400` | Seconds |

### Frontend (`.env.local`)
| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | — | Backend API base URL |

---

## Project Structure

```
StudentCentre/
├── vercel.json                          # Vercel proxy config (API rewrites)
│
├── Backend/
│   ├── manage.py                        # Django management entry point
│   ├── requirements.txt                 # Python dependencies
│   ├── runtime.txt                      # python-3.12.x
│   ├── Procfile                         # Gunicorn + Celery + Beat
│   ├── render.yaml                      # Render blueprint deployment
│   ├── Dockerfile                       # Docker build
│   ├── docker-compose.yml               # Local PostgreSQL + Redis
│   ├── .env.example                     # Environment variable template
│   │
│   ├── config/                          # Django project configuration
│   │   ├── settings.py                  # All Django settings
│   │   ├── urls.py                      # Root URL routing
│   │   ├── wsgi.py                      # WSGI application
│   │   └── celery.py                    # Celery application
│   │
│   ├── apps/                            # Django applications
│   │   ├── users/                       # Authentication & user profiles
│   │   │   ├── models.py                # User, OTPVerification
│   │   │   ├── views.py                 # Register, Login, Profile, OTP
│   │   │   ├── serializers.py           # Input/output validation
│   │   │   ├── urls.py                  # Auth endpoints
│   │   │   └── admin.py
│   │   │
│   │   ├── vendors/                     # Vendor management
│   │   │   ├── models.py                # Vendor, VendorRating
│   │   │   ├── views.py                 # CRUD + ratings
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   ├── permissions.py           # IsVendorOwner
│   │   │   └── admin.py
│   │   │
│   │   ├── products/                    # Product catalog
│   │   │   ├── models.py                # Category, Product
│   │   │   ├── views.py                 # CRUD + browse + audit logging
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   │
│   │   ├── orders/                      # Order lifecycle
│   │   │   ├── models.py                # Order, OrderItem
│   │   │   ├── views.py                 # Create, list, status update
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   │
│   │   ├── payments/                    # Payment processing
│   │   │   ├── models.py                # Payment
│   │   │   ├── views.py                 # Initiate, webhook, detail
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   ├── admin.py
│   │   │   └── flutterwave.py           # Flutterwave API client
│   │   │
│   │   ├── bookings/                    # Service booking
│   │   │   ├── models.py                # Booking
│   │   │   ├── views.py                 # CRUD + availability + cancel
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   │
│   │   ├── notifications/               # Push notifications
│   │   │   ├── models.py                # Notification
│   │   │   ├── views.py                 # List, mark read, broadcast
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   ├── admin.py
│   │   │   └── tasks.py                 # Celery async tasks
│   │   │
│   │   ├── disputes/                    # Dispute resolution
│   │   │   ├── models.py                # Dispute
│   │   │   ├── views.py                 # CRUD + admin resolve
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   │
│   │   ├── audit/                       # Immutable audit logging
│   │   │   ├── models.py                # AuditLog (immutable)
│   │   │   ├── views.py                 # Vendor log list
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   │
│   │   └── tests/                       # Test suite
│   │       ├── test_api.py              # 20 API tests
│   │       └── test_workflow.py         # 9 workflow tests
│   │
│   └── scripts/
│       └── seed.py                      # Database seeder
│
├── Frontend/
│   ├── package.json                     # Node dependencies
│   ├── next.config.ts                   # Next.js configuration
│   ├── tsconfig.json                    # TypeScript config
│   ├── .env.example                     # Environment template
│   │
│   ├── lib/
│   │   └── api.ts                       # Axios client with JWT interceptors
│   │
│   ├── app/                             # Next.js App Router pages
│   │   ├── layout.tsx                   # Root layout
│   │   ├── page.tsx                     # Landing page
│   │   ├── globals.css                  # Global styles
│   │   │
│   │   ├── login/                       # Login page
│   │   ├── register/                    # Student registration
│   │   ├── register/vendor/             # Vendor registration
│   │   ├── cart/                        # Shopping cart
│   │   ├── checkout/                    # Checkout
│   │   ├── dashboard/                   # Student dashboard
│   │   ├── orders/                      # Student orders
│   │   ├── bookings/                    # Student bookings (+ polling)
│   │   ├── profile/                     # User profile
│   │   ├── vendors/                     # Browse vendors
│   │   ├── vendors/[slug]/              # Vendor detail page
│   │   ├── book/[slug]/                 # Book a service
│   │   │
│   │   └── vendor/                      # Vendor area
│   │       ├── layout.tsx               # Vendor nav layout
│   │       ├── page.tsx                 # Dashboard
│   │       ├── orders/                  # Order management
│   │       ├── orders/[id]/             # Order detail
│   │       ├── products/                # Product management
│   │       ├── products/new/            # Create product
│   │       ├── products/[id]/edit/      # Edit product
│   │       ├── bookings/                # Booking management
│   │       ├── settings/                # Shop settings
│   │       └── audit/                   # Audit log viewer
│   │
│   └── public/                          # Static assets
│
└── .gitignore
```
