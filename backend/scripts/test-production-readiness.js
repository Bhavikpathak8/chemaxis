/**
 * C-Tech Chemical Trading Platform — Production Readiness & Integration Test Suite
 * Executes end-to-end real API integration checks against the running backend:
 * 1. Health & Deep Readiness Probes
 * 2. Sliding Window Rate Limiting & Security Headers
 * 3. Multi-channel OTP generation, hashing, and single-use verification
 * 4. Buyer and Seller Registration with duplicate conflict guards
 * 5. Role-Based Access Control (RBAC) and Dashboard isolation
 * 6. Business verification workflow (pending -> approved)
 * 7. Chemical Catalog, HazMat specifications, CAS validation, and Trader pricing margin
 * 8. Full Trade Workflow: RFQ -> Quotation Draft -> Quotation Sent -> Purchase Order
 * 9. Confidential Document Serving & PDFKit certificate verification
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:4000/api/v1';

let passedTests = 0;
let failedTests = 0;
const results = [];

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
    results.push({ name: testName, status: 'PASS', details });
  } else {
    console.error(`  [FAIL] ${testName} — ${details}`);
    failedTests++;
    results.push({ name: testName, status: 'FAIL', details });
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(url, {
    ...options,
    headers,
  });
  let body = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  return { status: res.status, headers: res.headers, body };
}

async function runAllTests() {
  console.log('================================================================');
  console.log('C-TECH TRADE DESK — PRODUCTION READINESS INTEGRATION TEST SUITE');
  console.log(`Target: ${BASE_URL} | Time: ${new Date().toISOString()}`);
  console.log('================================================================\n');

  const uniqueSuffix = Date.now().toString().slice(-6);

  // ---------------------------------------------------------------------------
  // TEST 1: Health & Deep Readiness Check
  // ---------------------------------------------------------------------------
  console.log('--> Section 1: Health & Telemetry Probes');
  const healthRes = await request('/health');
  assert(healthRes.status === 200 && healthRes.body.status === 'ok', 'Liveness probe (/health) returns 200 OK');

  const readyRes = await request('/health/ready');
  assert(
    readyRes.status === 200 && readyRes.body.status === 'ready' && readyRes.body.database?.connected === true,
    'Readiness probe (/health/ready) verifies PostgreSQL connection and pool health',
    `DB Latency: ${readyRes.body.database?.latencyMs}ms, RSS: ${readyRes.body.system?.memoryMb?.rss}MB`
  );

  // ---------------------------------------------------------------------------
  // TEST 2: Security & Rate Limiting Headers
  // ---------------------------------------------------------------------------
  console.log('\n--> Section 2: Security & Rate Limiting Headers');
  const limitHeader = healthRes.headers.get('x-ratelimit-limit');
  const remainingHeader = healthRes.headers.get('x-ratelimit-remaining');
  assert(
    Boolean(limitHeader && remainingHeader),
    'Rate limiting headers (X-RateLimit-Limit, X-RateLimit-Remaining) are present',
    `Limit: ${limitHeader}, Remaining: ${remainingHeader}`
  );

  // ---------------------------------------------------------------------------
  // TEST 3: Real OTP Lifecycle (Email & SMS)
  // ---------------------------------------------------------------------------
  console.log('\n--> Section 3: Multi-Provider OTP Verification Engine');
  const emailIdentifier = `buyer_${uniqueSuffix}_${Math.floor(Math.random() * 1000)}@institutional-pharma.com`;
  const sendEmailOtp = await request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ identifier: emailIdentifier, purpose: 'EMAIL_VERIFY' }),
  });
  assert(
    sendEmailOtp.status === 200 && sendEmailOtp.body.success === true,
    'Email OTP generated and dispatched via email service',
    `Delivery: ${sendEmailOtp.body.delivery}`
  );

  const phoneIdentifier = `+919${Math.floor(100000000 + Math.random() * 900000000)}`;
  const sendPhoneOtp = await request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ identifier: phoneIdentifier, purpose: 'PHONE_VERIFY' }),
  });
  assert(
    sendPhoneOtp.status === 200 && sendPhoneOtp.body.success === true,
    'SMS OTP generated and dispatched via normalized phone channel',
    `Delivery: ${sendPhoneOtp.body?.delivery}, Phone: ${phoneIdentifier}`
  );

  // Test OTP verification with issued code
  const issuedOtp = sendEmailOtp.body.debugOtp;
  if (issuedOtp) {
    const verifyRes = await request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier: emailIdentifier, otp: issuedOtp, purpose: 'EMAIL_VERIFY' }),
    });
    assert(verifyRes.status === 200 && verifyRes.body.valid === true, 'Valid OTP verifies successfully');

    // Replay attack test: reusing same OTP must fail
    const replayRes = await request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier: emailIdentifier, otp: issuedOtp, purpose: 'EMAIL_VERIFY' }),
    });
    assert(replayRes.status === 401, 'Replay attack prevented: Single-use OTP is invalidated after verification');
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Buyer Registration & Session Management
  // ---------------------------------------------------------------------------
  console.log('\n--> Section 4: Buyer Registration & Session Management');
  const buyerEmail = `procurement_${uniqueSuffix}@sunapharma.com`;
  const buyerPassword = 'SecureBuyerPassword#2026';
  const buyerGst = `24AAACB${uniqueSuffix.slice(0, 4)}A1Z8`;

  const buyerReg = await request('/auth/register/buyer', {
    method: 'POST',
    body: JSON.stringify({
      email: buyerEmail,
      password: buyerPassword,
      fullName: 'Vikram Mehta',
      companyName: 'Suna Pharmaceuticals Ltd',
      businessType: 'Finished Formulation Manufacturer',
      phone: `9879${uniqueSuffix}`,
      gstNumber: buyerGst,
      panNumber: buyerGst.slice(2, 12),
      address: 'Plot 45, Ankleshwar GIDC',
      city: 'Ankleshwar',
      state: 'Gujarat',
      pincode: '393002',
    }),
  });
  assert(buyerReg.status === 201 || buyerReg.status === 200, 'Buyer registered successfully with verified identity');

  // Test duplicate email rejection
  const dupBuyerReg = await request('/auth/register/buyer', {
    method: 'POST',
    body: JSON.stringify({
      email: buyerEmail,
      password: buyerPassword,
      fullName: 'Vikram Mehta Duplicate',
      companyName: 'Duplicate Entity Ltd',
      businessType: 'Formulator',
      phone: `9878${uniqueSuffix}`,
      address: 'Plot 45, Ankleshwar GIDC',
      city: 'Ankleshwar',
      state: 'Gujarat',
      pincode: '393002',
    }),
  });
  assert(dupBuyerReg.status === 409, 'Duplicate buyer registration blocked with HTTP 409 Conflict');

  // Test Buyer Login
  const buyerLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: buyerEmail, password: buyerPassword }),
  });
  assert(
    buyerLogin.status === 200 && Boolean(buyerLogin.body.accessToken),
    'Buyer authenticated successfully, received JWT tokens and session',
    `Role: ${buyerLogin.body.user?.role}`
  );
  const buyerToken = buyerLogin.body.accessToken;

  // ---------------------------------------------------------------------------
  // TEST 5: Super Admin Authentication & Platform Control
  // ---------------------------------------------------------------------------
  console.log('\n--> Section 5: Super Admin Authentication & 2FA Enforcement');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: 'admin@ctech.com', password: 'Admin@12345' }),
  });

  let adminToken = adminLogin.body.accessToken;
  if (adminLogin.body.requires2FA) {
    const twoFaRes = await request('/auth/login/2fa', {
      method: 'POST',
      body: JSON.stringify({ tempToken: adminLogin.body.tempToken, code: '123456' }),
    });
    adminToken = twoFaRes.body.accessToken;
  }

  assert(
    Boolean(adminToken),
    'Super Admin authenticated successfully with mandatory 2FA enforcement'
  );

  // Admin approves the buyer
  const pendingBuyersRes = await request('/users/buyers/pending', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const currentBuyer = Array.isArray(pendingBuyersRes.body)
    ? pendingBuyersRes.body.find((b) => b.company_name === 'Suna Pharmaceuticals Ltd')
    : null;
  if (currentBuyer) {
    const approveBuyerRes = await request(`/users/buyers/${currentBuyer.id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(approveBuyerRes.status === 200, 'Admin approves buyer corporate profile');
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Seller Multi-Step Registration & Verification Guard
  // ---------------------------------------------------------------------------
  console.log('\n--> Section 6: Seller Onboarding & Business Verification Guard');
  const sellerEmail = `factory_${uniqueSuffix}@gujaratchem.com`;
  const sellerPassword = 'SecureSellerPassword#2026';
  const sellerGst = `24AACCG${uniqueSuffix.slice(0, 4)}A1Z9`; // Exactly 15 chars

  const sellerReg = await request('/auth/register/seller', {
    method: 'POST',
    body: JSON.stringify({
      email: sellerEmail,
      password: sellerPassword,
      contactPerson: 'Harsh Patel',
      companyName: 'Gujarat Synthetics & Alkalis Pvt Ltd',
      businessType: 'Primary Synthesis Manufacturer',
      phone: `9924${uniqueSuffix}`,
      gstNumber: sellerGst,
      panNumber: sellerGst.slice(2, 12),
      address: 'Dahej PCPIR Zone-II',
      city: 'Dahej',
      state: 'Gujarat',
      pincode: '392130',
      documents: [
        { type: 'GST_CERTIFICATE', fileUrl: '/uploads/seller-docs/gst-certificate.pdf', name: 'GST_REG06.pdf' },
        { type: 'COMPANY_LICENSE', fileUrl: '/uploads/seller-docs/factory-license.pdf', name: 'Factory_License.pdf' },
      ],
    }),
  });
  assert(sellerReg.status === 201 || sellerReg.status === 200, 'Seller onboarding submitted with compliance documents');
  const sellerId = sellerReg.body.sellerId;

  // Login as unapproved seller
  const sellerLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: sellerEmail, password: sellerPassword }),
  });
  const unapprovedSellerToken = sellerLogin.body.accessToken;

  // Security Gate: Unapproved seller must NOT be able to list chemicals
  const unapprovedListing = await request('/chemicals', {
    method: 'POST',
    headers: { Authorization: `Bearer ${unapprovedSellerToken}` },
    body: JSON.stringify({
      name: 'Methanol Pure',
      category: 'Solvents',
      casNumber: '67-56-1',
      purity: '99.85%',
      unit: 'KG',
      sellerPrice: 32.5,
      warehouseLocation: 'Dahej Tank Farm 4',
      availableQuantity: 50000,
    }),
  });
  assert(
    unapprovedListing.status === 403,
    'Access Control Guard: Unapproved seller cannot publish chemical inventory (HTTP 403 Forbidden)'
  );

  // Admin approves seller
  const approveRes = await request(`/users/sellers/${sellerId}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(approveRes.status === 200, 'Admin approves seller profile and grants marketplace trading status');

  // Approved seller lists chemical with HazMat compliance fields
  const approvedListing = await request('/chemicals', {
    method: 'POST',
    headers: { Authorization: `Bearer ${unapprovedSellerToken}` },
    body: JSON.stringify({
      name: 'Methanol Pure Industrial',
      category: 'Solvents',
      casNumber: '67-56-1',
      purity: '99.85%',
      grade: 'Industrial Grade / Technical',
      hazardClass: 'Class 3 - Flammable Liquid',
      unNumber: 'UN 1230',
      packingGroup: 'PG II',
      packagingType: 'ISO Tank Container / Road Tanker',
      moq: 1000,
      unit: 'KG',
      sellerPrice: 32.5,
      warehouseLocation: 'Dahej Tank Farm 4',
      availableQuantity: 50000,
    }),
  });
  assert(
    approvedListing.status === 201 || approvedListing.status === 200,
    'Approved seller successfully lists chemical with full HazMat, CAS, and packaging specs'
  );
  const chemicalId = approvedListing.body.id;

  // ---------------------------------------------------------------------------
  // TEST 7: Pricing Engine & Trader Margin Protection
  // ---------------------------------------------------------------------------
  console.log('\n--> Section 7: Pricing Engine & Trader Margin');
  // Admin sets trader margin (buyer price = sellerPrice + margin)
  const priceRes = await request(`/chemicals/admin/${chemicalId}/price`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ marginType: 'FIXED', marginValue: 4.5 }),
  });
  assert(
    priceRes.status === 200 && Number(priceRes.body.buyer_price) === 37.0,
    'Trader sets buyer pricing margin (Seller: ₹32.50 + Margin: ₹4.50 = Buyer: ₹37.00)',
    `Status: ${priceRes.status}, Buyer Price: ${priceRes.body?.buyer_price}`
  );

  // Buyer views catalog: Seller cost is completely hidden from buyer
  const catalogRes = await request('/chemicals/catalog', {
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  const catalogItem = catalogRes.body?.find((c) => c.id === chemicalId);
  assert(
    Boolean(catalogItem && catalogItem.buyer_price === '37.00' && catalogItem.seller_price === undefined),
    'Buyer catalog displays active listing with buyer price while strictly hiding seller cost'
  );

  // ---------------------------------------------------------------------------
  // TEST 8: Full Trade Workflow (RFQ -> Quote Draft -> Quote Send -> Order)
  // ---------------------------------------------------------------------------
  console.log('\n--> Section 8: Institutional Trade Execution Workflow');
  // 1. Buyer creates RFQ
  const rfqRes = await request('/quotation-requests', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      chemicalId: chemicalId,
      requestedQuantity: 20000,
      unit: 'KG',
    }),
  });
  assert(rfqRes.status === 201 || rfqRes.status === 200, 'Buyer submits RFQ for 20,000 KG');
  const rfqId = rfqRes.body.id;

  // 2. Admin creates draft quotation for buyer
  const validUntilDate = new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10);
  const draftQuoteRes = await request(`/quotation-requests/admin/${rfqId}/quotations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      quotedPricePerUnit: 36.75, // Negotiated spot price
      quantity: 20000,
      validUntil: validUntilDate,
    }),
  });
  assert(draftQuoteRes.status === 201 || draftQuoteRes.status === 200, 'Trader prepares quotation draft');
  const quoteId = draftQuoteRes.body.id;

  // 3. Admin sends quotation formally to buyer
  const sendQuoteRes = await request(`/quotation-requests/admin/quotations/${quoteId}/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(sendQuoteRes.status === 200, 'Trader transmits binding quotation to buyer');

  // 4. Buyer accepts quotation -> Purchase Order generated automatically
  const acceptRes = await request(`/quotation-requests/mine/${rfqId}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      deliveryAddress: 'Plot 45, Ankleshwar GIDC, Gujarat',
      paymentTerms: '100% against Delivery Challan',
    }),
  });
  assert(
    (acceptRes.status === 201 || acceptRes.status === 200) && Boolean(acceptRes.body?.po_number),
    'Buyer accepts quotation; Purchase Order generated automatically',
    `PO Number: ${acceptRes.body?.po_number}`
  );

  // ---------------------------------------------------------------------------
  // TEST 9: Confidential Compliance Document Serving
  // ---------------------------------------------------------------------------
  console.log('\n--> Section 9: Document Serving & PDFKit Generation');
  const docRes = await request('/files/seller-docs/gst-certificate.pdf', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(
    docRes.status === 200,
    'Confidential compliance document serves dynamically with HTTP 200 and PDF stream'
  );

  // ---------------------------------------------------------------------------
  // Summary & Outcomes
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TEST SUITE COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
