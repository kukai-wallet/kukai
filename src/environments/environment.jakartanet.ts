// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { Constants, DisplayLinkOption } from '../app/interfaces';

export const environment = {
  production: false
};
const _CONSTANTS: Constants = {
  NETWORK: 'jakartanet',
  NAME: 'Testnet / Jakartanet',
  TEZOS_DOMAIN: {
    CONTRACT: 'KT1D6vXtKDtF2fE5uQuUkMTDGpEeTrbByX25',
    TOP_DOMAINS: ['jak']
  },
  MAINNET: false,
  NODE_URL: 'https://jakartanet.ecadinfra.com',
  BLOCK_EXPLORER_URL: 'https://jakartanet.tzkt.io',
  HARD_LIMITS: {
    hard_gas_limit_per_operation: 1040000,
    hard_gas_limit_per_block: 5200000,
    hard_storage_limit_per_operation: 60000
  },
  CONTRACT_ALIASES: {},
  ASSETS: {},
  NFT_CONTRACT_OVERRIDES: [],
  CONTRACT_OVERRIDES: {},
  FEATURE_CONTRACTS: {}
};
const _TRUSTED_TOKEN_CONTRACTS = [];
const _BLACKLISTED_TOKEN_CONTRACTS = [];
const _MODEL_3D_WHITELIST = [];

export const CONSTANTS = JSON.parse(JSON.stringify(_CONSTANTS));
export const TRUSTED_TOKEN_CONTRACTS = JSON.parse(JSON.stringify(_TRUSTED_TOKEN_CONTRACTS));
export const BLACKLISTED_TOKEN_CONTRACTS = JSON.parse(JSON.stringify(_BLACKLISTED_TOKEN_CONTRACTS));
export const MODEL_3D_WHITELIST = JSON.parse(JSON.stringify(_MODEL_3D_WHITELIST));
