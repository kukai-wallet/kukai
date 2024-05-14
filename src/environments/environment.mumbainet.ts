// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { Constants, DisplayLinkOption } from '../app/interfaces';

export const environment = {
  production: false
};
const _CONSTANTS: Constants = {
  NETWORK: 'mumbainet',
  NAME: 'Testnet / Mumbainet',
  TEZOS_DOMAIN: {
    TOP_DOMAINS: ['mum']
  },
  MAINNET: false,
  NODE_URL: ['https://mumbainet.ecadinfra.com'],
  API_URL: 'https://api.mumbainet.tzkt.io/v1',
  BLOCK_EXPLORER_URL: 'https://mumbainet.tzkt.io',
  HARD_LIMITS: {
    hard_gas_limit_per_operation: 1040000,
    hard_gas_limit_per_block: 2600000,
    hard_storage_limit_per_operation: 60000
  },
  ASSETS: {},
  NFT_CONTRACT_OVERRIDES: [],
  CONTRACT_OVERRIDES: {},
  FEATURE_CONTRACTS: {}
};
const _TRUSTED_TOKEN_CONTRACTS = [];

export const CONSTANTS = JSON.parse(JSON.stringify(_CONSTANTS));
export const TRUSTED_TOKEN_CONTRACTS = JSON.parse(JSON.stringify(_TRUSTED_TOKEN_CONTRACTS));
