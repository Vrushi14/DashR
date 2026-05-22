# DashRx Website Documentation

## 1. Executive Summary
DashRx is a comprehensive B2B web platform purpose-built for UK community pharmacy owners and managers. Its primary goal is to help pharmacies maximize profit margins and identify pricing leakages by automating the audit of distributor statements and purchase invoices. By eliminating manual data entry and complex spreadsheets, DashRx provides real-time insights into VAT discrepancies, ODS code matching, and competitor benchmarking.

## 2. Platform Architecture
DashRx is built using a modern JavaScript stack:
*   **Front-End:** React.js powered by Vite for fast development and optimized production builds. It utilizes `react-router-dom` for client-side routing and Lucide React for consistent, scalable iconography.
*   **Back-End:** Express.js (Node.js) server providing RESTful APIs.
*   **Database:** SQLite database for lightweight, local data persistence (storing user credentials securely).

## 3. Core Features & Operational Logic

### 3.1. Automated Stockist Bill Reconciliation (Audit Hub)
*   **How it works:** Pharmacies can upload PDF invoices directly into the platform. DashRx simulates an intelligent parsing engine that extracts purchase prices, batch codes, quantities, and UK VAT rates (standard 20%, reduced 5%, zero-rated).
*   **Value:** It instantly flags shortfalls, rate differences (between billed rate and NHS drug tariff or contract rate), or bonus scheme leakages. It supports major UK distributors like Alliance Healthcare, AAH Pharmaceuticals, Phoenix Medical, and Sigma Pharmaceuticals.
*   **Actionable Output:** Generates automated claims/refund notes for stockist discrepancies.

### 3.2. VAT & Margin Analytics Dashboard
*   **How it works:** Extracted payment data is organized into interactive charts and tables.
*   **Value:** Provides a clear breakdown of UK VAT input credit, generic-to-branded mix ratios, and dynamic supplier discounts. Users can verify VAT discrepancy logs in real-time.

### 3.3. Geographical Drug Trends & Regional Demand Heatmap
*   **How it works:** Aggregates anonymized purchasing and therapeutic category trends across community counters in the UK.
*   **Value:** Allows pharmacy owners to scan regional inventory demand shifts. It helps in forecasting therapeutic growth categories (e.g., Cardiac, Diabetic) and pinpointing high-growth chronic medications to prevent stockouts.

### 3.4. Secure Peer Benchmarking
*   **How it works:** The platform anonymizes pharmacy data to compile localized price benchmarks.
*   **Value:** Users can privately compare the purchase rates they receive from UK distributors against average regional rates of similar-scale pharmacies. It provides real-time gross margin and inventory turnover ratios.

## 4. Pages Overview

### 4.1. Public Pages
*   **Home Page (`/`):** A highly aesthetic landing page explaining the platform's value proposition. It features the "How it works" timeline, detailed feature breakdowns, a UK-wide Leaderboard comparing community pharmacies, and transparent pricing plans (Free, Pro Growth, Multi-Store).
*   **Login (`/login`) & Signup (`/signup`):** Authentication pages. The Signup page captures essential details (Name, Email, Password, Pharmacy Name, ODS Code, NHS Contract) and creates a user record in the SQLite database via the `/api/signup` endpoint. The Login page authenticates the user via the `/api/login` endpoint.
*   **Sample Reports (`/sample-reports`) & Growth Report (`/growth-report`):** Marketing and value-add pages demonstrating the platform's analytical capabilities before a user commits to a paid plan.
*   **Blog (`/blog`):** Content marketing page featuring articles on UK pharmacy management, VAT reconciliation, and FP34 NHSBSA payments.
*   **Legal (`/legal/*`):** Standard compliance pages for Privacy Policy, Terms of Service, and Cookie Policy, emphasizing UK GDPR & Data Protection Act 2018 compliance.

### 4.2. Authenticated Dashboard (`/dashboard`)
The Dashboard is the core application interface, accessible only after login. It features a sidebar navigation dividing tools into three categories:

#### Audit Hub
*   **VAT & Margin Dashboard:** Overview of financial health, leakage loss, and chronic meds mix.
*   **Stockist Recon:** Interface for uploading distributor bills, tracking discrepancies (Rate Difference, Scheme Shortfall), and raising claims.
*   **VAT Breakdown:** Detailed FP34 VAT Reconciliation Report, comparing extracted invoice VAT against HMRC compliance guidelines.

#### Market Intel
*   **Regional Demand:** Insights into local regional stockouts and fast-moving therapeutic categories.
*   **Peer Benchmark:** Secure comparison against nearby UK pharmacies.
*   **Leaderboard:** Ranks pharmacies across the UK based on Bill Volume, Chronic Refills, Screenings, Vaccinations, and e-Rx Digitisation.

#### Value Adds
*   **Growth Report:** Generates an instant commercial growth report with an Executive Margin Performance Score, distributor diagnostics, and strategic recommendations in GBP (£).
*   **Settings:** Manage pharmacy profile, ODS Code, and NHS Contract information.
*   **Subscription:** View current plan and download subscription invoices.

## 5. Back-End Workflow (server/index.cjs & server/db.cjs)
The backend is a lightweight Express server (`port 5000`) connected to a local SQLite database (`database.sqlite`).
*   **Database Schema:** A `users` table storing `id`, `name`, `email` (UNIQUE), `password`, `pharmacy_name`, `ods_code`, `nhs_contract`, and `created_at`.
*   **`/api/signup` (POST):** Accepts `name`, `email`, `password`, `pharmacy_name`, `ods_code`, and `nhs_contract`. Validates input, inserts a new record into the `users` table, handles `UNIQUE constraint failed` errors for duplicate emails, and returns the created user data.
*   **`/api/login` (POST):** Accepts `email` and `password`. Queries the `users` table to find a matching record. Returns a success message and user payload if credentials are valid, or a `401 Unauthorized` error if invalid.
*   **`/api/health` (GET):** A simple health check endpoint to verify the server is running.

## 6. Security and Compliance
*   **UK GDPR & Data Protection Act 2018:** DashRx emphasizes strict adherence to UK data privacy regulations.
*   **Data Privacy:** All invoice details and billing analytics are stated to be end-to-end encrypted. Benchmarking data is strictly anonymized so individual commercial identities are never exposed.

## 7. Document Export Features
The platform includes built-in functions within the Dashboard to export analytical data:
*   **HTML-to-Word:** Generates `.doc` files (e.g., Purchase Audit Reports, Claims Summaries) on the fly using dynamic HTML templates.
*   **Print-to-PDF:** Uses browser-native printing capabilities to render high-fidelity, styled vector PDFs for reports.
