import Big from 'big.js';

export class Amount {
  decimalPlaces: number = 6;
  internalBigInt: Big = Big(0);
  internalNormalised: number = 0;

  constructor(c: any) {
    if (c?.rpcAmount === undefined && c?.normalisedAmount === undefined) {
      return;
    }
    this.decimalPlaces = c.decimalPlaces;
    if (!!c?.rpcAmount) {
      let multiplierIntValue = Math.round(Math.pow(10, this.decimalPlaces));
      this.internalNormalised = parseFloat(Big(c.rpcAmount).div(multiplierIntValue).toString() || 0);
      this.internalBigInt = Big(c.rpcAmount);
    } else if (!!c?.normalisedAmount) {
      let multiplierIntValue = Math.round(Math.pow(10, this.decimalPlaces));
      this.internalNormalised = parseFloat(Big(c.normalisedAmount).toString() || 0);
      this.internalBigInt = Big(c.normalisedAmount).times(multiplierIntValue);
    }
  }
}
