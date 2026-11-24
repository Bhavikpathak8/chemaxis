/**
 * C-Tech Trade Desk — Production Transactional Email Service
 * Supports multi-provider dispatch:
 * 1. Nodemailer SMTP (AWS SES, Postmark, Mailgun, Brevo, Gmail SMTP)
 * 2. Resend REST API (via fetch)
 * 3. SendGrid REST API (via fetch)
 * 4. Audit Log Fallback (Development & non-credentialed environments)
 */

const nodemailer = require('nodemailer');

let cachedTransporter = null;

function getSmtpTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === '465' || process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });
  }
  return cachedTransporter;
}

/**
 * Send an email through configured real providers.
 */
async function sendEmail({ to, subject, html, text }) {
  const timestamp = new Date().toISOString();
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_FROM || 'ChemAxis Desk <no-reply@chemaxis.trade>';

  // 1. Try Nodemailer SMTP
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html,
        text: text || subject,
      });

      console.log(`[Email Sent: SMTP] To: ${to} | ID: ${info.messageId} | Subject: ${subject}`);
      return { success: true, provider: 'smtp', messageId: info.messageId, configured: true };
    } catch (err) {
      console.warn(`[SMTP Warning] Failed to send via SMTP, trying next provider or audit:`, err.message);
    }
  }

  // 2. Try Resend REST API
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || fromEmail,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          text: text || subject,
        }),
      });

      const resData = await response.json();
      if (response.ok && resData.id) {
        console.log(`[Email Sent: Resend] To: ${to} | ID: ${resData.id}`);
        return { success: true, provider: 'resend', messageId: resData.id, configured: true };
      }
      console.warn(`[Resend Response Warning] ${JSON.stringify(resData)}`);
    } catch (err) {
      console.warn(`[Resend Dispatch Error] Failed: ${err.message}`);
    }
  }

  // 3. Try SendGrid REST API
  if (process.env.SENDGRID_API_KEY) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: process.env.SENDGRID_FROM || 'security@chemaxis.trade', name: 'ChemAxis Desk' },
          subject,
          content: [
            { type: 'text/html', value: html },
            { type: 'text/plain', value: text || subject },
          ],
        }),
      });

      if (response.ok || response.status === 202) {
        console.log(`[Email Sent: SendGrid] To: ${to} | Subject: ${subject}`);
        return { success: true, provider: 'sendgrid', messageId: `sg-${Date.now()}`, configured: true };
      }
      const errText = await response.text();
      console.warn(`[SendGrid Response Warning] ${errText}`);
    } catch (err) {
      console.warn(`[SendGrid Dispatch Error] Failed: ${err.message}`);
    }
  }

  // 4. Fallback Audit Log (Development / non-credentialed environment)
  console.log(`
=============================================================
[TRANSACTIONAL EMAIL NOTIFICATION]
Time:     ${timestamp}
To:       ${to}
Subject:  ${subject}
Provider: Local Audit Fallback (Set SMTP_HOST, RESEND_API_KEY or SENDGRID_API_KEY for live delivery)
-------------------------------------------------------------
${text || html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
=============================================================
  `);

  return {
    success: true,
    provider: 'audit-log',
    messageId: `local-${Date.now()}`,
    configured: false,
    note: 'Live email delivery requires SMTP_HOST, RESEND_API_KEY or SENDGRID_API_KEY environment variables.',
  };
}

/**
 * 1. 6-Digit Verification Code Email
 */
async function sendOtpEmail(email, otp, purpose = 'VERIFICATION') {
  const titles = {
    EMAIL_VERIFY: 'Verify your business email address',
    PHONE_VERIFY: 'Verify your mobile contact number',
    RESET_PASSWORD: 'Password reset security verification code',
    LOGIN_2FA: 'Two-Factor Authentication login code',
  };

  const title = titles[purpose] || 'Security verification code';

  return sendEmail({
    to: email,
    subject: `ChemAxis Security Code: ${otp} — ${title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"/><title>${title}</title></head>
      <body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 24px 32px; background: linear-gradient(135deg, #0b7a55 0%, #064e3b 100%);">
              <table width="100%">
                <tr>
                  <td>
                    <span style="display: inline-block; font-size: 20px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px;">ChemAxis</span>
                    <span style="display: block; font-size: 11px; text-transform: uppercase; color: #a7f3d0; letter-spacing: 1.5px; margin-top: 2px;">Institutional Chemical Trade Desk</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">${title}</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                Use the following 6-digit one-time verification code to proceed. This security code is confidential and will expire in <strong>5 minutes</strong>.
              </p>
              
              <div style="background: #f0fdf4; border: 2px dashed #10b981; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-family: 'JetBrains Mono', Consolas, Monaco, monospace; font-size: 34px; font-weight: 700; letter-spacing: 10px; color: #0b7a55;">${otp}</span>
              </div>

              <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 24px 0; border-radius: 4px;">
                <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.4;">
                  <strong>Security Advisory:</strong> ChemAxis trade desk staff will never ask for your verification code or password over email, phone, or messaging apps.
                </p>
              </div>

              <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin-top: 28px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                If you did not request this verification code, please ignore this email or contact <a href="mailto:security@chemaxis.trade" style="color: #0b7a55; text-decoration: none;">security@chemaxis.trade</a> immediately.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} ChemAxis Trade Desk. Institutional Petrochemical & Specialty Chemicals Trading.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Your ChemAxis verification code is: ${otp}. It expires in 5 minutes. Do not share this code.`,
  });
}

/**
 * 2. Welcome & Account Activated Email
 */
async function sendWelcomeEmail(email, { fullName, role, companyName }) {
  const roleTitle = role === 'SELLER' ? 'Verified Chemical Supplier' : 'Procurement Buyer';
  return sendEmail({
    to: email,
    subject: `Welcome to ChemAxis — Your ${roleTitle} Workspace is Active`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8e5; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #0b7a55; margin: 0 0 16px 0;">Welcome to ChemAxis, ${fullName || 'Partner'}!</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Your institutional account for <strong>${companyName || 'your organization'}</strong> (${roleTitle}) has been successfully created.
        </p>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">
          ${
            role === 'SELLER'
              ? 'Our compliance desk reviews business registration and GST documents for all suppliers before granting marketplace trading permissions. You can track your verification status directly in your portal.'
              : 'You can now explore live chemical spot quotes, search verified manufacturers by CAS number, and submit Request for Quotations (RFQs).'
          }
        </p>
        <div style="margin: 24px 0;">
          <a href="${process.env.APP_BASE_URL || 'http://localhost:5174'}/app" style="background-color: #0b7a55; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            Open ChemAxis Desk
          </a>
        </div>
      </div>
    `,
    text: `Welcome to ChemAxis! Your account for ${companyName || 'your organization'} is active. Log in to access the desk.`,
  });
}

/**
 * 3. Seller Verification Status Updates
 */
async function sendSellerStatusEmail(email, companyName, status, reason = null) {
  const isApproved = status === 'APPROVED' || status === 'VERIFIED';
  const subject = isApproved
    ? `Congratulations! ${companyName} has been verified on ChemAxis`
    : `Update regarding your seller application for ${companyName}`;

  return sendEmail({
    to: email,
    subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8e5; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #0b7a55; margin: 0;">ChemAxis Compliance Desk</h2>
        <h3 style="color: #0f172a; margin-top: 16px;">Application Status: ${isApproved ? 'Approved & Verified' : 'Action Required / Rejected'}</h3>
        <p style="color: #4a5666; font-size: 15px; line-height: 1.6;">
          ${
            isApproved
              ? `Your corporate verification for <strong>${companyName}</strong> has been approved. Your seller workspace is now active with the <strong>Verified Chemical Supplier</strong> badge. You can now publish physical inventory, attach specification documents, and respond to institutional RFQs.`
              : `Your seller verification application for <strong>${companyName}</strong> was not approved at this time.`
          }
        </p>
        ${
          reason
            ? `<div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 16px 0; color: #991b1b; font-size: 14px;"><strong>Reason from Compliance Team:</strong><br/>${reason}</div>
               <p style="color: #4a5666; font-size: 14px;">You can log in to your dashboard to correct your business details or re-upload required certificates.</p>`
            : ''
        }
      </div>
    `,
    text: `Update for ${companyName}: Status is ${status}. ${reason ? 'Reason: ' + reason : ''}`,
  });
}

/**
 * 4. Security Event Alert
 */
async function sendSecurityAlertEmail(email, eventType, metadata = {}) {
  const subjectMap = {
    PASSWORD_CHANGED: 'Your ChemAxis password was recently changed',
    ACCOUNT_SUSPENDED: 'Security Notice: Account status updated',
    TWO_FACTOR_ENABLED: 'Two-Factor Authentication (2FA) enabled on your account',
    NEW_DEVICE_LOGIN: 'New login detected on your ChemAxis account',
  };

  return sendEmail({
    to: email,
    subject: subjectMap[eventType] || 'Security notification for your ChemAxis account',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8e5; border-radius: 12px; background: #ffffff;">
        <h3 style="color: #0f172a; margin: 0 0 12px 0;">Security Alert: ${subjectMap[eventType] || eventType}</h3>
        <p style="color: #4a5666; font-size: 14px; line-height: 1.5;">This email is to notify you of an important security event on your ChemAxis account.</p>
        <ul style="color: #64748b; font-size: 13px; line-height: 1.6;">
          <li>Timestamp: ${new Date().toUTCString()}</li>
          ${metadata.ip ? `<li>IP Address: ${metadata.ip}</li>` : ''}
          ${metadata.device ? `<li>Device/Agent: ${metadata.device}</li>` : ''}
        </ul>
        <p style="color: #64748b; font-size: 13px; margin-top: 20px;">If you did not authorize this action, please contact <a href="mailto:security@chemaxis.trade" style="color: #0b7a55;">security@chemaxis.trade</a> immediately.</p>
      </div>
    `,
    text: `Security Alert: ${subjectMap[eventType] || eventType} on your ChemAxis account at ${new Date().toISOString()}`,
  });
}

/**
 * 5. Order Notification Email
 */
async function sendOrderNotificationEmail(email, { orderId, orderNumber, type, amount, status, counterpartyName }) {
  return sendEmail({
    to: email,
    subject: `Order Update: ${orderNumber || orderId} — ${status}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8e5; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #0b7a55; margin: 0 0 12px 0;">ChemAxis Trade Execution</h2>
        <h3 style="color: #0f172a; margin: 0 0 16px 0;">Order #${orderNumber || orderId} Update</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">Status: <strong>${status}</strong></p>
        ${counterpartyName ? `<p style="color: #475569; font-size: 14px;">Counterparty: <strong>${counterpartyName}</strong></p>` : ''}
        ${amount ? `<p style="color: #475569; font-size: 14px;">Total Value: <strong>₹${Number(amount).toLocaleString('en-IN')}</strong></p>` : ''}
        <p style="color: #64748b; font-size: 13px; margin-top: 20px;">View order documents, dispatch notes, and invoices in your trade desk.</p>
      </div>
    `,
    text: `Order ${orderNumber || orderId} status updated to ${status}. Total: ₹${amount || 0}`,
  });
}

/**
 * 6. Password Reset Success Email
 */
async function sendPasswordResetSuccessEmail(email) {
  return sendSecurityAlertEmail(email, 'PASSWORD_CHANGED', {});
}

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendWelcomeEmail,
  sendSellerStatusEmail,
  sendSecurityAlertEmail,
  sendOrderNotificationEmail,
  sendPasswordResetSuccessEmail,
};
