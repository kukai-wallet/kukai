// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { Constants, DisplayLinkOption } from '../app/interfaces';

export const environment = {
  production: false
};
export const CONSTANTS: Constants = {
  NETWORK: 'hangzhounet',
  NAME: 'Testnet / Hangzhounet',
  TEZOS_DOMAIN: {
    CONTRACT: 'KT1CEX6h5wxXMJ1f24ZZ8woDTmamZqPzcU5x',
    TOP_DOMAIN: 'han'
  },
  MAINNET: false,
  NODE_URL: 'https://rpc.hangzhounet.teztnets.xyz',
  BLOCK_EXPLORER_URL: 'https://hangzhou2net.tzkt.io',
  HARD_LIMITS: {
    hard_gas_limit_per_operation: 1040000,
    hard_gas_limit_per_block: 5200000,
    hard_storage_limit_per_operation: 60000
  },
  CONTRACT_ALIASES: {
    'TezosDomains': {
        name: 'Tezos Domains',
        address: ["KT1MgQjmWMBQ4LyuMAqZccTkMSUJbEXeGqii"],
        thumbnailUrl: "",
        discoverUrl: "../../../assets/img/alias/tezosdomains-discover.png",
        link: "https://hangzhounet.tezos.domains", shouldDisplayLink: DisplayLinkOption.All, category: ["identity"],
        description: "Friendly names on Tezos",
        backgroundColor: '#f1f4f8'
    }
  },
  ASSETS: {},
  NFT_CONTRACT_OVERRIDES: [],
  CONTRACT_OVERRIDES: {}
};
export const TRUSTED_TOKEN_CONTRACTS = [];
export const BLACKLISTED_TOKEN_CONTRACTS = []
