export interface KeyPair {
    sk: string|null;
    pk: string|null;
    pkh: string;
}
export interface Wallet {
  seed: null|string;
  passphrase: boolean|null;
  balance: Balance;
  XTZrate: number | null;
  accounts: Account[];
}
export interface Account {
  pkh: string|null;
  delegate: string;
  balance: Balance;
  numberOfActivites: number;
  activities: Activity[];
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
  balanceXTZ: number | null;
  pendingXTZ: number | null;
  balanceFiat: number | null;
  pendingFiat: number | null;
}
export enum WalletType {
  FullWallet,
  ViewOnlyWallet,
  ObserverWallet
}
