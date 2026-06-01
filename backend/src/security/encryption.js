
const crypto = require('crypto');
const ALGORITHM = 'aes-256-gcm';

const getEncryptionKey = () => {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error(' ENCRYPTION_KEY no está definida en las variables de entorno.');
  }
  return Buffer.from(keyHex, 'hex');
};

const encryption = {
  /**
   * @param {string} text - El texto a cifrar
   * @returns {string} - Datos cifrados en formato Base64 (IV + AuthTag + Ciphertext)
   */
  encrypt: (text) => {
    if (!text) return text;

    try {
      const key = getEncryptionKey();
      
      // Generar un IV único para cada cifrado (12)
      const iv = crypto.randomBytes(12);

      // Crear el Cipher con el algoritmo, clave y IV
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

      // Cifrar el texto
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Obtener el Auth Tag para garantizar la integridad de los datos
      const authTag = cipher.getAuthTag();

   // Combinar IV + AuthTag + Ciphertext en un solo Buffer para almacenar en la BD
      const payload = Buffer.concat([
        iv,
        authTag,
        Buffer.from(encrypted, 'hex')
      ]);

      return payload.toString('base64');
    } catch (error) {
      console.error('Error al cifrar datos:', error);
      throw new Error('Fallo en el proceso de cifrado.');
    }
  },

  /**
   * Descifra datos previamente cifrados con AES-256-GCM
   * @param {string} encryptedBase64 - El string en Base64 que viene de la BD
   * @returns {string} - El texto plano original
   */
  decrypt: (encryptedBase64) => {
    if (!encryptedBase64) return encryptedBase64;

    try {
      const key = getEncryptionKey();
      
      // Convertir el Base64 de vuelta a un Buffer
      const payload = Buffer.from(encryptedBase64, 'base64');

      // Extraer las piezas basándonos en el tamaño que definimos al cifrar
      const iv = payload.subarray(0, 12);              
      const authTag = payload.subarray(12, 28);        
      const encryptedText = payload.subarray(28);       

      // Crear el Decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

      // Aplicar el sello de integridad antes de descifrar
      decipher.setAuthTag(authTag);

      // Descifrar el texto
      let decrypted = decipher.update(encryptedText, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Error de integridad o descifrado (Posible alteración de BD):', error);
      return '[DATOS CORRUPTOS O CLAVE INVÁLIDA]'; 
    }
  }
};

module.exports = encryption;