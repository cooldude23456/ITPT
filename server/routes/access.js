import express from 'express';
import { findCanonicalProduct, isCourseFree } from '../catalog.js';
import { checkAccess, getEnrolledCourseIds } from '../db.js';

const router = express.Router();

// -----------------------------------------------------------------------------
// VERIFY COURSE ACCESS (Zero-Trust Backend Authorization)
// Endpoint: POST /api/access/verify
// -----------------------------------------------------------------------------
router.post('/access/verify', async (req, res) => {
  try {
    const { email, productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        hasAccess: false,
        error: 'Product ID is required.'
      });
    }

    // 1. Check if course is free in canonical catalog or free diagnostic test
    if (
      productId === 'free-az900-diagnostic' ||
      productId === '943fcd85-67de-4414-82ef-49fb24be3f74' ||
      productId === '6804711e-87c7-4bae-a41a-6d80ba4a8f34'
    ) {
      return res.status(200).json({
        hasAccess: true,
        isFree: true,
        productId,
        message: 'Free diagnostic access authorized.'
      });
    }

    const product = findCanonicalProduct(productId);
    if (product && isCourseFree(product)) {
      return res.status(200).json({
        hasAccess: true,
        isFree: true,
        productId,
        message: 'Free diagnostic access authorized.'
      });
    }

    // 2. If not free, user MUST have a valid email
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return res.status(200).json({
        hasAccess: false,
        isFree: false,
        reason: 'LOGIN_REQUIRED',
        message: 'Please sign in with the email address used during purchase to access this course.'
      });
    }

    // 3. Verify enrollment in database
    const hasEnrollment = await checkAccess({ email: cleanEmail, productId });

    if (hasEnrollment) {
      return res.status(200).json({
        hasAccess: true,
        isFree: false,
        isEnrolled: true,
        productId,
        email: cleanEmail,
        message: 'Verified enrollment found in secure database. Full access authorized.'
      });
    }

    // 4. Access Denied: Paid course without verified payment
    return res.status(200).json({
      hasAccess: false,
      isFree: false,
      isEnrolled: false,
      reason: 'PAYMENT_REQUIRED',
      productId,
      priceINR: product?.priceINR || 399,
      priceUSD: product?.priceUSD || 4.99,
      message: 'Access Denied: Paid course requires a verified successful payment to unlock.'
    });
  } catch (err) {
    console.error('[Verify Access Error]:', err);
    return res.status(500).json({
      hasAccess: false,
      error: `Server access verification error: ${err.message}`
    });
  }
});

// -----------------------------------------------------------------------------
// GET ALL ENROLLED COURSES FOR USER
// Endpoint: GET /api/access/enrolled?email=...
// -----------------------------------------------------------------------------
router.get('/access/enrolled', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(200).json({ enrolledProductIds: [] });
    }

    const enrolledProductIds = await getEnrolledCourseIds(email);
    return res.status(200).json({
      success: true,
      email: email.toLowerCase().trim(),
      enrolledProductIds
    });
  } catch (err) {
    console.error('[Get Enrolled Error]:', err);
    return res.status(500).json({ success: false, error: err.message, enrolledProductIds: [] });
  }
});

// -----------------------------------------------------------------------------
// DIRECT ENROLLMENT ATTEMPT GUARD
// Endpoint: POST /api/access/enroll
// Direct calls without payment gateway verification are BLOCKED
// -----------------------------------------------------------------------------
router.post('/access/enroll', (req, res) => {
  return res.status(403).json({
    success: false,
    error: 'Direct enrollment without payment gateway verification is prohibited by security policy.'
  });
});

export default router;
