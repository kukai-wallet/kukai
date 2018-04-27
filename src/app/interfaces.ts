export interface KeyPair {
    sk: string|null;
    pk: string|null;
    pkh: string;
}
export interface Wallet {
  seed: null|string; // If both salt and passphrase null, this will be unencrypted
  salt: string|null;
  passphrase: boolean|null;
  balance: Balance;
  XTZrate: number;
  accounts: Account[];
}
export interface Account {
  pkh: string|null;
  delegate: string;
  balance: Balance;
  numberOfActivites: number;
  activities: Activity[];
  delegatedXTZ: number;  // Test purpose - modification needed in wallet.service.ts, activity.service.ts
}
export interface Activity {
  hash: string;
  block: string;
  source: string;
  destination: string;
  amount: number;
  fee: number;
  timestamp: null|Date;
  type: string;
}
export interface Balance {
  balanceXTZ: number;
  pendingXTZ: number;
  balanceFiat: number;
  pendingFiat: number;
}
