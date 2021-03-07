import { Account } from '../../services/wallet/wallet';
export interface PrepareRequest {
  account: Account;
  tokenTransfer: string;
}
export interface ConfirmRequest {
  account: Account;
  tokenTransfer: string;
  transactions: FullyPreparedTransaction[];
}
export interface PartiallyPreparedTransaction {
  kind: 'transaction';
  amount: string;
  destination: string;
  parameters?: any;
  meta?: {
    alias: string;
    verifier: string;
    twitterId?: string;
  };
}
export interface FullyPreparedTransaction extends PartiallyPreparedTransaction {
  fee: string;
  gasLimit: string;
  storageLimit: string;
}
