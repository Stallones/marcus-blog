/**
 * AES 加密/解密工具
 * 脚本端加密 JSON → 浏览器端解密使用
 *
 * 密钥可通 ?key=xxx 覆盖，默认值见 DEFAULT_KEY
 */

import CryptoJS from "crypto-js";

// 密钥 长度=0 则 不加密
function getKey(): string {
  // return "sta-blog-static-v1";
  return "";
}

function isCrypto(): boolean {
  return getKey().length > 0;
}

/** 加密（脚本端使用） */
function encrypt(data: any): string {
  if (!isCrypto()) return JSON.stringify(data);
  else return CryptoJS.AES.encrypt(JSON.stringify(data), getKey()).toString();
}

/** 解密（浏览器端使用） */
function decrypt<T = any>(encrypted: string): T {
  if (!isCrypto()) return JSON.parse(encrypted);
  else {
    const bytes = CryptoJS.AES.decrypt(encrypted, getKey());
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
}

export {isCrypto,encrypt,decrypt}
