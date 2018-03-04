export interface KeyPair {
    sk: string|null;
    pk: string|null;
    pkh: string;
}
export interface Account {
  pkh: string|null;
  balance: number;
  pending: number;
  balanceFiat: number;
  pendingFiat: number;
}
export interface Identity {
  pkh: string;
  balance: number;
  pending: number;
  balanceFiat: number;
  pendingFiat: number;
}
export interface Wallet {
  encryptedMnemonic: null|string;
  salt: string|null;
  balance: number;
  pending: number;
  balanceFiat: number;
  pendingFiat: number;
  accounts: Account[];
  identity: Identity|null;
}
export interface Transaction {
  hash: string;
  block: string;
  source: string;
  destination: string;
  amount: number;
  fee: number;
  timestamp: string|null;
  type: string;
}
export interface TransactionsData {
  pkh: string;
  counter: number;
  transactions: Transaction[];
}
