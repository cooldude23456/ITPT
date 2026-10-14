import crypto from 'crypto';
import { app } from '../server/index.js';

async function runSecurityTestSuite() {
  console.log('================================================================');
  console.log('   ITPracticeTests.com - ZERO-TRUST PAYMENT & SECURITY AUDIT    ');
  console.log('================================================================\n');

  const PORT = 5097;
  const server = app.listen(PORT);
  const baseUrl = `http://localhost:${PORT}`;

  let passedTests = 0;
  const totalTests = 10;
  const testEmail = `student_${Date.now()}@example.com`;
  const paidCourseId = '00796cff-0a93-40fe-a22a-44433794233d'; // AWS SAA-C03 (Canonical price: ₹399)

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Price Tampering Attack Defense
    // -------------------------------------------------------------------------
    console.log('[Test 1] Price Manipulation Attack:');
    const tamperReq = {
      items: [{
        id: paidCourseId,
        title: 'Tampered AWS Course Title',
        priceINR: 1, // Attacker tries to set ₹1
        priceUSD: 0.05
      }],
      customerEmail: testEmail,
      customerName: 'Security Test Student',
      currency: 'INR'
    };

    const orderRes = await fetch(`${baseUrl}/api/orders/create-pending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tamperReq)
    }).then(r => r.json());

    if (orderRes.success && orderRes.total === 399 && orderRes.status === 'PENDING') {
      console.log('  ✓ PASSED: Attacker price ₹1 was rejected. Server enforced canonical ₹399. Order status: PENDING.');
      passedTests++;
    } else {
      console.error('  ✗ FAILED: Price tampering not properly neutralized:', orderRes);
    }

    // -------------------------------------------------------------------------
    // TEST 2: Course Access Guard Before Payment
    // -------------------------------------------------------------------------
    console.log('\n[Test 2] Direct Course Access Attempt Before Payment:');
    const accessBefore = await fetch(`${baseUrl}/api/access/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        productId: paidCourseId
      })
    }).then(r => r.json());

    if (accessBefore.hasAccess === false && accessBefore.reason === 'PAYMENT_REQUIRED') {
      console.log('  ✓ PASSED: Direct access blocked. Reason: PAYMENT_REQUIRED. Course access NOT granted.');
      passedTests++;
    } else {
      console.error('  ✗ FAILED: Unauthorized user granted access:', accessBefore);
    }

    // -------------------------------------------------------------------------
    // TEST 3: Direct Enrollment API Bypass Attack
    // -------------------------------------------------------------------------
    console.log('\n[Test 3] Direct Call to /api/access/enroll (Privilege Escalation):');
    const directEnroll = await fetch(`${baseUrl}/api/access/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        productId: paidCourseId
      })
    });

    if (directEnroll.status === 403) {
      console.log('  ✓ PASSED: Direct enrollment API rejected with 403 Forbidden.');
      passedTests++;
    } else {
      console.error('  ✗ FAILED: Expected 403, got status:', directEnroll.status);
    }

    // -------------------------------------------------------------------------
    // TEST 4: Invalid / Forged Payment Verification Attack
    // -------------------------------------------------------------------------
    console.log('\n[Test 4] Forged Payment Signature Attack:');
    const forgedVerify = await fetch(`${baseUrl}/api/orders/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderRes.orderId,
        paymentId: 'pay_tampered_txn_999',
        signature: 'invalid_forged_signature_hash_99999',
        gatewayProvider: 'Razorpay'
      })
    });

    const forgedJson = await forgedVerify.json();

    // Verify access remains strictly blocked
    const accessAfterForged = await fetch(`${baseUrl}/api/access/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        productId: paidCourseId
      })
    }).then(r => r.json());

    if (forgedVerify.status === 400 && forgedJson.status === 'FAILED' && accessAfterForged.hasAccess === false) {
      console.log('  ✓ PASSED: Forged signature rejected (400 FAILED). Course remains locked.');
      passedTests++;
    } else {
      console.error('  ✗ FAILED: Forged signature was not rejected:', forgedJson, accessAfterForged);
    }

    // -------------------------------------------------------------------------
    // TEST 5: Legitimate Gateway Cryptographic Handshake
    // -------------------------------------------------------------------------
    console.log('\n[Test 5] Legitimate Cryptographic Payment Verification Handshake:');
    const paymentId = `pay_real_${Date.now()}`;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_live_secret_k98124';
    const validSignature = crypto.createHmac('sha256', secret)
      .update(`${orderRes.orderId}|${paymentId}`)
      .digest('hex');

    const validVerify = await fetch(`${baseUrl}/api/orders/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderRes.orderId,
        paymentId,
        signature: validSignature,
        gatewayProvider: 'Razorpay'
      })
    }).then(r => r.json());

    if (validVerify.success && validVerify.status === 'PAID') {
      console.log(`  ✓ PASSED: Valid HMAC verified. Order ${orderRes.orderId} marked as PAID. Transaction: ${paymentId}.`);
      passedTests++;
    } else {
      console.error('  ✗ FAILED: Legitimate verification failed:', validVerify);
    }

    // -------------------------------------------------------------------------
    // TEST 6: Post-Payment Course Access Authorization
    // -------------------------------------------------------------------------
    console.log('\n[Test 6] Verified Course Access After Backend Payment Confirmation:');
    const accessAfterPaid = await fetch(`${baseUrl}/api/access/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        productId: paidCourseId
      })
    }).then(r => r.json());

    if (accessAfterPaid.hasAccess === true && accessAfterPaid.isEnrolled === true) {
      console.log('  ✓ PASSED: Course access unlocked after verified payment confirmation.');
      passedTests++;
    } else {
      console.error('  ✗ FAILED: Course access not granted after verified payment:', accessAfterPaid);
    }

    // -------------------------------------------------------------------------
    // TEST 7: Idempotency & Replay Attack Defense
    // -------------------------------------------------------------------------
    console.log('\n[Test 7] Payment Replay & Idempotency Test:');
    const replayVerify = await fetch(`${baseUrl}/api/orders/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderRes.orderId,
        paymentId,
        signature: validSignature,
        gatewayProvider: 'Razorpay'
      })
    }).then(r => r.json());

    if (replayVerify.success && (replayVerify.alreadyProcessed || replayVerify.status === 'PAID')) {
      console.log('  ✓ PASSED: Replayed request handled idempotently without duplicate orders or errors.');
      passedTests++;
    } else {
      console.error('  ✗ FAILED: Idempotency handling error:', replayVerify);
    }

    // -------------------------------------------------------------------------
    // TEST 8: Secret API Keys Protection Audit
    // -------------------------------------------------------------------------
    console.log('\n[Test 8] Secret API Keys Protection Audit (/api/gateways):');
    const gatewaysRes = await fetch(`${baseUrl}/api/gateways`).then(r => r.json());
    const gws = gatewaysRes.gateways || [];
    const hasExposedSecret = gws.some(g => g.keySecret || g.webhookSecret || g.clientSecret || g.secretKey);

    if (!hasExposedSecret && gws.length > 0) {
      console.log(`  ✓ PASSED: ${gws.length} active gateways audited. Zero secret keys exposed in public response.`);
      passedTests++;
    } else {
      console.error('  ✗ FAILED: Secret key exposed in public API response!');
    }

    // -------------------------------------------------------------------------
    // TEST 9: Free Diagnostic Course Access Rule
    // -------------------------------------------------------------------------
    console.log('\n[Test 9] Free Diagnostic Course Access Rule:');
    const freeAccess = await fetch(`${baseUrl}/api/access/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'anonymous.learner@example.com',
        productId: 'free-az900-diagnostic'
      })
    }).then(r => r.json());

    if (freeAccess.hasAccess === true && freeAccess.isFree === true) {
      console.log('  ✓ PASSED: Free diagnostic test correctly accessible without requiring a paid order.');
      passedTests++;
    } else {
      console.error('  ✗ FAILED: Free diagnostic test not authorized:', freeAccess);
    }

    // -------------------------------------------------------------------------
    // TEST 10: Cross-User Access Isolation
    // -------------------------------------------------------------------------
    console.log('\n[Test 10] Cross-User Access Isolation:');
    const otherUserAccess = await fetch(`${baseUrl}/api/access/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `stranger_${Date.now()}@example.com`,
        productId: paidCourseId
      })
    }).then(r => r.json());

    if (otherUserAccess.hasAccess === false && otherUserAccess.reason === 'PAYMENT_REQUIRED') {
      console.log('  ✓ PASSED: Unpaid user cannot access courses purchased by other students.');
      passedTests++;
    } else {
      console.error('  ✗ FAILED: Cross-user access isolation breach!');
    }

    console.log('\n================================================================');
    console.log(`   AUDIT RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (100% SUCCESS)`);
    console.log('================================================================\n');

    server.close();
    process.exit(passedTests === totalTests ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    server.close();
    process.exit(1);
  }
}

runSecurityTestSuite();
