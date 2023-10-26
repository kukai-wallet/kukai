import { generateMnemonic } from '../utils';
import { mnemonicToSpsk, spskToShiftedMnemonic, shiftedMnemonicToMnemonic } from '../secp256k1';

describe('#spskToShiftedMnemonic', () => {
  it('shift mnemonic checksum part', () => {
    const mnemonicOriginal =
      'cloth myth beach health shove animal soon useless more shrimp arch frog frown tip tackle jeans nothing news lyrics lonely sweet child stand genre';
    const mnemonicShifted =
      'cloth myth beach health shove animal soon useless more shrimp arch frog frown tip tackle jeans nothing news lyrics lonely sweet child stand illegal';
    expect(shiftedMnemonicToMnemonic(mnemonicShifted)).toEqual(mnemonicOriginal);
  });
  it('spskToShiftedMnemonic then shiftedMnemonicToMnemonic should generate the original mnemonic', () => {
    const mnemonic = generateMnemonic(24);
    const shifted = spskToShiftedMnemonic(mnemonicToSpsk(mnemonic));
    const unshifted = shiftedMnemonicToMnemonic(shifted);
    expect(mnemonic).toBeDefined();
    expect(mnemonic).toEqual(unshifted);
  });

  it('Turn an spsk into a shifted mnemonic, then unshift it and get the origin spsk', () => {
    const spsk = 'spsk1kev1AKbjd7u1BRJcAPaj3yGBqk4QH6GDZRKKabrm1d16vtv8R';
    const shifted = spskToShiftedMnemonic(spsk);
    const unshifted = shiftedMnemonicToMnemonic(shifted);
    const spsk_ = mnemonicToSpsk(unshifted);
    expect(spsk_).toEqual(spsk);
  });
});
