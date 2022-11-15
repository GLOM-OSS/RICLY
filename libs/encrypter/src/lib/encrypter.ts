import { AES as Encrypter, enc } from 'crypto-js';

const CRYPTJS_SECRET = `${
  process.env['CRYPTJS_SECRET'] ?? process.env['NX_CRYPTJS_SECRET']
}`;

export type ColumnType = string | number | boolean | Date | null;
export type CustomRecord = Record<string, ColumnType>;

/**
 *
 * @param data Data to encrypt
 * @returns encrypted string
 */
export function encrypt(data: ColumnType | object) {
  return Encrypter.encrypt(JSON.stringify(data), CRYPTJS_SECRET).toString();
}

/**
 * @type T decrypted value wanted Type
 * @param encryptedString
 * @returns a decrypted value (typeof value = primitif type) or a decrypted object as a hole
 */
export function decrypt<T>(encryptedString: string) {
  return JSON.parse(
    Encrypter.decrypt(encryptedString, CRYPTJS_SECRET).toString(enc.Utf8)
  ) as T;
}

/**
 * @type T wanted type
 * @param objectOfcryptedValues
 * @returns  the given object with the values of it keys decrypted and it keys unchanged
 */
export function decryptValues<T extends CustomRecord>(
  objectOfcryptedValues: Record<string, string>
) {
  const decryptedObject: CustomRecord = {};
  Object.keys(objectOfcryptedValues).forEach((key) => {
    decryptedObject[key] = decrypt<ColumnType>(objectOfcryptedValues[key]);
  });
  return decryptedObject as T;
}

/**
 *
 * @param objectToEncrypt
 * @returns the input object with the values of it key crypted and the keys unchanged
 */
export function encryptValues<T extends Record<string, string>>(
  objectToEncrypt: CustomRecord
) {
  const encryptedObject: Record<string, string> = {};
  Object.keys(objectToEncrypt).forEach((key) => {
    encryptedObject[key] = encrypt(objectToEncrypt[key]);
  });
  return encryptedObject as T;
}