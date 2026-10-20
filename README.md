# ITPracticeTests.com - Online Education & IT Certification Exam Platform

A modern, responsive, high-performance online education web platform modeled after **Udemy.com** for **Yogesh Dhiman** (Udemy Bestselling Instructor & Cloud Solutions Architect).

## 🚀 Live Demo & Features

- **Student Registration & Login**: Full auth system supporting registration, login, profile management, and persistent sessions.
- **Super Admin Control Center**: Dedicated admin panel to manage 162+ courses, add & configure payment gateways, manage registered students, view order ledgers with GST invoices, and create discount coupons.
- **Payment Gateway Management**: Configure Razorpay, Cashfree, PayPal, PayU, CCAvenue, and direct UPI QR with sandbox/production toggles and connection ping test.
- **Instructor Spotlight**: Instructor spotlight and course authoring by Yogesh Dhiman.
- **162+ Products Catalog**: Real certification practice tests, online courses, interview question banks, and CBSE chapter notes.
  - **Vendors**: AWS, Microsoft Azure, Google Cloud (GCP), CompTIA, Kubernetes (CKA/CKAD), Databricks, Cisco, Terraform, Linux Foundation, Snowflake, and more.
- **Dual Currency Switcher**: Instant switching between **₹ INR (India)** and **$ USD (Global)** with localized discounted pricing.
- **Interactive Practice Test Engine (Exam Simulator)**:
  - **Timed Simulation Mode**: Real exam conditions with countdown timer, question palette, flag for review, and passing threshold.
  - **Study / Practice Mode**: Instant answer check and in-depth explanations with official vendor documentation citations.
  - **Diagnostic Scorecard**: Overall percentage, pass/fail status, and domain-by-domain proficiency breakdown.
  - **Certificate of Readiness**: Instant downloadable/printable certificate signed by Yogesh Dhiman.
- **IT Technical Interview Simulator**:
  - Interactive Flashcard & Interview Q&A portal with **Audio Simulation** (Web Speech API).
  - High-yield topics: Selenium Java, Playwright + TypeScript, Python Developer, Cloud Architecture.
- **Instructor Hub & Course/Test Creator**:
  - Full wizard to create new practice tests and online courses.
  - Interactive Question Bank Builder: Add single-choice MCQs, multi-select MSQs, correct answers, domains, and explanations.
  - Catalog management: Edit pricing, search, delete, and export JSON database backups.
  - Orders & Revenue ledger.
- **E-Commerce & Checkout Simulation**:
  - Shopping cart, promo coupon system (`TECHREADY` for 20% off, `YOGESH50` for 50% off).
  - Payment simulation for UPI (QR code + VPA), Credit/Debit Cards, NetBanking, and PayPal.
  - Automated tax invoice with Registered Office & GSTIN (`03AKXPD3010G1ZM`).
- **Student Learning Dashboard ("My Learning")**:
  - Track enrolled courses, resume tests, review exam attempts, and retake tests.

---

## 🏢 Business & Legal Details

- **Brand**: ITPracticeTests (formerly *ExpertsTeachers*)
- **Website**: `www.ITPracticeTests.com`
- **Registered Office**:
  Office No. 715, Seventh Floor, Block D&E, Chandigarh Citi Center, VIP Road, Zirakpur, Punjab, India – 140603
- **GSTIN**: `03AKXPD3010G1ZM`
- **Customer Support**:
  - Email: `support@itpracticetests.com`
  - Phone / WhatsApp: `+91-9253330335`
  - Hours: Monday–Saturday, 9:00 AM–6:00 PM IST (24/7 online exam access)

---

## 🔐 Demo Credentials

| Role | Name | Email | Password | Access |
|---|---|---|---|---|
| **Administrator** | Yogesh Dhiman | `rath.sanjiv.rath@gmail.com` | `admin123` | Full access to Admin Panel, Course Creator & Gateway Config |
| **Student** | Alex Kumar | `alex.kumar@example.com` | `student123` | Student access to courses, test simulator, and wishlist |
| **Student 2** | Priya Sharma | `priya.sharma@example.com` | `student123` | Student account |

*Note: You can also use the 1-Click quick login buttons in the login modal or toggle roles anytime in the user menu.*

---

- **Frontend**: React 18, Vite 5, Tailwind CSS
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti, Tailwind Animations
- **Speech API**: Web Speech Synthesis for Interview Audio Readout

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

### 3. Build for Production
```bash
npm run build
```
The optimized production files will be output to the `dist/` directory, ready to be hosted on Netlify, Vercel, AWS S3/CloudFront, or any standard web server.
