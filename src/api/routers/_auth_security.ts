import { send_email } from '~/tools/email';
import { bcrypt, bcryptVerify } from 'hash-wasm';
import { env } from '$env/dynamic/private';

export const BCRYPT_COST_FACTOR = 12;

export const bcrypt_hash = async (text: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return await bcrypt({
    password: text,
    salt: salt,
    costFactor: BCRYPT_COST_FACTOR
  });
};

export const bcrypt_verify = async (text: string, hash: string) => {
  return await bcryptVerify({
    password: text,
    hash: hash
  });
};

export const send_email_verify_otp = async (email: string, otp: string) => {
  return send_email({
    senders_name: env.EMAIL_SENDER_NAME,
    recipient_emails: [email],
    subject: 'OTP for Email Verification',
    html: `Please verify your Account for Valmiki Ramayanam Project. Your OTP is <b>${otp}</b>.<br/><br/><b>Praṇāma</b>`
  });
};
