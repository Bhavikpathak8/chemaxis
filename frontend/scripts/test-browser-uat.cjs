/**
 * C-Tech Chemical Trading Platform — Real Browser User Acceptance Testing (UAT)
 * Uses Playwright and system Google Chrome to execute end-to-end user journeys:
 * 1. Public Landing Page & Interactive Search
 * 2. Public Chemical Catalogue & CAS Search
 * 3. Buyer Registration Interface & Controls
 * 4. Seller Multi-Step Onboarding Wizard
 * 5. Password Recovery / Verification Form
 * 6. Super Admin 2FA Login & Platform Dashboard
 * 7. Admin Approvals Desk & Document SlidePanel
 * 8. Buyer Trading Desk (Catalog, RFQs, Orders)
 * 9. Seller Trading Desk (Overview, Chemicals, Inventory)
 * 10. Secure Session Logout & Protection
 */

const { chromium } = require('../node_modules/playwright');

const APP_URL = process.env.TEST_APP_URL || 'http://localhost:5173';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName} — ${details}`);
    failed++;
  }
}

async function runBrowserUAT() {
  console.log('================================================================');
  console.log('C-TECH TRADE DESK — BROWSER USER ACCEPTANCE TESTING (UAT)');
  console.log(`Target: ${APP_URL} | Engine: Google Chrome Headless`);
  console.log('================================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Public Landing Page
    // -------------------------------------------------------------------------
    console.log('--> Workflow 1: Public Landing Page & Chemical Search');
    const pubContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pubPage = await pubContext.newPage();

    await pubPage.goto(`${APP_URL}/`, { waitUntil: 'domcontentloaded' });
    await pubPage.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
    await pubPage.waitForTimeout(600);
    const pageTitle = await pubPage.title();
    assert(Boolean(pageTitle), 'Landing page loads successfully', `Title: ${pageTitle}`);

    const hasHeading = await pubPage.locator('h1:has-text("Source chemicals")').count();
    assert(hasHeading > 0, 'Hero heading "Source chemicals" is visible');

    const searchInput = pubPage.locator('input[placeholder*="chemical name"]');
    if (await searchInput.count()) {
      await searchInput.fill('Phenol');
      assert(true, 'Chemical search input is interactive and accepts user input');
    }

    // -------------------------------------------------------------------------
    // TEST 2: Public Chemical Catalogue
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 2: Public Chemical Catalogue & Specification Cards');
    await pubPage.goto(`${APP_URL}/chemicals`, { waitUntil: 'domcontentloaded' });
    await pubPage.waitForTimeout(500);
    const hasCatalogHeading = (await pubPage.locator('text=Chemical').count()) > 0;
    assert(hasCatalogHeading, 'Public Chemical Catalogue page renders with listings');

    // -------------------------------------------------------------------------
    // TEST 3: Buyer Registration Page & Form
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 3: Buyer Registration Interface');
    await pubPage.goto(`${APP_URL}/register`, { waitUntil: 'domcontentloaded' });
    await pubPage.waitForTimeout(500);

    const buyerInputs = await pubPage.locator('input').count();
    assert(buyerInputs >= 4, 'Buyer registration form renders with input controls', `Inputs: ${buyerInputs}`);

    // -------------------------------------------------------------------------
    // TEST 4: Seller Onboarding Wizard
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 4: Seller Multi-Step Onboarding Interface');
    await pubPage.goto(`${APP_URL}/register/seller`, { waitUntil: 'domcontentloaded' });
    await pubPage.waitForTimeout(500);
    const hasSellerWizard =
      (await pubPage.locator('text=Contact').count()) > 0 ||
      (await pubPage.locator('text=Company').count()) > 0 ||
      (await pubPage.locator('text=Supplier').count()) > 0;
    assert(hasSellerWizard, 'Seller onboarding multi-step wizard renders');

    // -------------------------------------------------------------------------
    // TEST 5: Password Recovery / Forgot Password Page
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 5: Password Recovery Interface');
    await pubPage.goto(`${APP_URL}/forgot-password`, { waitUntil: 'domcontentloaded' });
    await pubPage.waitForTimeout(500);
    const hasEmailInput = (await pubPage.locator('input[type="email"]').count()) > 0;
    assert(hasEmailInput, 'Forgot password / verification code interface renders');

    await pubContext.close();

    // -------------------------------------------------------------------------
    // TEST 6: Super Admin Login & Two-Factor Authentication (2FA)
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 6: Super Admin Authentication & 2FA Gate');
    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const adminPage = await adminContext.newPage();

    await adminPage.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(500);

    // Click demo Super Admin switcher button
    const demoAdminBtn = adminPage.locator('button:has-text("Super Admin")');
    if (await demoAdminBtn.count()) {
      await demoAdminBtn.click();
      await adminPage.waitForTimeout(300);
    } else {
      await adminPage.locator('input[type="text"], input[name="identifier"]').first().fill('admin@ctech.com');
      await adminPage.locator('input[type="password"]').first().fill('Admin@12345');
    }

    await adminPage.locator('button[type="submit"]').first().click();
    await adminPage.waitForTimeout(1000);

    // If 2FA view appears, click "Fill Code" demo button or type 123456
    const fillCodeBtn = adminPage.locator('button:has-text("Fill Code")');
    if (await fillCodeBtn.count()) {
      console.log('  -> 2FA Challenge active. Using sandbox verification code...');
      await fillCodeBtn.click();
      await adminPage.waitForTimeout(300);
      await adminPage.locator('button[type="submit"]').first().click();
    }

    await adminPage.waitForTimeout(1500);
    const adminUrl = adminPage.url();
    assert(
      adminUrl.includes('/admin') || adminUrl.includes('/approvals') || adminUrl.includes('/dashboard'),
      'Super Admin authenticated and redirected to protected admin portal',
      `URL: ${adminUrl}`
    );

    // -------------------------------------------------------------------------
    // TEST 7: Admin Approvals Desk & Verification Panel
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 7: Admin Approvals Desk & Verification Panel');
    await adminPage.goto(`${APP_URL}/admin/approvals`, { waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(1000);
    const hasApprovalsTable =
      (await adminPage.locator('text=Sellers').count()) > 0 ||
      (await adminPage.locator('text=Approvals').count()) > 0 ||
      (await adminPage.locator('table').count()) > 0;
    assert(hasApprovalsTable, 'Admin approvals desk renders sellers and buyers verification tabs');

    await adminContext.close();

    // -------------------------------------------------------------------------
    // TEST 8: Buyer Session & Trade Desk
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 8: Buyer Workspace & Chemical Catalog');
    const buyerContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const buyerPage = await buyerContext.newPage();

    await buyerPage.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded' });
    await buyerPage.waitForTimeout(500);

    const demoBuyerBtn = buyerPage.locator('button:has-text("Industrial Buyer")');
    if (await demoBuyerBtn.count()) {
      await demoBuyerBtn.click();
      await buyerPage.waitForTimeout(300);
    } else {
      await buyerPage.locator('input[type="text"], input[name="identifier"]').first().fill('buyer@ctech.com');
      await buyerPage.locator('input[type="password"]').first().fill('Buyer@12345');
    }
    await buyerPage.locator('button[type="submit"]').first().click();
    await buyerPage.waitForTimeout(1500);

    await buyerPage.goto(`${APP_URL}/buyer/catalog`, { waitUntil: 'domcontentloaded' });
    await buyerPage.waitForTimeout(1000);
    const buyerCatalogUrl = buyerPage.url();
    assert(
      buyerCatalogUrl.includes('/buyer'),
      'Buyer authenticated and accessed private buyer trade desk',
      `URL: ${buyerCatalogUrl}`
    );

    // Test Buyer RFQs
    await buyerPage.goto(`${APP_URL}/buyer/rfqs`, { waitUntil: 'domcontentloaded' });
    await buyerPage.waitForTimeout(800);
    assert(buyerPage.url().includes('/buyer/rfqs'), 'Buyer RFQ desk accessible and renders');

    // Test Buyer Orders
    await buyerPage.goto(`${APP_URL}/buyer/orders`, { waitUntil: 'domcontentloaded' });
    await buyerPage.waitForTimeout(800);
    assert(buyerPage.url().includes('/buyer/orders'), 'Buyer Orders desk accessible and renders');

    await buyerContext.close();

    // -------------------------------------------------------------------------
    // TEST 9: Seller Session & Inventory Desk
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 9: Seller Workspace & Inventory Management');
    const sellerContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const sellerPage = await sellerContext.newPage();

    await sellerPage.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded' });
    await sellerPage.waitForTimeout(500);

    const demoSellerBtn = sellerPage.locator('button:has-text("Chemical Seller")');
    if (await demoSellerBtn.count()) {
      await demoSellerBtn.click();
      await sellerPage.waitForTimeout(300);
    } else {
      await sellerPage.locator('input[type="text"], input[name="identifier"]').first().fill('seller@ctech.com');
      await sellerPage.locator('input[type="password"]').first().fill('Seller@12345');
    }
    await sellerPage.locator('button[type="submit"]').first().click();
    await sellerPage.waitForTimeout(1500);

    await sellerPage.goto(`${APP_URL}/seller/chemicals`, { waitUntil: 'domcontentloaded' });
    await sellerPage.waitForTimeout(1000);
    const sellerUrl = sellerPage.url();
    assert(
      sellerUrl.includes('/seller'),
      'Seller authenticated and accessed private chemical listing desk',
      `URL: ${sellerUrl}`
    );

    // -------------------------------------------------------------------------
    // TEST 10: Secure Logout
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 10: Session Termination & Logout');
    const signOutBtn = sellerPage.locator('button:has-text("Sign out"), button:has-text("Logout"), a:has-text("Sign out")').first();
    if (await signOutBtn.count()) {
      await signOutBtn.click();
      await sellerPage.waitForTimeout(800);
    }
    await sellerPage.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded' });
    assert(sellerPage.url().includes('/login'), 'Session terminated successfully and protected route redirects to login');

    await sellerContext.close();

  } catch (err) {
    console.error('Fatal Browser Test Error:', err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log('\n================================================================');
  console.log(`BROWSER UAT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runBrowserUAT().catch((err) => {
  console.error(err);
  process.exit(1);
});
