import nacl from "tweetnacl";
import { decodeUTF8, encodeUTF8 } from "tweetnacl-util";

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export const encryptionUtils = {
  generateKeyPair: (): KeyPair => {
    const pair = nacl.box.keyPair();
    return {
      publicKey: Array.from(pair.publicKey).map(b => b.toString(16).padStart(2, '0')).join(''),
      privateKey: Array.from(pair.secretKey).map(b => b.toString(16).padStart(2, '0')).join(''),
    };
  },

  // Helper for hex to uint8
  hexToUint8: (hex: string) => {
    const matches = hex.match(/.{1,2}/g);
    if (!matches) return new Uint8Array(0);
    return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
  },

  // Helper for uint8 to hex
  uint8ToHex: (uint8: Uint8Array) => {
    return Array.from(uint8).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  encryptForPeer: (text: string, peerPublicKeyHex: string, myPrivateKeyHex: string) => {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageUint8 = decodeUTF8(text);
    const peerPublicKey = encryptionUtils.hexToUint8(peerPublicKeyHex);
    const myPrivateKey = encryptionUtils.hexToUint8(myPrivateKeyHex);

    const encrypted = nacl.box(messageUint8, nonce, peerPublicKey, myPrivateKey);
    
    const full = new Uint8Array(nonce.length + encrypted.length);
    full.set(nonce);
    full.set(encrypted, nonce.length);

    return {
      ciphertext: encryptionUtils.uint8ToHex(full),
      algorithm: "sealed_box", 
    };
  },

  decryptFromPeer: (ciphertextHex: string, peerPublicKeyHex: string, myPrivateKeyHex: string) => {
    const full = encryptionUtils.hexToUint8(ciphertextHex);
    const nonce = full.slice(0, nacl.box.nonceLength);
    const encrypted = full.slice(nacl.box.nonceLength);
    
    const peerPublicKey = encryptionUtils.hexToUint8(peerPublicKeyHex);
    const myPrivateKey = encryptionUtils.hexToUint8(myPrivateKeyHex);

    const decrypted = nacl.box.open(encrypted, nonce, peerPublicKey, myPrivateKey);
    if (!decrypted) return null;

    return encodeUTF8(decrypted);
  }
};
