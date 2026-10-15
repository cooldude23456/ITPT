import express from 'express';
import {
  getMailerConfig,
  saveMailerConfig,
  getDispatchedEmails,
  sendTestAdminEmail
} from '../mailer.js';

const router = express.Router();

// GET /api/admin/email-settings
router.get('/email-settings', (req, res) => {
  try {
    const config = getMailerConfig();
    // Return sanitized config (mask password)
    const sanitized = {
      ...config,
      smtpPass: config.smtpPass ? '••••••••' : '',
      hasSmtpPassword: Boolean(config.smtpPass)
    };
    res.json({ success: true, settings: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/email-settings
router.post('/email-settings', (req, res) => {
  try {
    const incoming = req.body || {};
    const current = getMailerConfig();

    // If password came back as masked '••••••••', don't overwrite with dots
    if (incoming.smtpPass === '••••••••' || !incoming.smtpPass) {
      incoming.smtpPass = current.smtpPass;
    }

    const updated = saveMailerConfig(incoming);
    const sanitized = {
      ...updated,
      smtpPass: updated.smtpPass ? '••••••••' : '',
      hasSmtpPassword: Boolean(updated.smtpPass)
    };

    res.json({
      success: true,
      message: 'SMTP & Admin Email settings saved successfully!',
      settings: sanitized
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/send-test-email
router.post('/send-test-email', async (req, res) => {
  try {
    const { recipient } = req.body || {};
    const result = await sendTestAdminEmail(recipient);

    if (result.success) {
      res.json({
        success: true,
        message: `Diagnostic test email delivered successfully to ${result.recipient}!`,
        messageId: result.messageId
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to dispatch test email.'
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/email-logs
router.get('/email-logs', (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const logs = getDispatchedEmails(limit);
    res.json({ success: true, count: logs.length, emails: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, emails: [] });
  }
});

// POST /api/admin/resend-order-email
router.post('/resend-order-email', async (req, res) => {
  try {
    const { orderId, order } = req.body || {};
    let orderToResend = order;
    if (!orderToResend && orderId) {
      const { getOrders } = await import('../db.js');
      const allOrders = await getOrders();
      orderToResend = allOrders.find(o => o.orderId === orderId);
    }

    if (!orderToResend) {
      return res.status(404).json({ success: false, error: `Order ${orderId || ''} not found.` });
    }

    const { sendAdminOrderEmail } = await import('../mailer.js');
    const result = await sendAdminOrderEmail(orderToResend);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
