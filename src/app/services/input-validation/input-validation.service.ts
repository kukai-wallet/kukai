import { Injectable } from '@angular/core';
import { OperationService } from '../operation/operation.service';
import { utils, hd } from '@tezos-core-tools/crypto-utils';
import * as zxcvbn from 'zxcvbn';

import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class InputValidationService {

  constructor(
    private operationService: OperationService,
    private translate: TranslateService
  ) { }
  /*
    Input validations
  */
  mnemonics(mnemonics: string): boolean {
    return this.operationService.validMnemonic(mnemonics);
  }
  password(password: string): boolean {
    return (zxcvbn(password).score === 4);
  }
  passwordStrengthDisplay(password: string): string {
    if (!password) {
      return '';
    }
    switch (zxcvbn(password).score) {
      case 0: {
        return this.translate.instant('INPUTVALIDATIONCOMPONENT.CATASTROPHIC');  // 'Catastrophic!'
      } case 1: {
        return this.translate.instant('INPUTVALIDATIONCOMPONENT.VERYWEAK');  // 'Very weak!'
      } case 2: {
        return this.translate.instant('INPUTVALIDATIONCOMPONENT.WEAK');  // 'Weak!'
      } case 3: {
        return this.translate.instant('INPUTVALIDATIONCOMPONENT.WEAK');  // 'Weak!'
      } case 4: {
        return this.translate.instant('INPUTVALIDATIONCOMPONENT.STRONG');  // 'Strong!'
      } default: {
        return '';
      }
    }
  }
  address(address: string): Boolean {
    return this.operationService.validAddress(address);
  }
  torusAccount(verifierId: string, loginType: string): Boolean {
    switch (loginType) {
      case 'google':
        return this.email(verifierId);
      case 'reddit':
        return this.redditAccount(verifierId);
      case 'twitter':
        return this.twitterAccount(verifierId);
      default:
        return false;
    }

  }
  redditAccount(username: string) {
    // Letters, numbers, dashes, and underscores only
    // Username must be between 3 and 20 characters
    const re = /^[0-9a-zA-Z\-\_]{3,20}$/;
    return re.test(username);
  }
  email(email: string): Boolean {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  twitterAccount(username: string) {
    // The only characters you can use are uppercase and lowercase letters, numbers, and the underscore character ( _ ).
    const re = /^\@{1}[0-9a-zA-Z\_]{1,15}$/;
    return re.test(username);
  }
  twitterId(id: string) {
    const re = /^[0-9]+$/;
    return re.test(id);
  }
  passphrase(passphrase: string): Boolean {
    return true;
  }
  amount(amount: string): Boolean {
    console.log(amount);
    if (amount === '' || amount === '0') { // default value / zero
      return true;
    } else if (Number(amount) && amount.match(/^(0|[1-9][0-9]{0,8})(\.[0-9]{1,6}){0,1}$/g)) { // Positive number
      return true;
    }
    return false;
  }
  fee(fee: string): Boolean {
    return this.amount(fee); // same as amount
  }
  gas(amount: string): Boolean {
    if (amount === '' || amount === '0') { // default value / zero
      return true;
    } else if (Number(amount) && 0 < Number(amount) && Number(amount) % 1 === 0) { // Positive integer
      return true;
    } else {
      return false;
    }
  }
  storage(amount: string) {
    return this.gas(amount);
  }
  code(code: string): Boolean {
    if (code && code.length === 40 && code.match(/^[0-9a-f]*$/g)) { // 40 hex chars
      return true;
    } else {
      return false;
    }
  }
  derivationPath(path: string): Boolean {
    const m = path.match(/^44\'\/1729(\'\/[0-9]+)+\'$/g);
    if (m || path === '44\'/1729\'') {
      return true;
    }
    return false;
  }
  operationRaw(hex: string): Boolean {
    if (hex && hex.match(/^[a-f0-9]*$/)) {
      return true;
    } else {
      return false;
    }
  }
}
