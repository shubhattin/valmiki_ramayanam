// Key derivation function using SHA-256
async function generateKeyBuffer(key: string) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
  const cryptoKey = await crypto.subtle.importKey('raw', hashBuffer, { name: 'AES-CBC' }, false, [
    'encrypt',
    'decrypt'
  ]);
  return cryptoKey;
}

// Encryption function
export async function encrypt_text(text: string, key: string) {
  const keyBuffer = await generateKeyBuffer(key);
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const encryptedBuffer = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, keyBuffer, data);

  const ivBase64 = btoa(String.fromCharCode(...iv));
  const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
  return `${ivBase64}-${encryptedBase64}`;
}

// Decryption function
export async function decrypt_text(encrypted: string, key: string) {
  const [ivBase64, encryptedBase64] = encrypted.split('-');
  const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
  const encryptedData = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));

  const keyBuffer = await generateKeyBuffer(key);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    keyBuffer,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}
