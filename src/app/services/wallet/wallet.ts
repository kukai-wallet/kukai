export type WalletObject =
  LegacyWalletV1
  | LegacyWalletV2
  | LegacyWalletV3
  | LedgerWallet
  | HdWallet;

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

export class FullWallet extends Wallet {
  encryptedSeed: string;
  constructor(encryptedSeed: string) {
    super();
    this.encryptedSeed = encryptedSeed;
  }
}

export class LegacyWalletV1 extends FullWallet {
  salt: string;
  constructor(salt: string, encrypedSeed: string) {
    super(encrypedSeed);
    this.salt = salt;
  }
}

export class LegacyWalletV2 extends FullWallet {
  IV: string;
  constructor(IV: string, encryptedSeed: string) {
    super(encryptedSeed);
    this.IV = IV;
  }
}

export class LegacyWalletV3 extends FullWallet {
  encryptedEntropy: string;
  IV: string;
  constructor(IV: string, encryptedSeed: string, encryptedEntropy: string) {
    super(encryptedSeed);
    this.IV = IV;
    this.encryptedEntropy = encryptedEntropy;
  }
}

export class HdWallet extends FullWallet {
  encryptedEntropy: string;
  IV: string;
  unusedAccounts: any[];
  constructor(IV: string, encryptedSeed: string, encryptedEntropy: string) {
    super(encryptedSeed);
    this.encryptedEntropy = encryptedEntropy;
    this.IV = IV;
    this.unusedAccounts = [];
  }
}

export class LedgerWallet extends Wallet {
  constructor() {
    super();
  }
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
    this.delegate = '';
    this.activitiesCounter = -1;
    this.activities = [];
    this.pkh = pkh;
    this.pk = pk;
    this.address = address;
  }
  public abstract isImplicit(): boolean;
  shortAddress(): string {
    return this.address.slice(0, 7) + '..' + this.address.slice(-4);
  }
}

export class ImplicitAccount extends Account {
  originatedAccounts: OriginatedAccount[];
  derivationPath?: string;
  constructor(pkh: string, pk: string, derivationPath?: string) {
    super(pkh, pk, pkh);
    this.originatedAccounts = [];
    if (derivationPath) {
      this.derivationPath = derivationPath;
    }
  }
  isImplicit(): boolean {
    return true;
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
  fee: number;
  destination: string;
  hash: string;
  timestamp: string;
}
