import crypto from 'crypto';
import bcrypt from 'bcrypt';

const CODE_EXPIRY_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export const generateVerificationCode = () =>
  String(crypto.randomInt(100000, 999999));

export const hashVerificationCode = async (code) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(code, salt);
};

export const compareVerificationCode = async (code, codeHash) =>
  bcrypt.compare(code, codeHash);

export const getVerificationExpiry = () => new Date(Date.now() + CODE_EXPIRY_MS);

export { CODE_EXPIRY_MS, MAX_ATTEMPTS };
