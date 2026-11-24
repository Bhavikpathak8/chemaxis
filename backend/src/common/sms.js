/**
 * C-Tech Trade Desk — SMS & Mobile OTP Service
 * Supports real Indian & International SMS gateways:
 * 1. MSG91 (DLT Flow compliant for Indian TRAI regulations)
 * 2. Twilio (Global E.164 standard SMS)
 * 3. Fast2SMS (Indian transactional routes)
 * 4. Audit Log Fallback (Development & non-credentialed environments)
 */

/**
 * Normalizes Indian and international phone numbers to standard formats.
 * @param {string} phone
 * @returns {{ valid: boolean, e164: string, national: string, formatted: string }}
 */
function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, e164: '', national: '', formatted: '' };
  }

  // Remove whitespace, dashes, parens
  const clean = phone.replace(/[\s\-\(\)\.]/g, '');

  // Check Indian mobile: starts with +91, 91, 0, or just 10 digits starting with 6-9
  let digits = clean;
  if (digits.startsWith('+91')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  const isIndianMobile = /^[6-9]\d{9}$/.test(digits);

  if (isIndianMobile) {
    return {
      valid: true,
      e164: `+91${digits}`,
      national: digits,
      formatted: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
    };
  }

  // Generic international fallback (E.164: + followed by 7 to 15 digits)
  const isInternational = /^\+?[1-9]\d{6,14}$/.test(clean);
  const normalizedE164 = clean.startsWith('+') ? clean : `+${clean}`;

  return {
    valid: isInternational,
    e164: isInternational ? normalizedE164 : clean,
    national: digits,
    formatted: clean,
  };
}

/**
 * Dispatch an SMS through configured real providers.
 */
async function sendSms({ to, message, otp = null, templateId = null }) {
  const norm = normalizePhone(to);
  const targetPhone = norm.valid ? norm.e164 : to;
  const timestamp = new Date().toISOString();

  // 1. Try MSG91 Flow (Primary for India TRAI/DLT compliance)
  if (process.env.MSG91_AUTH_KEY && (process.env.MSG91_FLOW_ID || templateId)) {
    try {
      const flowId = templateId || process.env.MSG91_FLOW_ID;
      const response = await fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          'authkey': process.env.MSG91_AUTH_KEY,
          'content-type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({
          template_id: flowId,
          short_url: '0',
          recipients: [
            {
              mobiles: norm.national || targetPhone.replace('+', ''),
              otp: otp || '',
              message: message,
            },
          ],
        }),
      });

      const resData = await response.json();
      if (response.ok && (resData.type === 'success' || resData.status === 'success')) {
        console.log(`[SMS Sent: MSG91] To: ${targetPhone} | Flow: ${flowId}`);
        return { success: true, provider: 'msg91', messageId: resData.message || resData.request_id, configured: true };
      }
      console.warn(`[MSG91 Response Warning] ${JSON.stringify(resData)}`);
    } catch (err) {
      console.warn(`[MSG91 Dispatch Error] Failed: ${err.message}`);
    }
  }

  // 2. Try Twilio REST API
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_FROM_NUMBER;

      const bodyParams = new URLSearchParams();
      bodyParams.append('To', targetPhone);
      bodyParams.append('From', fromNumber);
      bodyParams.append('Body', message);

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      const resData = await response.json();
      if (response.ok && resData.sid) {
        console.log(`[SMS Sent: Twilio] To: ${targetPhone} | SID: ${resData.sid}`);
        return { success: true, provider: 'twilio', messageId: resData.sid, configured: true };
      }
      console.warn(`[Twilio Response Warning] ${resData.message || JSON.stringify(resData)}`);
    } catch (err) {
      console.warn(`[Twilio Dispatch Error] Failed: ${err.message}`);
    }
  }

  // 3. Try Fast2SMS (Indian Gateway API)
  if (process.env.FAST2SMS_API_KEY && norm.valid) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp || message,
          numbers: norm.national,
        }),
      });

      const resData = await response.json();
      if (response.ok && resData.return === true) {
        console.log(`[SMS Sent: Fast2SMS] To: ${norm.national} | Request ID: ${resData.request_id}`);
        return { success: true, provider: 'fast2sms', messageId: resData.request_id, configured: true };
      }
      console.warn(`[Fast2SMS Response Warning] ${JSON.stringify(resData)}`);
    } catch (err) {
      console.warn(`[Fast2SMS Dispatch Error] Failed: ${err.message}`);
    }
  }

  // 4. Fallback Audit Log (Development / missing credentials)
  console.log(`
=============================================================
[TRANSACTIONAL SMS DISPATCH]
Time:     ${timestamp}
To:       ${targetPhone} (${norm.valid ? 'Valid format' : 'Unverified'})
Provider: Local Audit Fallback (Set MSG91_AUTH_KEY or TWILIO_ACCOUNT_SID for live SMS)
Message:  ${message}
=============================================================
  `);

  return {
    success: true,
    provider: 'audit-log',
    messageId: `local-${Date.now()}`,
    configured: false,
    note: 'Live SMS delivery requires MSG91_AUTH_KEY or TWILIO_ACCOUNT_SID environment variables.',
  };
}

/**
 * Send 6-Digit OTP via SMS with standard TRAI DLT template text.
 */
async function sendOtpSms(phone, otp, purpose = 'VERIFICATION') {
  const norm = normalizePhone(phone);
  const purposeText = purpose === 'RESET_PASSWORD'
    ? 'password reset'
    : purpose === 'LOGIN_2FA'
    ? 'account login'
    : 'mobile number verification';

  // Standard Indian DLT registered message template:
  // "Your ChemAxis verification code is {#var#}. Valid for 5 minutes. Do not share this OTP with anyone. - CHMAXIS"
  const message = `Your ChemAxis verification OTP is ${otp} for ${purposeText}. Valid for 5 minutes. Do not share with anyone. - CHMAXIS`;

  return sendSms({
    to: norm.valid ? norm.e164 : phone,
    message,
    otp,
    templateId: process.env.MSG91_OTP_TEMPLATE_ID || null,
  });
}

module.exports = {
  normalizePhone,
  sendSms,
  sendOtpSms,
};
