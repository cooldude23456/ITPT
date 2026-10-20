import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local persistence file for email history and dynamic SMTP settings
const DATA_DIR = path.resolve(__dirname, './data');
const SETTINGS_FILE = path.join(DATA_DIR, 'smtp_settings.json');
const EMAILS_LOG_FILE = path.join(DATA_DIR, 'dispatched_emails.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // Ignore if already exists
  }
}

// Default Configuration
const DEFAULT_CONFIG = {
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT) || 465,
  smtpSecure: process.env.SMTP_SECURE !== 'false', // true for 465, false for 587
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  senderName: process.env.SMTP_SENDER_NAME || 'ITPracticeTests Orders',
  senderEmail: process.env.SMTP_SENDER_EMAIL || process.env.SMTP_USER || 'orders@itpracticetests.com',
  primaryAdminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'support@itpracticetests.com',
  secondaryAdminEmail: process.env.ADMIN_NOTIFICATION_CC || 'rath.sanjiv.rath@gmail.com',
  enableInstantEmail: true,
  instructorName: 'Yogesh Dhiman',
  businessName: 'ITPracticeTests',
  gstNumber: '03AKXPD3010G1ZM',
  officeAddress: 'Office No. 715, 7th Floor, Block D&E, CCC, VIP Road, Zirakpur, Punjab, India – 140603',
  supportPhone: '+91-9253330335'
};

/**
 * Retrieves current active SMTP configuration
 */
export function getMailerConfig() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      return { ...DEFAULT_CONFIG, ...data };
    }
  } catch (err) {
    console.warn('[Mailer] Could not read smtp_settings.json:', err.message);
  }
  return { ...DEFAULT_CONFIG };
}

/**
 * Updates dynamic SMTP configuration
 */
export function saveMailerConfig(newSettings) {
  try {
    const current = getMailerConfig();
    const merged = { ...current, ...newSettings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    return merged;
  } catch (err) {
    console.error('[Mailer] Error saving smtp_settings.json:', err.message);
    return getMailerConfig();
  }
}

/**
 * Retrieves dispatched email log
 */
export function getDispatchedEmails(limit = 100) {
  try {
    if (fs.existsSync(EMAILS_LOG_FILE)) {
      const list = JSON.parse(fs.readFileSync(EMAILS_LOG_FILE, 'utf-8'));
      return Array.isArray(list) ? list.slice(0, limit) : [];
    }
  } catch (e) {
    console.warn('[Mailer] Error reading email logs:', e.message);
  }
  return [];
}

/**
 * Appends to dispatched emails log
 */
function logDispatchedEmail(record) {
  try {
    const list = getDispatchedEmails(200);
    list.unshift(record);
    fs.writeFileSync(EMAILS_LOG_FILE, JSON.stringify(list.slice(0, 100), null, 2), 'utf-8');
  } catch (e) {
    console.error('[Mailer] Error writing email log:', e.message);
  }
}

/**
 * Creates a Nodemailer Transporter based on active config
 */
function createTransporter(config = getMailerConfig()) {
  const host = config.smtpHost || 'smtp.gmail.com';
  const port = Number(config.smtpPort) || (config.smtpSecure ? 465 : 587);
  const secure = port === 465;

  const auth = (config.smtpUser && config.smtpPass) ? {
    user: config.smtpUser.trim(),
    pass: config.smtpPass.trim()
  } : undefined;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth,
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Builds responsive HTML email template for Admin Order Notification
 */
export function buildAdminOrderHtml(order, config = getMailerConfig()) {
  const status = (order.status || 'PENDING').toUpperCase();
  const currencySymbol = order.currency === 'USD' ? '$' : '₹';
  const total = Number(order.total || 0);
  const subtotal = Number(order.subtotal || total);
  const discount = Number(order.discount || 0);

  // 18% GST calculation breakdown for Indian tax invoice compliance
  const taxableValue = +(total / 1.18).toFixed(2);
  const gstAmount = +(total - taxableValue).toFixed(2);
  const cgst = +(gstAmount / 2).toFixed(2);
  const sgst = +(gstAmount / 2).toFixed(2);

  let badgeHtml = '';
  let statusDisplay = '';
  let noticeHtml = '';
  let headerTitle = 'New Order Alert';

  if (status === 'PAID') {
    headerTitle = 'New Paid Order on ITPracticeTests.com';
    badgeHtml = `
      <div style="background: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 14px; border-radius: 9999px; display: inline-block; margin-bottom: 12px;">
        ✅ Verified Customer Purchase - Access Active
      </div>`;
    statusDisplay = '<span style="color: #15803d; font-weight: 800;">PAID &amp; FULFILLED</span>';
    noticeHtml = `
      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 12px; font-size: 11px; color: #065f46; margin-top: 20px;">
        <strong>🔒 Zero-Trust Fulfillment:</strong> Access to all purchased exams has been confirmed and provisioned directly into the student dashboard. A tax invoice receipt was delivered to <strong>${order.customerEmail}</strong>.
      </div>`;
  } else if (status === 'FAILED') {
    headerTitle = 'Order Payment Failed on ITPracticeTests.com';
    badgeHtml = `
      <div style="background: #ef4444; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 14px; border-radius: 9999px; display: inline-block; margin-bottom: 12px;">
        ❌ Payment Failed / Verification Declined
      </div>`;
    statusDisplay = '<span style="color: #b91c1c; font-weight: 800;">PAYMENT FAILED / DECLINED</span>';
    noticeHtml = `
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 12px; font-size: 11px; color: #991b1b; margin-top: 20px;">
        <strong>⚠️ Security Notice:</strong> Payment transaction failed or could not be verified with banking records. Course access was <strong>NOT</strong> granted.${order.failureReason ? `<br><strong>Reason:</strong> ${order.failureReason}` : ''}
      </div>`;
  } else {
    headerTitle = 'New Order Placed on ITPracticeTests.com';
    badgeHtml = `
      <div style="background: #f59e0b; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 14px; border-radius: 9999px; display: inline-block; margin-bottom: 12px;">
        ⏳ New Order Placed - Awaiting Payment
      </div>`;
    statusDisplay = '<span style="color: #b45309; font-weight: 800;">AWAITING PAYMENT / IN PROCESS</span>';
    noticeHtml = `
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px; font-size: 11px; color: #92400e; margin-top: 20px;">
        <strong>⏳ Order Status:</strong> Student has placed this order on the website and is currently on the checkout/payment step. Access will unlock automatically upon official gateway/bank confirmation.
      </div>`;
  }

  const itemsRows = (order.items || []).map((item, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 10px; font-size: 13px; color: #1e293b; font-weight: 600;">
        ${idx + 1}. ${item.title || 'Practice Exam'}
        <div style="font-size: 11px; color: #64748b; font-weight: normal; margin-top: 3px;">
          Vendor: <strong>${item.vendor || 'IT Certification'}</strong>
        </div>
      </td>
      <td style="padding: 12px 10px; font-size: 13px; color: #0f172a; text-align: right; font-weight: bold; white-space: nowrap;">
        ${currencySymbol}${order.currency === 'USD' ? (item.priceUSD || item.priceINR || 0) : (item.priceINR || 0)}
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order ${order.orderId} - ${headerTitle}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #334155;">
  <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4c1d95 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
      ${badgeHtml}
      <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">${headerTitle}</h1>
      <p style="margin: 8px 0 0; font-size: 13px; opacity: 0.95; color: #e9d5ff;">
        Order Reference: <strong>${order.orderId}</strong> • Amount: <strong>${currencySymbol}${total}</strong>
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 28px 24px;">
      <p style="font-size: 14px; margin-top: 0; color: #1e293b; line-height: 1.6;">
        Hello <strong>${config.instructorName}</strong>,
        <br>
        Order details for reference <strong>${order.orderId}</strong> are summarized below:
      </p>

      <!-- Customer Details -->
      <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #6b21a8; margin-top: 24px; margin-bottom: 8px; border-bottom: 2px solid #f3e8ff; padding-bottom: 4px;">
        👤 Customer Information
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; font-size: 12px; color: #64748b; font-weight: 600; width: 35%;">Full Name:</td>
          <td style="padding: 8px; font-size: 12px; color: #0f172a; font-weight: 700;">${order.customerName || 'Valued Learner'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; font-size: 12px; color: #64748b; font-weight: 600;">Email Address:</td>
          <td style="padding: 8px; font-size: 12px; color: #6b21a8; font-weight: 700; font-family: monospace;">
            <a href="mailto:${order.customerEmail}" style="color: #6b21a8; text-decoration: none;">${order.customerEmail}</a>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; font-size: 12px; color: #64748b; font-weight: 600;">Contact Phone:</td>
          <td style="padding: 8px; font-size: 12px; color: #0f172a; font-weight: 700;">${order.customerPhone || 'N/A'}</td>
        </tr>
      </table>

      <!-- Order & Payment Info -->
      <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #6b21a8; margin-top: 20px; margin-bottom: 8px; border-bottom: 2px solid #f3e8ff; padding-bottom: 4px;">
        💳 Transaction &amp; Payment Details
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; font-size: 12px; color: #64748b; font-weight: 600; width: 35%;">Order ID:</td>
          <td style="padding: 8px; font-size: 12px; color: #0f172a; font-weight: 700; font-family: monospace;">${order.orderId}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; font-size: 12px; color: #64748b; font-weight: 600;">Order Date:</td>
          <td style="padding: 8px; font-size: 12px; color: #0f172a; font-weight: 600;">${order.date || new Date().toISOString().split('T')[0]} (${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST)</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; font-size: 12px; color: #64748b; font-weight: 600;">Payment Gateway:</td>
          <td style="padding: 8px; font-size: 12px; color: #0f172a; font-weight: 700;">${order.paymentGateway || 'Razorpay / Official Gateway'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; font-size: 12px; color: #64748b; font-weight: 600;">Payment Method:</td>
          <td style="padding: 8px; font-size: 12px; color: #0f172a; font-weight: 600;">${order.paymentMethod || 'Gateway Capture'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; font-size: 12px; color: #64748b; font-weight: 600;">Transaction / Ref ID:</td>
          <td style="padding: 8px; font-size: 12px; color: #059669; font-weight: 700; font-family: monospace;">${order.transactionId || order.attemptedTransactionId || 'PENDING'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px; font-size: 12px; color: #64748b; font-weight: 600;">Order Status:</td>
          <td style="padding: 8px; font-size: 12px; font-weight: 800;">${statusDisplay}</td>
        </tr>
      </table>

      <!-- Items Purchased -->
      <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #6b21a8; margin-top: 20px; margin-bottom: 8px; border-bottom: 2px solid #f3e8ff; padding-bottom: 4px;">
        📦 Enrolled Practice Exams &amp; Courses
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 8px 10px; font-size: 11px; text-transform: uppercase; color: #64748b; text-align: left;">Course Title</th>
            <th style="padding: 8px 10px; font-size: 11px; text-transform: uppercase; color: #64748b; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Pricing Summary Card -->
      <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Subtotal:</td>
            <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #1e293b;">${currencySymbol}${subtotal}</td>
          </tr>
          ${discount > 0 ? `
          <tr>
            <td style="padding: 4px 0; color: #16a34a;">Promotional Discount:</td>
            <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #16a34a;">-${currencySymbol}${discount}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Taxable Value:</td>
            <td style="padding: 4px 0; text-align: right; color: #475569;">${currencySymbol}${taxableValue}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">CGST (9%) + SGST (9%):</td>
            <td style="padding: 4px 0; text-align: right; color: #475569;">${currencySymbol}${gstAmount} (${currencySymbol}${cgst} + ${currencySymbol}${sgst})</td>
          </tr>
          <tr style="border-top: 2px dashed #d8b4fe;">
            <td style="padding: 10px 0 4px; font-size: 16px; font-weight: 900; color: #581c87;">Grand Total:</td>
            <td style="padding: 10px 0 4px; text-align: right; font-size: 18px; font-weight: 900; color: #581c87;">${currencySymbol}${total}</td>
          </tr>
        </table>
      </div>

      <!-- Security & Fulfillment Notice -->
      ${noticeHtml}
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; font-size: 11px; color: #94a3b8; text-align: center;">
      <div style="font-weight: bold; color: #475569; margin-bottom: 4px;">
        ${config.businessName} • Online IT Certification &amp; Practice Tests Platform
      </div>
      <div>
        ${config.officeAddress}
      </div>
      <div style="margin-top: 6px;">
        GSTIN: <strong>${config.gstNumber}</strong> • Phone: <strong>${config.supportPhone}</strong> • Admin Desk: <a href="mailto:${config.primaryAdminEmail}" style="color: #6b21a8;">${config.primaryAdminEmail}</a>
      </div>
      <div style="margin-top: 10px; font-size: 10px; color: #cbd5e1;">
        Automated real-time purchase alert generated by ITPracticeTests Order Dispatch Engine.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Builds Plaintext email summary
 */
export function buildAdminOrderPlainText(order, config = getMailerConfig()) {
  const status = (order.status || 'PENDING').toUpperCase();
  const currencySymbol = order.currency === 'USD' ? '$' : '₹';
  const itemsText = (order.items || []).map((it, idx) => `  ${idx + 1}. ${it.title} (${currencySymbol}${order.currency === 'USD' ? (it.priceUSD || it.priceINR) : it.priceINR})`).join('\n');

  return `
[ITPracticeTests] ORDER NOTIFICATION #${order.orderId}
==================================================
Date: ${order.date || new Date().toISOString().split('T')[0]}
Total Amount: ${currencySymbol}${order.total} ${order.currency}
Status: ${status} (${order.paymentMethod || order.paymentGateway})

CUSTOMER DETAILS:
Name: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone || 'N/A'}

PURCHASED EXAMS:
${itemsText}

FINANCIAL BREAKDOWN:
Subtotal: ${currencySymbol}${order.subtotal || order.total}
Discount: ${currencySymbol}${order.discount || 0}
Total: ${currencySymbol}${order.total}
GSTIN: ${config.gstNumber} (18% GST Compliant)
Transaction ID: ${order.transactionId || order.attemptedTransactionId || 'PENDING'}

FULFILLMENT STATUS:
${status === 'PAID' ? 'Lifetime access provisioned to student dashboard.' : status === 'FAILED' ? `Payment failed or declined. Reason: ${order.failureReason || 'Not verified'}` : 'Order placed, awaiting customer payment completion.'}
==================================================
  `.trim();
}

/**
 * Dispatches an automated order notification email to the store administrator
 */
export async function sendAdminOrderEmail(order) {
  const config = getMailerConfig();

  if (config.enableInstantEmail === false) {
    console.log('[Mailer] Instant admin order email is disabled in settings.');
    return { success: false, reason: 'DISABLED' };
  }

  const status = (order.status || 'PENDING').toUpperCase();

  // Admin should ONLY receive notification emails for successfully placed orders (PAID / COMPLETED)
  // Suppress emails for pending, awaiting payment, or failed orders to avoid inbox spam.
  if (status !== 'PAID' && status !== 'COMPLETED') {
    console.log(`[Mailer] Suppressed admin order notification for order ${order.orderId || order.id || 'N/A'} (status: ${status}). Admin only receives successfully placed paid orders.`);
    return { success: false, reason: 'SUPPRESSED_NON_PAID', status };
  }

  const currencySymbol = order.currency === 'USD' ? '$' : '₹';
  const subject = `✅ [Order Paid & Verified] ${order.orderId} - ${currencySymbol}${order.total} from ${order.customerName || 'Student'}`;
  const htmlContent = buildAdminOrderHtml(order, config);
  const textContent = buildAdminOrderPlainText(order, config);

  const emailRecord = {
    id: `email-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    orderId: order.orderId,
    timestamp: new Date().toISOString(),
    recipient: config.primaryAdminEmail,
    cc: config.secondaryAdminEmail || undefined,
    sender: config.senderEmail || 'orders@itpracticetests.com',
    subject,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    total: order.total,
    currency: order.currency,
    itemsCount: order.items?.length || 1,
    status: 'PENDING',
    htmlContent,
    textContent
  };

  // Check if SMTP is configured
  if (!config.smtpUser || !config.smtpPass) {
    console.warn(`[Mailer Notice] SMTP credentials are not yet configured. Email record saved to Admin Mailbox for ${config.primaryAdminEmail}.`);
    emailRecord.status = 'SAVED_TO_MAILBOX';
    emailRecord.error = 'SMTP credentials pending configuration in Admin Panel';
    logDispatchedEmail(emailRecord);
    return {
      success: true,
      savedLocally: true,
      emailRecord,
      message: `Order notification saved to Admin Mailbox. (To deliver to Gmail inbox, configure SMTP in Admin Panel).`
    };
  }

  try {
    const transporter = createTransporter(config);
    const mailOptions = {
      from: `"${config.senderName}" <${config.senderEmail || config.smtpUser}>`,
      to: config.primaryAdminEmail,
      cc: config.secondaryAdminEmail || undefined,
      subject,
      text: textContent,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer Success] 📧 Admin order notification dispatched successfully to ${config.primaryAdminEmail}! MessageID: ${info.messageId}`);
    emailRecord.status = 'DELIVERED';
    emailRecord.messageId = info.messageId;
    logDispatchedEmail(emailRecord);

    return {
      success: true,
      delivered: true,
      messageId: info.messageId,
      emailRecord
    };
  } catch (err) {
    console.error(`[Mailer Error] Failed to send email via SMTP to ${config.primaryAdminEmail}:`, err.message);
    emailRecord.status = 'FAILED';
    emailRecord.error = err.message;
    logDispatchedEmail(emailRecord);

    return {
      success: false,
      error: err.message,
      emailRecord
    };
  }
}

/**
 * Diagnostic tool: Sends a live test email to verify SMTP configuration
 */
export async function sendTestAdminEmail(targetRecipient = null) {
  const config = getMailerConfig();
  const recipient = targetRecipient || config.primaryAdminEmail || 'support@itpracticetests.com';

  const testOrder = {
    orderId: `ITPT-TEST-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    customerName: 'Diagnostic System Test',
    customerEmail: 'test.learner@itpracticetests.com',
    customerPhone: '+91-9253330335',
    currency: 'INR',
    subtotal: 1499,
    discount: 0,
    total: 1499,
    paymentGateway: 'Diagnostic SMTP Test',
    paymentMethod: 'Instant Test Dispatch',
    transactionId: `TEST_TXN_${Date.now()}`,
    status: 'PAID',
    items: [
      {
        id: 'test-aws-saa',
        title: 'AWS Certified Solutions Architect Associate (SAA-C03)',
        vendor: 'Amazon Web Services (AWS)',
        priceINR: 1499,
        priceUSD: 19.99
      }
    ]
  };

  if (!config.smtpUser || !config.smtpPass) {
    const err = 'SMTP Username (email) and Password (e.g. Gmail App Password) must be provided to send live emails.';
    return {
      success: false,
      error: err,
      config: {
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        smtpUser: config.smtpUser ? 'Configured' : 'Missing',
        primaryAdminEmail: config.primaryAdminEmail
      }
    };
  }

  try {
    const transporter = createTransporter(config);
    const html = buildAdminOrderHtml(testOrder, config);
    const text = buildAdminOrderPlainText(testOrder, config);

    const info = await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail || config.smtpUser}>`,
      to: recipient,
      subject: `✅ [Test Successful] ITPracticeTests Admin Email Notification Connected!`,
      text: `Congratulations! Your SMTP email connection is working properly.\n\nWhenever a student places an order on ITPracticeTests, you will receive full order details instantly at ${recipient}.\n\n` + text,
      html: `
        <div style="background: #10b981; color: white; padding: 16px; border-radius: 8px; margin-bottom: 20px; font-family: sans-serif; text-align: center;">
          <h2 style="margin: 0 0 6px;">🎉 SMTP Email Connection Verified!</h2>
          <p style="margin: 0; font-size: 13px;">This test confirms that order notification emails are active and delivering directly to <strong>${recipient}</strong>.</p>
        </div>
        ${html}
      `
    });

    console.log(`[Mailer Diagnostic] Test email successfully delivered to ${recipient}! Message ID: ${info.messageId}`);
    return {
      success: true,
      delivered: true,
      messageId: info.messageId,
      recipient
    };
  } catch (err) {
    console.error(`[Mailer Diagnostic Error]:`, err);
    return {
      success: false,
      error: err.message
    };
  }
}
