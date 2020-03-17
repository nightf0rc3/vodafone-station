import * as sjcl from 'sjcl';


export default class SJCLWrapper {

  public static DEFAULT_SJCL_PARANOIA: number = 10;
  public static DEFAULT_SJCL_NUMWORDS: number = 2
  public static DEFAULT_SJCL_ITERATIONS: number = 1000;
  public static DEFAULT_SJCL_KEYSIZEBITS: number = 128;
  public static DEFAULT_SJCL_TAGLENGTH: number = 128;

  public static sjclPbkdf2(password: string, salt: string, iterations: number, keySizeBits: number) {
    const saltBits: string = sjcl.codec.hex.toBits(salt);
    var dk = sjcl.misc.pbkdf2(password, saltBits, iterations, keySizeBits);

    if (dk.length > 0) {
      dk = sjcl.codec.hex.fromBits(dk);
    } else {
      dk = 0;
    }
    return dk;
  }

  public static sjclCCMencrypt (derivedKey: string, plainText: string, initVector: string, authData: string, tagLenBits: number) {
    // Convert derived key from hex to bitArray
    derivedKey = sjcl.codec.hex.toBits(derivedKey);
    // AES pseudorandom function based on derived key
    var prf = new sjcl.cipher.aes(derivedKey);
    //Convert plainText and iv to bitArrays
    plainText = sjcl.codec.utf8String.toBits(plainText);
    initVector = sjcl.codec.hex.toBits(initVector);
    //Convert ascii string authData to bitArray, then hex string, finally to bitArray
    authData = sjcl.codec.utf8String.toBits(authData);
    authData = sjcl.codec.hex.fromBits(authData);
    authData = sjcl.codec.hex.toBits(authData);
    // Encrypt with params to get cipher text
    var ct = sjcl.mode.ccm.encrypt (prf, plainText, initVector, authData, tagLenBits);
    if (ct.length > 0) {
      ct = sjcl.codec.hex.fromBits(ct);
    } else {
      ct = 0;
      console.log('cipher text is empty');
    }
    return ct;
  }

  public static sjclCCMdecrypt (derivedKey: string, cipherText: string, initVector: string, authData: string, tagLenBits: number) {
    // AES pseudorandom function based on derived key
    derivedKey = sjcl.codec.hex.toBits(derivedKey);
    var prf = new sjcl.cipher.aes(derivedKey);
    //Convert cipher text and iv to bitArrays
    cipherText = sjcl.codec.hex.toBits(cipherText);
    initVector = sjcl.codec.hex.toBits(initVector);
    //Convert ascii string authData to bitArray, then hex string, finally to bitArray
    authData = sjcl.codec.utf8String.toBits(authData);
    authData = sjcl.codec.hex.fromBits(authData);
    authData = sjcl.codec.hex.toBits(authData);
    // Decrypt with params
    var pt = sjcl.mode.ccm.decrypt (prf, cipherText, initVector, authData, tagLenBits);
    if (pt.length > 0) {
      pt = sjcl.codec.utf8String.fromBits(pt);
    } else {
      pt = 0;
    }
    return pt;
  }
}
