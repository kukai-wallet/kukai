export type WalletObject =
  LegacyWalletV1
  | LegacyWalletV2
  | LegacyWalletV3
  | LedgerWallet
  | HdWallet
  | TorusWallet;

export class Wallet {
  totalBalanceXTZ: number | null;
  totalBalanceUSD: number | null;
  XTZrate: number | null;
  implicitAccounts: ImplicitAccount[];
  lookups: any[];
  constructor() {
    this.totalBalanceXTZ = null;
    this.totalBalanceUSD = null;
    this.XTZrate = null;
    this.implicitAccounts = [];
    this.lookups = [];
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
  index: number;
  constructor(IV: string, encryptedSeed: string, encryptedEntropy: string) {
    super(encryptedSeed);
    this.encryptedEntropy = encryptedEntropy;
    this.IV = IV;
    this.index = 0;
  }
}

export class TorusWallet extends Wallet {
  verifier: string;
  id: string;
  name: string;
  constructor(verifier: string, id: string, name: string) {
    super();
    this.verifier = verifier;
    this.id = id;
    this.name = name;
  }
  displayName() {
    if (this.verifier === 'twitter') {
      return this.name;
    }
    return this.id;
  }
}
export class EmbeddedTorusWallet extends TorusWallet {
    origin: string;
    sk: string;
    instanceId: string;
    constructor(verifier: string, id: string, name: string, origin: string, sk: string, instanceId: string) {
      super(verifier, id, name);
      this.origin = origin;
      this.sk = sk;
      this.instanceId = instanceId;
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
  state: string;
  activities: Activity[];
  tokens: Token[] = [];
  pkh: string;
  pk: string;
  address: string;
  constructor(pkh: string, pk: string, address: string) {
    this.balanceXTZ = null;
    this.balanceUSD = null;
    this.delegate = '';
    this.state = '';
    this.activities = [];
    this.pkh = pkh;
    this.pk = pk;
    this.address = address;
  }
  public abstract isImplicit(): boolean;
  shortAddress(): string {
    return this.address.slice(0, 7) + '...' + this.address.slice(-4);
  }
  getTokenBalance(tokenId: string): string {
    if (this.tokens.length) {
      for (const token of this.tokens) {
        if (tokenId === token.tokenId) {
          return token.balance;
        }
      }
    }
    return '';
  }
  updateTokenBalance(tokenId: string, balance: string) {
    if (this.tokens.length) {
      for (let i = 0; i < this.tokens.length; i++) {
        if (tokenId === this.tokens[i].tokenId) {
          if (this.tokens[i].balance !== balance) {
            if (balance === '0' || (balance && balance.slice(0, 1) === '-')) {
              this.tokens.splice(i, 1);
            } else {
              this.tokens[i].balance = balance;
            }
          }
          return;
        }
      }
    }
    if (tokenId.length > 37 && balance && balance !== '0' && balance.slice(0, 1) !== '-') {
      this.tokens.push({ tokenId, balance});
    }
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
  status: number; // 0: unconfirmed, 1: confirmed, -1: failed
  amount: string;
  source: {
    address: string,
    alias?: string
  };
  destination: {
    address: string,
    alias?: string
  };
  fee?: string;
  hash: string;
  timestamp: number | null;
  tokenId?: string;
  entrypoint?: string;
}
export class Token {
  tokenId: string;
  balance: string;
}
