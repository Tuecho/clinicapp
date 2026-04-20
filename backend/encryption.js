import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_FILE = path.join(__dirname, '.encryption_key');
const ENCRYPTION_ENABLED_VAR = 'ENCRYPTION_ENABLED';

let encryptionKey = null;
let encryptionEnabled = true;

function getEnvKey() {
  return process.env.ENCRYPTION_KEY;
}

function isEncryptionEnabled() {
  const envValue = process.env[ENCRYPTION_ENABLED_VAR];
  return envValue === undefined || envValue === '1' || envValue === 'true';
}

function generateKey() {
  return crypto.randomBytes(32).toString('hex');
}

function loadOrGenerateKey() {
  if (!isEncryptionEnabled()) {
    encryptionEnabled = false;
    console.log('🔓 Encriptación desactivada por configuración');
    return null;
  }

  const envKey = getEnvKey();
  if (envKey && envKey.length >= 64) {
    encryptionKey = envKey;
    console.log('🔐 Encriptación activada (clave de entorno)');
    return encryptionKey;
  }

  if (fs.existsSync(KEY_FILE)) {
    encryptionKey = fs.readFileSync(KEY_FILE, 'utf8').trim();
    if (encryptionKey.length >= 64) {
      console.log('🔐 Encriptación activada (clave persistida)');
      return encryptionKey;
    }
  }

  encryptionKey = generateKey();
  fs.writeFileSync(KEY_FILE, encryptionKey, { mode: 0o600 });
  console.log('🔐 Encriptación activada (clave generada)');
  return encryptionKey;
}

function encrypt(plaintext) {
  if (!encryptionEnabled || !encryptionKey || !plaintext) {
    return plaintext;
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = Buffer.from(encryptionKey, 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Error en encrypt:', error.message);
    return plaintext;
  }
}

function decrypt(ciphertext) {
  if (!encryptionEnabled || !encryptionKey || !ciphertext) {
    return ciphertext;
  }

  if (!ciphertext.includes(':')) {
    return ciphertext;
  }

  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      return ciphertext;
    }

    const ivHex = parts[0];
    const authTagHex = parts[1];
    const encryptedHex = parts[2];

    if (ivHex.length !== IV_LENGTH * 2 || authTagHex.length !== AUTH_TAG_LENGTH * 2) {
      return ciphertext;
    }

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = Buffer.from(encryptionKey, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Error en decrypt:', error.message);
    return ciphertext;
  }
}

function encryptFields(obj, fields) {
  if (!obj || !fields || !encryptionEnabled) return obj;

  const result = { ...obj };
  for (const field of fields) {
    if (result[field]) {
      result[field] = encrypt(String(result[field]));
    }
  }
  return result;
}

function decryptFields(obj, fields) {
  if (!obj || !fields || !encryptionEnabled) return obj;

  const result = { ...obj };
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = decrypt(result[field]);
    }
  }
  return result;
}

function encryptFieldsRecursive(records, fields) {
  if (!records || !Array.isArray(records)) return records;
  return records.map(record => decryptFields(record, fields));
}

function generateIntegrityHash(consentData) {
  const data = [
    consentData.client_id || '',
    consentData.consent_type || '',
    consentData.consent_text || '',
    consentData.signature_data || '',
    consentData.signed_at || '',
    consentData.ip_address || '',
    consentData.user_agent || ''
  ].join('|');

  return crypto.createHash('sha256').update(data).digest('hex');
}

function initialize() {
  loadOrGenerateKey();
}

export {
  initialize,
  encrypt,
  decrypt,
  encryptFields,
  decryptFields,
  encryptFieldsRecursive,
  generateIntegrityHash,
  isEncryptionEnabled
};