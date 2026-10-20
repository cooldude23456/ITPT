// ITPracticeTests.com - Automated Admin Order Notification & Email Dispatch Service
// Dispatches full transaction receipts, customer details, and lifetime fulfillment logs to Admin.

const DEFAULT_ADMIN_SETTINGS = {
  primaryAdminEmail: 'support@itpracticetests.com',
  secondaryAdminEmail: 'rath.sanjiv.rath@gmail.com',
  instructorName: 'Yogesh Dhiman',
  businessName: 'ITPracticeTests',
  gstNumber: '03AKXPD3010G1ZM',
  officeAddress: 'Office No. 715, 7th Floor, Block D&E, CCC, VIP Road, Zirakpur, Punjab, India – 140603',
  supportPhone: '+91-9253330335',
  enableInstantEmail: true,
  enableBrowserNotification: true,
  webhookUrl: '', // Optional webhook (Zapier, Make, Slack, Discord, or custom API)
  smtpProvider: 'ITPracticeTests Cloud Dispatcher (TLS 1.3)'
};

/**
 * Retrieves Admin Email Notification Settings from localStorage or defaults
 */
export function getAdminEmailSettings() {
  try {
    const saved = localStorage.getItem('itpt_admin_email_settings');
    return saved ? { ...DEFAULT_ADMIN_SETTINGS, ...JSON.parse(saved) } : DEFAULT_ADMIN_SETTINGS;
  } catch (e) {
    return DEFAULT_ADMIN_SETTINGS;
  }
}

/**
 * Saves Admin Email Notification Settings to localStorage
 */
export function saveAdminEmailSettings(settings) {
  try {
    const merged = { ...getAdminEmailSettings(), ...settings };
    localStorage.setItem('itpt_admin_email_settings', JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error('Failed to save admin email settings:', e);
    return getAdminEmailSettings();
  }
}

/**
 * Retrieves all dispatched Admin Order Notification Emails from storage
 */
export function getAdminEmailInbox() {
  try {
    const saved = localStorage.getItem('itpt_admin_email_inbox');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Saves a dispatched email into the Admin Inbox storage
 */
export function saveEmailToAdminInbox(emailRecord) {
  try {
    const current = getAdminEmailInbox();
    const updated = [emailRecord, ...current].slice(0, 100); // keep last 100 emails
    localStorage.setItem('itpt_admin_email_inbox', JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save email to admin inbox:', e);
    return [];
  }
}

/**
 * Generates responsive HTML email template for the Admin Order Notification
 */
export function generateAdminOrderEmailHtml(order, settings = getAdminEmailSettings()) {
  const status = (order.status || 'PENDING').toUpperCase();
  const currencySymbol = order.currency === 'USD' ? '$' : '₹';
  const subtotal = order.subtotal || order.total;
  const discount = order.discount || 0;
  const total = order.total;

  // 18% GST calculation breakdown for Indian compliance
  const taxableValue = +(total / 1.18).toFixed(2);
  const gstAmount = +(total - taxableValue).toFixed(2);

  let badgeText = '🛒 Order Placed - Payment Pending';
  let badgeColor = '#f59e0b';
  let titleText = 'New Order Placed on ITPracticeTests.com';
  let introText = `A student has placed an order on <strong>ITPracticeTests.com</strong> and is currently completing the payment process. Lifetime access will unlock upon bank confirmation.`;
  let statusBadge = `<span style="color: #b45309; font-weight: 800;">⏳ AWAITING PAYMENT</span>`;
  let securityBox = `
    <div class="security-badge" style="background: #fffbeb; border: 1px solid #fde68a; color: #92400e;">
      <strong>⏳ Order Awaiting Payment:</strong> The student has initiated this checkout. As soon as payment confirmation is received, access will unlock automatically.
    </div>`;

  if (status === 'PAID') {
    badgeText = '✅ Verified Customer Purchase';
    badgeColor = '#10b981';
    titleText = 'New Paid Order on ITPracticeTests.com';
    introText = `A student has completed a verified purchase on <strong>ITPracticeTests.com</strong>. The payment was validated and lifetime access has been provisioned to the student dashboard.`;
    statusBadge = `<span style="color: #15803d; font-weight: 800;">✓ PAID &amp; ACCESS UNLOCKED</span>`;
    securityBox = `
      <div class="security-badge" style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46;">
        <strong>🔒 Zero-Trust Security &amp; Fulfillment Active:</strong>
        <br>
        • Payment Reference: <code style="font-size: 11px;">${order.transactionId || 'VERIFIED'}</code>
        <br>
        • Lifetime Access Policy: Student has received full lifetime access to all purchased exams.
      </div>`;
  } else if (status === 'FAILED') {
    badgeText = '❌ Payment Failed / Declined';
    badgeColor = '#ef4444';
    titleText = 'Order Payment Failed on ITPracticeTests.com';
    introText = `A payment transaction was attempted or submitted on <strong>ITPracticeTests.com</strong>, but could not be verified with banking records. Course access was <strong>NOT</strong> granted.`;
    statusBadge = `<span style="color: #b91c1c; font-weight: 800;">❌ PAYMENT FAILED / DECLINED</span>`;
    securityBox = `
      <div class="security-badge" style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b;">
        <strong>⚠️ Security Notice:</strong> Transaction reference was declined or rejected by the payment gateway/bank. Course access was NOT granted.${order.failureReason ? `<br><strong>Reason:</strong> ${order.failureReason}` : ''}
      </div>`;
  }

  const itemsHtml = (order.items || [])
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px; font-size: 13px; color: #1e293b; font-weight: 600;">
          ${idx + 1}. ${item.title}
          <div style="font-size: 11px; color: #64748b; font-weight: normal; margin-top: 2px;">
            Vendor: <strong>${item.vendor || 'IT Certification'}</strong>
          </div>
        </td>
        <td style="padding: 12px 8px; font-size: 13px; color: #0f172a; text-align: right; font-weight: bold; white-space: nowrap;">
          ${currencySymbol}${order.currency === 'USD' ? item.priceUSD || item.priceINR : item.priceINR}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order ${order.orderId} - ${titleText}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #334155; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4c1d95 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .badge { background: ${badgeColor}; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; display: inline-block; margin-bottom: 12px; }
    .content { padding: 28px 24px; }
    .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #6b21a8; margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #f3e8ff; padding-bottom: 4px; }
    .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .info-grid td { padding: 8px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
    .info-label { color: #64748b; font-weight: 600; width: 35%; }
    .info-value { color: #0f172a; font-weight: 700; }
    .table-items { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .table-items th { background: #f8fafc; padding: 10px 8px; font-size: 11px; text-transform: uppercase; color: #64748b; text-align: left; border-bottom: 2px solid #e2e8f0; }
    .total-card { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .security-badge { border-radius: 10px; padding: 12px; font-size: 11px; margin-top: 20px; line-height: 1.5; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="badge">${badgeText}</div>
      <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">${titleText}</h1>
      <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9; color: #e9d5ff;">
        Order ID: <strong>${order.orderId}</strong> • Amount: <strong>${currencySymbol}${total}</strong>
      </p>
    </div>

    <!-- Content -->
    <div class="content">
      <p style="font-size: 14px; margin-top: 0; color: #1e293b; line-height: 1.5;">
        Hello <strong>${settings.instructorName}</strong>,
        <br>
        ${introText}
      </p>

      <!-- Customer Details -->
      <div class="section-title">👤 Customer Details</div>
      <table class="info-grid">
        <tr>
          <td class="info-label">Customer Name:</td>
          <td class="info-value">${order.customerName || 'Student'}</td>
        </tr>
        <tr>
          <td class="info-label">Customer Email:</td>
          <td class="info-value"><a href="mailto:${order.customerEmail}" style="color: #6b21a8; text-decoration: none;">${order.customerEmail}</a></td>
        </tr>
        <tr>
          <td class="info-label">Customer Phone / Contact:</td>
          <td class="info-value">${order.customerPhone || '+91-9253330335'}</td>
        </tr>
        <tr>
          <td class="info-label">Order Date & Time:</td>
          <td class="info-value">${order.date || new Date().toISOString().split('T')[0]}</td>
        </tr>
      </table>

      <!-- Items Purchased -->
      <div class="section-title">📦 Course &amp; Practice Exam Bundles</div>
      <table class="table-items">
        <thead>
          <tr>
            <th>Product & Curriculum</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Payment & Financial Summary -->
      <div class="section-title">💳 Payment Details</div>
      <div class="total-card">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="color: #64748b; padding: 4px 0;">Item Subtotal:</td>
            <td style="text-align: right; font-weight: bold; color: #1e293b;">${currencySymbol}${subtotal}</td>
          </tr>
          ${
            discount > 0
              ? `
          <tr>
            <td style="color: #16a34a; padding: 4px 0;">Coupon Discount Applied:</td>
            <td style="text-align: right; font-weight: bold; color: #16a34a;">-${currencySymbol}${discount}</td>
          </tr>`
              : ''
          }
          <tr>
            <td style="color: #64748b; padding: 4px 0;">Taxable Amount (Net):</td>
            <td style="text-align: right; font-weight: bold; color: #1e293b;">${currencySymbol}${taxableValue}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 4px 0;">GST (18% Included):</td>
            <td style="text-align: right; font-weight: bold; color: #1e293b;">${currencySymbol}${gstAmount}</td>
          </tr>
          <tr style="border-top: 2px dashed #d8b4fe;">
            <td style="padding: 10px 0 0; font-size: 15px; font-weight: 900; color: #581c87;">Grand Total:</td>
            <td style="padding: 10px 0 0; text-align: right; font-size: 16px; font-weight: 900; color: #581c87;">
              ${currencySymbol}${total} ${order.currency || 'INR'}
            </td>
          </tr>
        </table>
      </div>

      <!-- Payment Gateway Info -->
      <table class="info-grid">
        <tr>
          <td class="info-label">Payment Gateway:</td>
          <td class="info-value" style="color: #6b21a8;">${order.paymentGateway || order.paymentMethod || 'Razorpay / Gateway'}</td>
        </tr>
        <tr>
          <td class="info-label">Transaction Reference:</td>
          <td class="info-value" style="font-family: monospace;">${order.transactionId || order.attemptedTransactionId || 'PENDING'}</td>
        </tr>
        <tr>
          <td class="info-label">Order Status:</td>
          <td class="info-value">${statusBadge}</td>
        </tr>
        <tr>
          <td class="info-label">GSTIN / Entity:</td>
          <td class="info-value" style="font-family: monospace;">${settings.gstNumber}</td>
        </tr>
      </table>

      ${securityBox}
    </div>

    <!-- Footer -->
    <div class="footer">
      <div style="font-weight: bold; color: #475569; margin-bottom: 4px;">
        ${settings.businessName} • Online IT Certification Platform
      </div>
      <div>${settings.officeAddress}</div>
      <div style="margin-top: 6px;">
        GSTIN: <strong>${settings.gstNumber}</strong> • Phone: <strong>${settings.supportPhone}</strong>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generates Plaintext email summary for fallback / SMS / Webhooks
 */
export function generateAdminOrderEmailPlainText(order, settings = getAdminEmailSettings()) {
  const status = (order.status || 'PENDING').toUpperCase();
  const currencySymbol = order.currency === 'USD' ? '$' : '₹';
  const itemsList = (order.items || [])
    .map((item, i) => `  ${i + 1}. ${item.title} (${currencySymbol}${order.currency === 'USD' ? item.priceUSD || item.priceINR : item.priceINR})`)
    .join('\n');

  return `
[ITPracticeTests] ORDER NOTIFICATION #${order.orderId}
==================================================
Date: ${order.date || new Date().toISOString().split('T')[0]}
Total Amount: ${currencySymbol}${order.total} ${order.currency || 'INR'}
Status: ${status} (${order.paymentGateway || order.paymentMethod || 'Gateway'})

CUSTOMER DETAILS:
-----------------
Name: ${order.customerName || 'Student'}
Email: ${order.customerEmail}
Phone: ${order.customerPhone || 'N/A'}

PURCHASED PRODUCTS:
-------------------
${itemsList}

FINANCIAL & TAX SUMMARY:
------------------------
Subtotal: ${currencySymbol}${order.subtotal || order.total}
Discount: ${currencySymbol}${order.discount || 0}
Total: ${currencySymbol}${order.total} ${order.currency || 'INR'}
GSTIN: ${settings.gstNumber} (18% GST compliant)
Transaction Ref: ${order.transactionId || order.attemptedTransactionId || 'PENDING'}

FULFILLMENT STATUS:
-------------------
${status === 'PAID' ? 'Lifetime access provisioned to student dashboard.' : status === 'FAILED' ? `Payment failed or declined. Reason: ${order.failureReason || 'Not verified'}` : 'Order placed, awaiting customer payment completion.'}

Admin Portal: https://www.itpracticetests.com/#admin
Support Desk: ${settings.primaryAdminEmail} | ${settings.supportPhone}
Registered Office: ${settings.officeAddress}
==================================================
  `.trim();
}

/**
 * Dispatches an automated email notification to the Admin upon purchase
 */
export async function dispatchAdminOrderNotificationEmail(order) {
  const settings = getAdminEmailSettings();
  const status = (order.status || 'PENDING').toUpperCase();

  // Admin should ONLY receive notification emails for successfully placed orders (PAID / COMPLETED)
  // Suppress emails for pending, awaiting payment, or failed orders to avoid spamming the admin.
  if (status !== 'PAID' && status !== 'COMPLETED') {
    console.log(`[EmailService] Suppressed admin notification for order ${order.orderId || ''} (status: ${status}). Admin only receives successfully placed orders.`);
    return { success: false, reason: 'SUPPRESSED_NON_PAID', status };
  }

  const currencySymbol = order.currency === 'USD' ? '$' : '₹';
  const subject = `✅ [Order Paid & Verified] ${order.orderId} - ${currencySymbol}${order.total} from ${order.customerName || 'Student'}`;

  const htmlBody = generateAdminOrderEmailHtml(order, settings);
  const textBody = generateAdminOrderEmailPlainText(order, settings);

  const emailRecord = {
    id: `email-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    orderId: order.orderId,
    timestamp: new Date().toISOString(),
    recipient: settings.primaryAdminEmail,
    cc: settings.secondaryAdminEmail,
    sender: 'orders@itpracticetests.com',
    subject,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    total: order.total,
    currency: order.currency || 'INR',
    itemsCount: order.items?.length || 1,
    status: 'PENDING',
    htmlContent: htmlBody,
    textContent: textBody,
    transport: settings.smtpProvider
  };

  // 1. Save into persistent Admin Inbox (so admin can view inside Admin Panel immediately)
  saveEmailToAdminInbox(emailRecord);

  // 2. Dispatch to backend API for real delivery via authenticated SMTP or PHP native mail
  try {
    const backendRes = await fetch('/api/admin/notify-order-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order })
    });
    const resData = await backendRes.json();
    if (resData?.emailRecord?.status) {
      emailRecord.status = resData.emailRecord.status;
      saveEmailToAdminInbox(emailRecord);
    }
  } catch (apiErr) {
    console.warn('[Mailer Client] Backend email dispatch notice:', apiErr.message);
  }

  // 3. Dispatch to custom webhook if configured (e.g. Slack/Discord/CRM/Nodemailer endpoint)
  if (settings.webhookUrl && settings.webhookUrl.startsWith('http')) {
    try {
      await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: status === 'PAID' ? 'order.completed' : status === 'FAILED' ? 'order.failed' : 'order.pending',
          order,
          emailNotification: emailRecord
        })
      });
    } catch (err) {
      console.warn('Admin order webhook dispatch warning:', err);
    }
  }

  // 4. Log formatted console dispatch for developer visibility
  console.log(
    `%c[ITPracticeTests Mailer] 📧 Admin Order Alert: ${subject}`,
    'background: #4c1d95; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
    {
      orderId: order.orderId,
      status,
      recipient: settings.primaryAdminEmail,
      subject,
      total: order.total,
      currency: order.currency
    }
  );

  return emailRecord;
}
