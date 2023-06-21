import { hexToBuf, bufToHex } from '../common';

describe('#hex2buf', () => {
  it('should return buf', () => {
    const buf = hexToBuf('01af');
    expect(buf).toBeDefined();
    expect(JSON.stringify(buf)).toBe(JSON.stringify(Uint8Array.from([1, 175])));
  });
});

describe('#buf2hex', () => {
  it('should return buf', () => {
    const hex = bufToHex(Uint8Array.from([1, 175]));
    expect(hex).toBeDefined();
    expect(hex.toString()).toBe('01af');
  });
});
