/**
 * C-Tech Chemical Trading Platform — Real Transactional Email Diagnostic Tool
 * Usage:
 *   node backend/scripts/test-live-email.js <recipient_email>
 * Example:
 *   node backend/scripts/test-live-email.js user@company.com
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.production') });
require('dotenv').config({ path: path.join(__dirname, '../.env.development') });

const { sendOtpEmail } = require('../src/common/email');

async function testEmail() {
  const targetEmail = process.argv[2] || process.env.TEST_RECIPIENT_EMAIL;

  console.log('================================================================');
  console.log('C-TECH TRANSACTIONAL EMAIL DIAGNOSTIC & VERIFICATION UTILITY');
  console.log('================================================================\n');

  if (!targetEmail) {
    console.error('[Error] No recipient email specified.');
    console.log('Usage: node backend/scripts/test-live-email.js <your_email@domain.com>');
    process.exit(1);
  }

  console.log(`Target Recipient:  ${targetEmail}`);
  console.log(`Configured Provider Check:`);
  console.log(`  - Resend API:    ${process.env.RESEND_API_KEY ? 'CONFIGURED (' + process.env.RESEND_API_KEY.slice(0, 7) + '...)' : 'NOT SET'}`);
  console.log(`  - SendGrid API:  ${process.env.SENDGRID_API_KEY ? 'CONFIGURED (' + process.env.SENDGRID_API_KEY.slice(0, 7) + '...)' : 'NOT SET'}`);
  console.log(`  - SMTP Relay:    ${process.env.SMTP_HOST ? process.env.SMTP_HOST + ':' + (process.env.SMTP_PORT || 587) : 'NOT SET'}`);
  console.log(`  - From Address:  ${process.env.EMAIL_FROM || process.env.SMTP_FROM || 'C-Tech Desk <no-reply@ctech.trade>'}\n`);

  const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`--> Dispatching test 6-digit OTP (${mockOtp}) to ${targetEmail}...`);

  const startTime = Date.now();
  try {
    const result = await sendOtpEmail(targetEmail, mockOtp, 'VERIFICATION');
    const elapsed = Date.now() - startTime;

    console.log('\n================================================================');
    console.log('DISPATCH RESULT:');
    console.log('================================================================');
    console.log(`  Status:          ${result.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`  Provider Used:   ${result.provider.toUpperCase()}`);
    console.log(`  Message ID:      ${result.messageId}`);
    console.log(`  Delivery Time:   ${elapsed}ms`);
    if (result.configured === false) {
      console.log(`  Live Delivery:   NO (Fell back to local audit logging)`);
      console.log(`  Action Needed:   Set RESEND_API_KEY or SMTP_HOST in .env.production`);
    } else {
      console.log(`  Live Delivery:   YES (Transmitted to external email MTA)`);
    }
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n[Fatal Error] Email dispatch failed:', err.message);
    process.exit(1);
  }
}

testEmail();
