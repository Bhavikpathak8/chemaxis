const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(base32Str) {
  const cleanStr = base32Str.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (let i = 0; i < cleanStr.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleanStr[i]);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function generateSecret(byteLength = 20) {
  return base32Encode(crypto.randomBytes(byteLength));
}

function getHotpToken(secretBuffer, counter) {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac('sha1', secretBuffer).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(code % 1000000).padStart(6, '0');
}

function generateTotp(secretBase32, timeOffsetSeconds = 0) {
  const secretBuffer = base32Decode(secretBase32);
  const epochSeconds = Math.floor(Date.now() / 1000) + timeOffsetSeconds;
  const counter = Math.floor(epochSeconds / 30);
  return getHotpToken(secretBuffer, counter);
}

function verifyTotp(token, secretBase32, window = 1) {
  if (!token || !secretBase32) return false;
  const cleanToken = String(token).trim();
  if (cleanToken.length !== 6) return false;

  const secretBuffer = base32Decode(secretBase32);
  const currentCounter = Math.floor(Date.now() / 1000 / 30);

  for (let i = -window; i <= window; i++) {
    const expected = getHotpToken(secretBuffer, currentCounter + i);
    if (crypto.timingSafeEqual(Buffer.from(cleanToken), Buffer.from(expected))) {
      return true;
    }
  }
  return false;
}

function generateTotpUri(email, issuer = 'C-Tech Trade Desk', secretBase32) {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secretBase32}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

async function generateBackupCodes(count = 8) {
  const plainCodes = [];
  const hashedCodes = [];

  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 hex chars: e.g. 4F2A8E1B
    const formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`;
    plainCodes.push(formatted);
    const hash = await bcrypt.hash(formatted, 10);
    hashedCodes.push({ hash, used: false, createdAt: new Date().toISOString() });
  }

  return { plainCodes, hashedCodes };
}

async function verifyAndConsumeBackupCode(inputCode, hashedCodes = []) {
  if (!inputCode || !Array.isArray(hashedCodes)) return { valid: false, updatedCodes: hashedCodes };
  const cleanInput = String(inputCode).trim().toUpperCase();

  for (let i = 0; i < hashedCodes.length; i++) {
    const item = hashedCodes[i];
    if (item.used) continue;

    const match = await bcrypt.compare(cleanInput, item.hash);
    if (match) {
      const updated = [...hashedCodes];
      updated[i] = { ...item, used: true, usedAt: new Date().toISOString() };
      return { valid: true, updatedCodes: updated };
    }
  }

  return { valid: false, updatedCodes: hashedCodes };
}

module.exports = {
  generateSecret,
  generateTotp,
  verifyTotp,
  generateTotpUri,
  generateBackupCodes,
  verifyAndConsumeBackupCode,
};
