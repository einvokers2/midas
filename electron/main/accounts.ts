import crypto from 'crypto'
import CryptoJS from 'crypto-js';
// 定义加密参数
const saltLength = 16; // 盐的长度
const iterations = 100000; // 迭代次数
const keyLength = 64; // 密钥长度
const digest = 'sha512'; // 哈希算法

// 加密主密码
export function hashPassword(password) {
    

  
    return new Promise((resolve, reject) => {
      // 生成一个随机的盐
      const salt = crypto.randomBytes(saltLength).toString('hex');
      
      // 使用 pbkdf2 进行加密
      crypto.pbkdf2(password, salt, iterations, keyLength, digest, (err, derivedKey) => {
        if (err) reject(err);
        
        // 返回盐和哈希密码，格式为 `${salt}:${hashedPassword}`
        resolve(`${salt}:${derivedKey.toString('hex')}`);
      });
    });
  }
// 加密普通密码
export function encryptPassword(password, secretKey) {
  try {
    // 使用 AES 加密密码
    const encryptedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();
    
    return encryptedPassword;
  } catch (error) {
    console.error('加密失败:', error);
    return null;
  }
}

export function decryptPassword(encryptedPassword, secretKey) {
  try {
    // 使用 AES 解密密码
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
    
    // 将解密后的内容转换为原始字符串
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
    
    return originalPassword;
  } catch (error) {
    console.error('解密失败:', error);
    return null;
  }
}

export function verifyPassword(password, hashedPasswordWithSalt) {
    return new Promise((resolve, reject) => {
      // 将存储的盐和哈希密码分开
      const [salt, key] = hashedPasswordWithSalt.split(':');
      
      // 使用相同的盐对输入的密码进行加密
      crypto.pbkdf2(password, salt, iterations, keyLength, digest, (err, derivedKey) => {
        if (err) reject(err);
        
        // 比较加密后的密码与存储的哈希值是否相同

        resolve(key === derivedKey.toString('hex'));
      });
    });
  }