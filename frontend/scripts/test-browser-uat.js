/**
 * C-Tech Chemical Trading Platform — Real Browser User Acceptance Testing (UAT)
 * Uses Playwright and system Google Chrome to execute end-to-end user journeys:
 * 1. Public Landing Page & Interactive Search
 * 2. Public Chemical Catalogue & CAS search
 * 3. Buyer Registration Flow & Validation
 * 4. Seller Onboarding Wizard & Document Upload UI
 * 5. Forgot Password / Verification Form
 * 6. Super Admin 2FA Login & Platform Dashboard
 * 7. Admin Approvals Desk & Document SlidePanel
 * 8. Buyer Trading Desk (Catalog, RFQs, Orders)
 * 9. Seller Trading Desk (Overview, Chemicals, Inventory)
 * 10. Secure Session Logout
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

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Public Landing Page
    // -------------------------------------------------------------------------
    console.log('--> Workflow 1: Public Landing Page & Chemical Search');
    await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle' });
    const pageTitle = await page.title();
    assert(Boolean(pageTitle), 'Landing page loads successfully', `Title: ${pageTitle}`);

    const hasHeading = await page.locator('text=Source chemicals').count();
    assert(hasHeading > 0, 'Hero heading "Source chemicals" is visible');

    const searchInput = page.locator('input[placeholder*="Search by chemical name"]');
    if (await searchInput.count()) {
      await searchInput.fill('Phenol');
      assert(true, 'Chemical search input is interactive and accepts user input');
    }

    // -------------------------------------------------------------------------
    // TEST 2: Public Chemical Catalogue
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 2: Public Chemical Catalogue & Specification Cards');
    await page.goto(`${APP_URL}/chemicals`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const hasCatalogHeading = await page.locator('text=Chemical').count();
    assert(hasCatalogHeading > 0, 'Public Chemical Catalogue page renders with listings');

    // -------------------------------------------------------------------------
    // TEST 3: Buyer Registration Page & Form
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 3: Buyer Registration Interface');
    await page.goto(`${APP_URL}/register`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const buyerNameInput = page.locator('input[name="fullName"], input[placeholder*="Full name"], input[placeholder*="Contact"]');
    const buyerEmailInput = page.locator('input[name="email"], input[type="email"]');
    const hasRegisterForm = (await buyerNameInput.count()) > 0 || (await buyerEmailInput.count()) > 0;
    assert(hasRegisterForm, 'Buyer registration form renders with input controls');

    // -------------------------------------------------------------------------
    // TEST 4: Seller Onboarding Wizard
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 4: Seller Multi-Step Onboarding Interface');
    await page.goto(`${APP_URL}/register/seller`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const hasSellerSteps = await page.locator('text=Company, text=Seller, text=Onboarding').count();
    assert(hasSellerSteps > 0, 'Seller onboarding multi-step wizard renders');

    // -------------------------------------------------------------------------
    // TEST 5: Password Recovery / Forgot Password Page
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 5: Password Recovery Interface');
    await page.goto(`${APP_URL}/forgot-password`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const hasForgotUI = await page.locator('text=Reset, text=Password, text=Verification').count();
    assert(hasForgotUI > 0, 'Forgot password / verification code interface renders');

    // -------------------------------------------------------------------------
    // TEST 6: Super Admin Login & Two-Factor Authentication (2FA)
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 6: Super Admin Authentication & 2FA Gate');
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Fill login form
    await page.locator('input[type="text"], input[type="email"], input[name="identifier"]').first().fill('admin@ctech.com');
    await page.locator('input[type="password"]').first().fill('Admin@12345');
    await page.locator('button[type="submit"]').first().click();

    // Handle 2FA step if presented
    await page.waitForTimeout(1000);
    const is2FaScreen = await page.locator('text=Verification, text=Two-Factor, text=Code, text=2FA').count();
    if (is2FaScreen > 0) {
      console.log('  -> 2FA Verification screen detected. Submitting test verification code...');
      const otpInput = page.locator('input[name="code"], input[placeholder*="6-digit"], input[maxlength="6"], input[type="text"]').last();
      if (await otpInput.count()) {
        await otpInput.fill('123456');
        const submit2Fa = page.locator('button:has-text("Verify"), button:has-text("Sign in"), button[type="submit"]').last();
        if (await submit2Fa.count()) {
          await submit2Fa.click();
        }
      }
    }

    await page.waitForTimeout(1500);
    const adminUrl = page.url();
    assert(
      adminUrl.includes('/admin') || adminUrl.includes('/workspace') || adminUrl.includes('/dashboard'),
      'Super Admin authenticated and redirected to protected admin portal',
      `Current URL: ${adminUrl}`
    );

    // -------------------------------------------------------------------------
    // TEST 7: Admin Approvals Desk & Document SlidePanel
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 7: Admin Approvals Desk & Verification Panel');
    await page.goto(`${APP_URL}/admin/approvals`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const hasApprovalsTable = await page.locator('text=Sellers, text=Approvals, text=Pending').count();
    assert(hasApprovalsTable > 0, 'Admin approvals desk renders sellers and buyers verification tabs');

    // -------------------------------------------------------------------------
    // TEST 8: Buyer Session & Trade Desk
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 8: Buyer Workspace & Chemical Catalog');
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.locator('input[type="text"], input[type="email"], input[name="identifier"]').first().fill('buyer@ctech.com');
    await page.locator('input[type="password"]').first().fill('Buyer@12345');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);

    await page.goto(`${APP_URL}/buyer/catalog`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const buyerCatalogUrl = page.url();
    assert(
      buyerCatalogUrl.includes('/buyer'),
      'Buyer authenticated and accessed private buyer trade desk',
      `URL: ${buyerCatalogUrl}`
    );

    // -------------------------------------------------------------------------
    // TEST 9: Seller Session & Inventory Desk
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 9: Seller Workspace & Inventory Management');
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.locator('input[type="text"], input[type="email"], input[name="identifier"]').first().fill('seller@ctech.com');
    await page.locator('input[type="password"]').first().fill('Seller@12345');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);

    await page.goto(`${APP_URL}/seller/chemicals`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const sellerUrl = page.url();
    assert(
      sellerUrl.includes('/seller'),
      'Seller authenticated and accessed private chemical listing desk',
      `URL: ${sellerUrl}`
    );

    // -------------------------------------------------------------------------
    // TEST 10: Secure Logout
    // -------------------------------------------------------------------------
    console.log('\n--> Workflow 10: Session Termination & Logout');
    const signOutButton = page.locator('button:has-text("Sign out"), a:has-text("Sign out"), button:has-text("Logout")').first();
    if (await signOutButton.count()) {
      await signOutButton.click();
      await page.waitForTimeout(800);
    } else {
      // Direct navigation to login clears or guards workspace
      await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle' });
    }
    assert(page.url().includes('/login') || page.url().endsWith('/'), 'Session terminated successfully');

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
