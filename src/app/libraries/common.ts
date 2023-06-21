import * as Bs58check from 'bs58check';

const prefix = {
  tz1: new Uint8Array([6, 161, 159]),
  tz2: new Uint8Array([6, 161, 161]),
  tz3: new Uint8Array([6, 161, 164]),
  edpk: new Uint8Array([13, 15, 37, 217]),
  edsk: new Uint8Array([43, 246, 78, 7]),
  edsig: new Uint8Array([9, 245, 205, 134, 18]),
  sig: new Uint8Array([4, 130, 43]),
  o: new Uint8Array([5, 116]),
  B: new Uint8Array([1, 52]),
  TZ: new Uint8Array([3, 99, 29]),
  KT1: new Uint8Array([2, 90, 121])
};

const mergebuf = (b: Uint8Array, wm = Uint8Array.from([3])): Uint8Array => {
  const r = new Uint8Array(wm.length + b.length);
  r.set(wm);
  r.set(b, wm.length);
  return r;
};

const hexToBuf = (hex: string): Uint8Array => {
  return Uint8Array.from(
    hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16);
    })
  );
};

const bufToHex = (buffer: Uint8Array): string => {
  const byteArray = Uint8Array.from(buffer),
    hexParts = [];
  for (let i = 0; i < byteArray.length; i++) {
    const hex = byteArray[i].toString(16);
    const paddedHex = ('00' + hex).slice(-2);
    hexParts.push(paddedHex);
  }
  return hexParts.join('');
};

const base58encode = (payload: Uint8Array, prefixx?: Uint8Array): string => {
  const n = new Uint8Array(prefixx.length + payload.length);
  n.set(prefixx);
  n.set(payload, prefixx.length);
  return Bs58check.encode(Buffer.from(bufToHex(n), 'hex'));
};

const base58decode = (enc: string, prefixx: Uint8Array): Uint8Array => {
  let n = Bs58check.decode(enc);
  n = n.slice(prefixx.length);
  return n;
};

const hexToPk = (hex: string): string => {
  return base58encode(hexToBuf(hex.slice(2, 66)), prefix.edpk);
};

export { base58encode, base58decode, mergebuf, hexToBuf, hexToPk, bufToHex, prefix };
