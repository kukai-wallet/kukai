import { Injectable } from '@angular/core';
import { OperationService } from '../services/operation.service';
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

    let result = '';
    switch (zxcvbn(password).score) {
      case 0: {
        this.translate.get('INPUTVALIDATIONCOMPONENT.CATASTROPHIC').subscribe(
          (res: string) => result = res
        );
        return result;  // 'Catastrophic!'
      } case 1: {
        this.translate.get('INPUTVALIDATIONCOMPONENT.VERYWEAK').subscribe(
          (res: string) => result = res
        );
        return result;  // 'Very weak!'
      } case 2: {
        this.translate.get('INPUTVALIDATIONCOMPONENT.WEAK').subscribe(
          (res: string) => result = res
        );
        return result;  // 'Weak!'
       } case 3: {
        this.translate.get('INPUTVALIDATIONCOMPONENT.MODERATE').subscribe(
          (res: string) => result = res
        );
        return result;  // 'Moderate!'
      } case 4: {
        this.translate.get('INPUTVALIDATIONCOMPONENT.STRONG').subscribe(
          (res: string) => result = res
        );
        return result;  // 'Strong!'
      } default: {
        return '';
      }
    }
  }
address(address: string): Boolean {
  return this.operationService.validAddress(address);
}
email(email: string): Boolean {
  return (email && email.includes('@'));
}
passphrase(passphrase: string): Boolean {
  return true;
}
amount(amount: string): Boolean {
  if (amount === '' || amount === '0') { // default value / zero
    return true;
  } else if (Number(amount) && 0 < Number(amount)) { // Positive number
    return true;
  } else {
    return false;
  }
}
fee(fee: string): Boolean {
  return this.amount(fee); // same as amount
}
code(code: string): Boolean {
  if (code && code.length === 40 && code.match(/^[a-f0-9]*$/)) { // 40 hex chars
    return true;
  } else {
    return false;
  }
}
operationRaw(hex: string): Boolean {
  if (hex && hex.match(/^[a-f0-9]*$/)) {
    return true;
  } else {
    return false;
  }
}
}
