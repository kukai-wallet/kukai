import { Activity } from './services/wallet/wallet';
import { Asset, ContractOverrideType, ContractType } from './services/token/token.service';

export { Activity };

export interface KeyPair {
  sk: string | null;
  pk: string | null;
  pkh: string;
}
export interface Wallet {
  seed: null | string;
  salt: null | string;
  pk?: string;
  encryptionVersion: number | null;
  type: WalletType;
  balance: Balance;
  XTZrate: number | null;
  accounts: Account[];
  derivationPath?: string;
}
export interface Account {
  pkh: string | null;
  delegate: string;
  balance: Balance;
  numberOfActivites: number;
  activities: Activity[];
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
  ObserverWallet,
  LedgerWallet,
  HdWallet
}
export interface Baker {
  baker_name: string;
  image: string;
  rolls: number;
  identity: string;
  vote: string;
  vote2: string;
  // vote: []
}
export interface Vote {
  voting_period: string;
  period_kind: PeriodKind;
  proposal_hash: string[];
  proposal_alias: string[];
  votes: number[];
  operation: string[];
}
export interface Period {
  amendment: string;
  period: number;
  period_kind: string;
  proposal_hash: string[];
  proposal_alias: string[];
  start_level: number;
  end_level: number;
  level: number;
  progress: number;
  remaining: number;
}
export interface ParticipationPerPeriod {
  proposal?: [{
    hash: string;
    alias: string;
    count: number;
    votes: number;
  }];
  unused_count: number;
  total_count: number;
  unused_votes: number;
  total_votes: number;
}
export interface Ballot {
  proposal: string;
  nb_yay: number;
  nb_nay: number;
  nb_pass: number;
  vote_yay: number;
  vote_nay: number;
  vote_pass: number;
}
export enum PeriodKind {
  Proposal,
  Exploration,
  Testing,
  Promotion
}
export interface DefaultTransactionParams {
  gas: number;
  storage: number;
  fee: number;
  burn: number;
  reveal?: boolean;
  customLimits?: {
    gasLimit: number;
    storageLimit: number;
  }[];
}

export enum DisplayLinkOption {
  All,
  DirectAuth,
  None,
}

export interface Constants {
  NAME: string;
  TEZOS_DOMAIN: {
    CONTRACT: string;
    TOP_DOMAIN: string;
  };
  NETWORK: string;
  MAINNET: boolean;
  NODE_URL: string;
  BLOCK_EXPLORER_URL: string;
  ALLOWED_EMBED_ORIGINS: string[];
  HARD_LIMITS: {
    hard_gas_limit_per_operation: number,
    hard_gas_limit_per_block: number,
    hard_storage_limit_per_operation: number,
  },
  ASSETS: Record<string, ContractType>;
  CONTRACT_OVERRIDES: Record<string, ContractOverrideType>;
  CONTRACT_ALIASES: Record<string, { name?: string, address: string[], thumbnailUrl: Asset, discoverUrl?: string, link: string, shouldDisplayLink: DisplayLinkOption, category?: string[], backgroundColor?: string }>;
  NFT_CONTRACT_OVERRIDES: string[];
}
