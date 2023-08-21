// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { Constants, DisplayLinkOption } from '../app/interfaces';

export const environment = {
  production: false
};
const _CONSTANTS: Constants = {
  NETWORK: 'ghostnet',
  NAME: 'Testnet / Ghostnet',
  TEZOS_DOMAIN: {
    CONTRACT: 'KT1WffvKqRGaPtVWYR1ZkG2GQY42B7a8x3kk',
    TOP_DOMAINS: ['gho']
  },
  MAINNET: false,
  NODE_URL: ['https://ghostnet.ecadinfra.com', 'https://ghostnet.smartpy.io', 'https://ghostnet.tezos.marigold.dev'],
  API_URL: 'https://api.ghostnet.tzkt.io/v1',
  OBJKT_URL: 'https://data.ghostnet.objkt.com/v3/graphql',
  BLOCK_EXPLORER_URL: 'https://ghostnet.tzkt.io',
  HARD_LIMITS: {
    hard_gas_limit_per_operation: 1040000,
    hard_gas_limit_per_block: 2600000,
    hard_storage_limit_per_operation: 60000
  },
  CONTRACT_ALIASES: {
    Objkt: {
      name: 'objkt.com',
      address: [],
      thumbnailUrl: '../../../assets/img/alias/objktcom.svg',
      discoverUrl: '../../../assets/img/alias/objktcom.svg',
      link: 'https://ghostnet.objkt.com',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['marketplace'],
      description: 'The best Tezos NFTs all in one place'
    },
    admire: {
      name: 'admire.art',
      address: ['KT1AWnk45HxqcAgTdtgwCUae8FosYkttLxA4', 'KT1KTENwCZDnGqRhjQeUsECxozRvQeGtRCti'],
      thumbnailUrl: '../../../assets/img/alias/admire.png',
      shouldDisplayLink: DisplayLinkOption.None
    }
  },
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
