/**
 * C-Tech Chemical Trading Platform — Real Indian SMS Gateway Diagnostic Tool
 * Usage:
 *   node backend/scripts/test-live-sms.js <phone_number>
 * Example:
 *   node backend/scripts/test-live-sms.js +919876543210
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.production') });
require('dotenv').config({ path: path.join(__dirname, '../.env.development') });

const { sendOtpSms, normalizePhone } = require('../src/common/sms');

async function testSms() {
  const targetPhone = process.argv[2] || process.env.TEST_RECIPIENT_PHONE;

  console.log('================================================================');
  console.log('C-TECH INDIAN SMS & TRAI DLT DIAGNOSTIC UTILITY');
  console.log('================================================================\n');

  if (!targetPhone) {
    console.error('[Error] No recipient phone number specified.');
    console.log('Usage: node backend/scripts/test-live-sms.js <10-digit mobile or +91...>');
    process.exit(1);
  }

  const norm = normalizePhone(targetPhone);
  console.log(`Target Phone:      ${targetPhone}`);
  console.log(`Normalized E.164:  ${norm.e164} (Valid: ${norm.valid})`);
  console.log(`National Format:   ${norm.national}\n`);

  console.log(`Configured Gateway Check:`);
  console.log(`  - MSG91 Auth Key:    ${process.env.MSG91_AUTH_KEY ? 'CONFIGURED' : 'NOT SET'}`);
  console.log(`  - MSG91 Flow ID:     ${process.env.MSG91_FLOW_ID ? process.env.MSG91_FLOW_ID : 'NOT SET'}`);
  console.log(`  - Twilio Account:    ${process.env.TWILIO_ACCOUNT_SID ? 'CONFIGURED' : 'NOT SET'}`);
  console.log(`  - Fast2SMS API Key:  ${process.env.FAST2SMS_API_KEY ? 'CONFIGURED' : 'NOT SET'}\n`);

  const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`--> Dispatching test transactional SMS OTP (${mockOtp}) to ${norm.e164}...`);

  const startTime = Date.now();
  try {
    const result = await sendOtpSms(norm.e164, mockOtp, 'LOGIN_2FA');
    const elapsed = Date.now() - startTime;

    console.log('\n================================================================');
    console.log('DISPATCH RESULT:');
    console.log('================================================================');
    console.log(`  Status:          ${result.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`  Provider Used:   ${result.provider.toUpperCase()}`);
    console.log(`  Message ID:      ${result.messageId}`);
    console.log(`  Elapsed Time:    ${elapsed}ms`);
    if (result.configured === false) {
      console.log(`  Live Delivery:   NO (Fell back to local audit logging)`);
      console.log(`  Action Needed:   Set MSG91_AUTH_KEY and MSG91_FLOW_ID in .env.production`);
    } else {
      console.log(`  Live Delivery:   YES (Dispatched to telecom gateway)`);
    }
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n[Fatal Error] SMS dispatch failed:', err.message);
    process.exit(1);
  }
}

testSms();
