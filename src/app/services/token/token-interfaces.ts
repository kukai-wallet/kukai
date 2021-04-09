
export enum TokenStatus {
  PENDING,
  APPROVED,
  REJECTED,
}

export interface TokenResponseType {
  contractAddress: string;
  id: number;
  decimals: number;
  displayUrl: string;
  thumbnailUrl: string;
  name: string;
  symbol: string;
  description: string;
  category: string;
  kind: string;
  isTransferable?: boolean;
  isBooleanAmount?: boolean;
  shouldPreferSymbol?: boolean;
  series?: string;
  tokenStatus: TokenStatus;
}
export type ContractsType = Record<string, ContractType>;
export type ContractType = FA12 | FA2;
export interface TokensInterface {
  category: string;
}
export interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  description: string;
  displayUrl: string;
  thumbnailUrl: string;
  isTransferable?: boolean;
  isBooleanAmount?: boolean;
  shouldPreferSymbol?: boolean;
  series?: string;
  tokenStatus: TokenStatus;
}
export interface FA12 extends TokensInterface {
  kind: 'FA1.2';
  tokens: {
    0: TokenData
  };
}
export interface FA2 extends TokensInterface {
  kind: 'FA2';
  tokens: Record<number, TokenData>;
}