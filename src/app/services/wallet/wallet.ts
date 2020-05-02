import { splitAtPeriod } from '@angular/compiler/src/util';

export type WalletObject = LegacyWalletV2;
  // | LegacyWalletV1 
  // |LegacyWalletV2
  // | LedgerWallet
  // | HdWallet;

export class Wallet {
  totalBalanceXTZ: number | null;
  totalBalanceUSD: number | null;
  XTZrate: number | null;
  implicitAccounts: ImplicitAccount[];
  constructor() {
    this.totalBalanceXTZ = null;
    this.totalBalanceUSD = null;
    this.XTZrate = null;
    this.implicitAccounts = [];
  }
  getAccounts(): Account[] {
    const accounts: Account[] = [];
    if (this.implicitAccounts.length) {
      for (const implicitAccount of this.implicitAccounts) {
        accounts.push(implicitAccount);
        if (implicitAccount.originatedAccounts.length) {
          for (const originatedAccount of implicitAccount.originatedAccounts) {
            accounts.push(originatedAccount);
          }
        }
      }
    }
    return accounts;
  }
  getImplicitAccounts(): ImplicitAccount[] {
    return this.implicitAccounts;
  }
  getAccount(address: string): Account {
    if (this.implicitAccounts.length) {
      for (const implicitAccount of this.implicitAccounts) {
        if (implicitAccount.address === address) {
          return implicitAccount;
        }
        if (implicitAccount.originatedAccounts.length) {
          for (const originatedAccount of implicitAccount.originatedAccounts) {
            if (originatedAccount.address === address) {
              return originatedAccount;
            }
          }
        }
      }
    }
    return null;
  }
  getImplicitAccount(pkh: string): ImplicitAccount {
    if (this.implicitAccounts.length) {
      for (const implicitAccount of this.implicitAccounts) {
        if (implicitAccount.pkh === pkh) {
          return implicitAccount;
        }
      }
    }
    return null;
  }
}

export class LegacyWallet extends Wallet {
  encryptedSeed: string;
  constructor(encryptedSeed: string) {
    super();
    this.encryptedSeed = encryptedSeed;
  }
}

export class LegacyWalletV1 extends LegacyWallet {
  salt: string;
}

export class LegacyWalletV2 extends LegacyWallet {
  IV: string;
  constructor(IV: string, encryptedSeed: string) {
    super(encryptedSeed);
    this.IV = IV;
  }
}

export class HdWallet extends Wallet {
  encryptedSeed: string;
  encryptedMnemonic: string;
  accountIndex: number;
  unusedAddresses: [];
}

export class LedgerWallet extends Wallet {
  derivationPath: string;
}

// Accounts

export abstract class Account {
  balanceXTZ: number | null;
  balanceUSD: number | null;
  delegate: string;
  activitiesCounter: number;
  activities: Activity[];
  pkh: string;
  pk: string;
  address: string;
  constructor(pkh: string, pk: string, address: string) {
    this.balanceXTZ = null;
    this.balanceUSD = null;
    this.delegate = "";
    this.activitiesCounter = 0;
    this.activities = [];
    this.pkh = pkh;
    this.pk = pk;
    this.address = address;
  }
  public abstract isImplicit(): boolean;
}

export class ImplicitAccount extends Account {
  originatedAccounts: OriginatedAccount[];
  constructor(pkh: string, pk: string) {
    super(pkh, pk, pkh);
    this.originatedAccounts = [];
  }
  isImplicit(): boolean {
    return true;
  }
}

export class HdAccount extends ImplicitAccount {
  derivationPath: string;
  constructor(pkh: string, pk: string, derivationPath: string) {
    super(pkh, pk);
    this.derivationPath = derivationPath;
  }
}

export class OriginatedAccount extends Account {
  constructor(ktAddress: string, managerPkh: string, managerPk: string) {
    super(managerPkh, managerPk, ktAddress);
  }
  isImplicit(): boolean {
    return false;
  }
}

export class Activity {
  type: string;
  block: string;
  failed: boolean;
  amount: number;
  source: string;
  destination: string;
  hash: string;
  timestamp: string;
}
