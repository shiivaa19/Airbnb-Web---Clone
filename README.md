# Production-Scale Airbnb Clone

This project is a high-fidelity, full-stack Airbnb Clone built for an SDE Full-Stack hiring evaluation. It showcases enterprise software engineering practices, clean architecture, Domain-Driven Design (DDD) principles, and a premium UX design matching Airbnb's look and feel.

---

## Technical Stack

### **Frontend**
- **Framework**: Next.js 15 (App Router, dynamic page segments)
- **State Management**: Zustand (Auth session states, search criteria, wishlists)
- **API Interactivity**: Axios + React Query (caching, mutation updates, automatic cache invalidation)
- **Aesthetics & Animations**: Tailwind CSS + Framer Motion (hover actions, carousel sliders, modal transitions)
- **Icons**: Lucide Icons
- **Interactive Maps**: Leaflet Maps (SSR-safe wrapper to avoid pre-render failures)

### **Backend**
- **Framework**: FastAPI (asynchronous endpoints, request validation DTOs)
- **ORM**: SQLAlchemy 2.0 (Declarative mapping, request-scoped sessions)
- **Database**: SQLite (relational storage, local seeder, database indexes)
- **Security**: JWT Access Tokens + Passlib bcrypt password hashing

---

## Architectural Highlights

1. **Clean Architecture & DDD**: The codebase is split into cohesive domains: Users, Listings, Bookings, Reviews, and Favorites. Business logic resides in domain-specific services, ensuring routers (API controllers) remain thin.
2. **Repository Pattern**: Database operations are abstracted away from services into repository classes, making data persistence layers easily swappable (e.g., swapping SQLite for PostgreSQL).
3. **Optimistic Wishlist Toggling**: When favoriting a listing, Zustand updates the UI immediately. A background Axios call syncs this state with the SQLite database.
4. **Collision Booking Engine**: Checks checking dates overlapping:
   $$\text{Overlap} \iff (\text{check\_in} < \text{Booking.check\_out}) \land (\text{check\_out} > \text{Booking.check\_in})$$
   It blocks unavailable dates inside a daily `listing_availabilities` table, locking calendars against double bookings.
5. **Chart Visualizations**: Rendered using responsive vanilla CSS bar components and Framer Motion, avoiding large bundle sizes and React 19 compatibility issues.

---

## Database Relational Schema

Below is the normalized relational SQLite database schema:

- **`users`**: ID, email, hashed_password, first_name, last_name, bio, profile_image, created_at, updated_at
- **`host_profiles`**: ID, user_id (Foreign Key to users), is_superhost, response_rate, response_time, identity_verified, created_at
- **`listings`**: ID, host_id (Foreign Key to users), title, description, category, price_per_night, cleaning_fee, service_fee, address, city, country, latitude, longitude, max_guests, bedrooms, beds, bathrooms, created_at, updated_at
- **`listing_images`**: ID, listing_id (Foreign Key to listings), url, is_primary, display_order, created_at
- **`amenities`**: ID, name (unique), icon
- **`listing_amenities`**: listing_id, amenity_id (composite join table)
- **`bookings`**: ID, listing_id (Foreign Key to listings), guest_id (Foreign Key to users), check_in, check_out, total_price, guest_count, status, created_at, updated_at
- **`reviews`**: ID, listing_id (Foreign Key to listings), author_id (Foreign Key to users), rating (1-5), comment, created_at
- **`favorites`**: user_id, listing_id (composite join table for wishlists)
- **`listing_availabilities`**: ID, listing_id (Foreign Key to listings), date, is_available, booking_id (Foreign Key to bookings, nullable)

---

## How to Set Up & Run the Project

### **1. Backend (FastAPI)**
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   - On Windows (PowerShell):
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - On Unix/macOS:
     ```bash
     source venv/bin/activate
     ```
3. Run the database seeder to wipe existing data and populate listings:
   ```bash
   python -m app.seed
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The interactive API documentation is available at `http://localhost:8000/docs`.*

### **2. Frontend (Next.js)**
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages (already configured for React 19 compatibility):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:3000` to view the beautiful Airbnb Clone application!*

---

## Running Integration Tests

Ensure the virtual environment is activated, then run the backend integration tests (validating Auth flows and Booking Date conflicts):
```bash
cd backend
python -m pytest
```
All tests should pass successfully.
