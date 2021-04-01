import { Account } from '../../services/wallet/wallet';
export interface PrepareRequest {
  account: Account;
  tokenTransfer: string;
}
export interface TemplateRequest {
  ops: FullyPreparedTransaction[];
  template: Template;
  fee: TemplateFee;
}
export interface TemplateFee {
  network: string;
  storage: string;
  total: string;
}
export interface Template {
  action?: string;
  description: Description;
  button?: string;
}
interface Description {
  [0]: TextWithImg|string;
  [1]: string;
  [2]: TextWithImg|string;
}
interface TextWithImg {
  text: string;
  imgUrl?: string;
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
