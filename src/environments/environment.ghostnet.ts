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
    TOP_DOMAINS: ['ith']
  },
  MAINNET: false,
  NODE_URL: 'https://ghostnet.ecadinfra.com',
  API_URL: 'https://api.ghostnet.tzkt.io/v1',
  BLOCK_EXPLORER_URL: 'https://ghostnet.tzkt.io',
  HARD_LIMITS: {
    hard_gas_limit_per_operation: 1040000,
    hard_gas_limit_per_block: 5200000,
    hard_storage_limit_per_operation: 60000
  },
  CONTRACT_ALIASES: {
    EmergentsTCG: {
      name: 'Emergents TCG',
      address: ['KT1AWS8nWonvfG5xt86KPb1JxrYx2TYE6KvL'],
      thumbnailUrl: 'assets/img/alias/emergents.svg',
      discoverUrl: 'assets/img/alias/emergents-discover.png',
      link: 'https://minterpop.com/emergentstcg',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['games', 'collectibles'],
      zoomDiscoverImg: true,
      description: 'A next-gen superhero trading card game'
    },
    HugeMoves: {
      name: 'Huge Moves',
      address: ['KT1LCGANZSkBFtVds8zZjPckjQVdTg1M7C3c'],
      thumbnailUrl: '../../../assets/img/alias/hugemoves.png',
      link: 'https://hugemoves.xyz/',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: 'This Huge Moves Soulbound NFT Collection serves as a key to our experimental space.'
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
