# 🚀 Hostinger File Manager Deployment Guide for ITPracticeTests.com

This guide provides step-by-step instructions for uploading and running **ITPracticeTests.com** directly inside **Hostinger File Manager (`public_html`)** with zero broken links, full Single Page Application (SPA) routing, active payment gateways, and automated email processing.

---

## 📦 What Was Prepared For Hostinger

| Component | File / Location | How It Protects Functionality on Hostinger |
|---|---|---|
| **Pre-Packaged ZIP Archive** | `hostinger_public_html.zip` (4.97 MB) | Contains all compiled HTML, CSS, JavaScript, assets, `.htaccess`, and API in standard Linux forward-slash (`/`) format ready to extract in 1-click. |
| **Apache / LiteSpeed Config** | `public/.htaccess` & `dist/.htaccess` | Prevents `404 Not Found` when refreshing routes (`/catalog`, `/cart`, `/quiz`, `/admin`), forces HTTPS, sets optimal caching, and routes `/api/*` to the backend. |
| **Native Hostinger Backend API** | `public/api/index.php` & `dist/api/index.php` | Zero-configuration PHP 8.x backend engine that runs natively on all Hostinger shared, business, and cloud plans without needing VPS or Node daemons. Handles order initialization, payment verification, and enrollment. |
| **Client-Side Graceful Fallback** | `src/services/supabaseService.js` | Direct Supabase fallback ensuring checkout, payment verification, and course enrollment NEVER fail even if the server API is temporarily unreachable. |
| **Automated Packaging Tool** | `npm run package:hostinger` | 1-click script that builds production assets and generates a fresh `hostinger_public_html.zip`. |

---

## 🛠️ Step-by-Step Deployment Instructions

### Step 1: Open Hostinger File Manager
1. Log into your **Hostinger Control Panel (hPanel)**: [https://hpanel.hostinger.com](https://hpanel.hostinger.com)
2. In the left navigation, click **Websites** and click **Manage** next to your domain (`itpracticetests.com`).
3. Scroll down to the **Files** section and click **File Manager** (or **File Manager for public_html**).

### Step 2: Navigate to `public_html`
1. Double-click to open the `public_html` directory.
2. *Tip: If there is an existing `default.php` or placeholder index file from Hostinger, delete it so it does not conflict.*

### Step 3: Upload `hostinger_public_html.zip`
1. In the top toolbar of Hostinger File Manager, click the **Upload** icon (upward arrow).
2. Select **File** and choose `hostinger_public_html.zip` from your project folder:
   ```
   c:\Users\dhima\Downloads\ITPT Website\hostinger_public_html.zip
   ```
3. Wait for the upload to complete (takes ~5–10 seconds).

### Step 4: Extract the Files
1. Right-click on `hostinger_public_html.zip` inside File Manager.
2. Click **Extract**.
3. In the extract dialog, specify the destination as `.` or `public_html` (so files are placed directly in `public_html/`).
4. Click **Extract**.

### Step 5: Verify the Extracted Directory Structure
Your `public_html` folder in Hostinger should look like this:
```
public_html/
├── .htaccess                      <-- Critical for routing and HTTPS
├── index.html                     <-- Main application entrypoint
├── api/
│   ├── index.php                  <-- Backend API for payments, access & orders
│   └── data/
│       └── .htaccess              <-- Secures email logs & settings
├── assets/
│   ├── index-RJlJWKCC.js          <-- Minified React Application bundle
│   └── index-kxOMiirM.css         <-- Minified Tailwind CSS bundle
├── 6577847_169c.webp              <-- Instructor & site assets
├── ITPracticeTests.png
└── ... (other image assets)
```
*(You can delete the uploaded `hostinger_public_html.zip` file after extraction to save disk space).*

---

## 🔍 Verification & Health Checks

Once extracted, verify everything is functioning:

1. **Homepage & SPA Navigation:**
   - Open `https://yourdomain.com/` in your browser.
   - Navigate to `/catalog`, `/cart`, `/my-learning`, or an exam simulator.
   - **Press F5 (Refresh)** on any page: It should load smoothly without any `404 Not Found` error.

2. **API Health Endpoint:**
   - Open `https://yourdomain.com/api/health` in your browser.
   - You should see:
     ```json
     {
       "status": "ONLINE",
       "service": "ITPracticeTests Zero-Trust Payment & Access Security Engine (Hostinger Edition)",
       "platform": "Hostinger Native LiteSpeed/PHP",
       "phpVersion": "8.x.x"
     }
     ```

3. **Active Gateways Endpoint:**
   - Open `https://yourdomain.com/api/gateways`.
   - It will return your configured gateways (Razorpay, PayPal, etc.) with all secrets safely hidden.

4. **Super Admin Control Center:**
   - Navigate to `https://yourdomain.com/admin`.
   - Log in with administrator credentials (`rath.sanjiv.rath@gmail.com` / `admin123`).
   - Open **Settings -> Email Notifications** to configure your SMTP or Hostinger webmail.
   - Click **Send Diagnostic Test Email** to verify real-time email dispatch.

---

## 🔄 Making Future Updates

Whenever you make changes to the code:
1. Open terminal in the project folder.
2. Run:
   ```bash
   npm run package:hostinger
   ```
3. Upload the newly generated `hostinger_public_html.zip` to Hostinger File Manager and extract it.
