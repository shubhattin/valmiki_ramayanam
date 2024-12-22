import { bcrypt, bcryptVerify } from 'hash-wasm';

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
