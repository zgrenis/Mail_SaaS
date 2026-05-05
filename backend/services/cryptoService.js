const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm'; // crypto algorithm for encryption and decryption
const SECRET_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // hex means data encoded in hexadecimal system 256 bit = 32 bytes. We use buffer because crypto functions require only byte data

// Encrypting
function encrypt(text) {
  const iv = crypto.randomBytes(16); //to generate different encrypted data for the same input
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv); //encrypting model with algorithm, secret key and iv
  let encrypted = cipher.update(text, 'utf8', 'hex'); // text(utf8) to hex (with keys)
  encrypted += cipher.final('hex');  // finalizes encryption and processes remaining data blocks to hex even if there is no more data to encrypt we should finalize the encryption process
  const authTag = cipher.getAuthTag().toString('hex'); // generates a unique authentication tag (security seal) to hex. to prevent tampered data
  return `${iv.toString('hex')}:${authTag}:${encrypted}`; // packages iv, authTag, and encrypted data into a single colon-separated string
}

// Decrypting
function decrypt(encryptedText) {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':'); // split input : by : iv, authTag and encrypted data
  const iv = Buffer.from(ivHex, 'hex'); // hex to bytes for decryption process
  const authTag = Buffer.from(authTagHex, 'hex'); // hex to bytes for decryption process
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv); // decryption model with algorithm, secret key and iv
  decipher.setAuthTag(authTag); // check the integrity of the data and ensure it has not been tampered with during decryption process
  let decrypted = decipher.update(encrypted, 'hex', 'utf8'); // encrypted data (hex) to text (utf8) with keys
  decrypted += decipher.final('utf8'); // finalizes decryption and processes remaining data blocks to text even if there is no more data to decrypt we should finalize the decryption process
  return decrypted;
}

module.exports = { encrypt, decrypt };