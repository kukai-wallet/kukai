// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { Constants, DisplayLinkOption } from '../app/interfaces';

export const environment = {
  production: false
};
const _CONSTANTS: Constants = {
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
    },
    'Versum': {
      name: "Versum",
      address: ["KT1EY6XHM8ycpozauAjCqTqVrnyZLo2b1fUv", "KT1PVJP2FbSZrXgKWdhXguMV1HmfrX4dH7o5"],
      thumbnailUrl: "../../../assets/img/alias/versum.png",
      discoverUrl: "../../../assets/img/alias/versum.svg",
      link: "https://versum.xyz", shouldDisplayLink: DisplayLinkOption.All, backgroundColor: 'black', category: ["marketplace"],
      description: "NFT Marketplace focused on organic content and curation.",
    },
    'EndlessWays': {
      name: "Endless Ways",
      address: ["KT1U17aZt1fuFeHpkaFLTjoqbRngHEUa4JBw", "KT1RPY1YEH9L1fp2Zy3DdByb5KukrP34XWcR", "KT1EibnzPnFiCKtaN8EyUrhxyGk1N8XT1Tmu"],
      thumbnailUrl: "../../../assets/img/alias/endlesswaysLogo.png",
      discoverUrl: "../../../assets/img/alias/endlesswaysBanner.png",
      link: "https://greenroom.endlessways.net", shouldDisplayLink: DisplayLinkOption.All, backgroundColor: 'black', category: ["collectibles"],
      description: "Generative Art. Proper Curation.",
    },
  },
  ASSETS: {
    'KT1U17aZt1fuFeHpkaFLTjoqbRngHEUa4JBw': {
      kind: 'FA2',
      category: 'collectibles',
      tokens: {
        '1-119999999999': {
          name: 'Endless Ways',
          symbol: 'EWY',
          decimals: 0,
          description: 'A unique mint of an artwork on Endless Ways.',
          displayAsset: '../../../assets/img/tokens/endlessways.svg',
          thumbnailAsset: '../../../assets/img/tokens/endlessways.svg',
          shouldPreferSymbol: false,
          status: 1
        }
      }
    },  
    'KT1RPY1YEH9L1fp2Zy3DdByb5KukrP34XWcR': {
      kind: 'FA2',
      category: 'collectibles',
      tokens: {
        '1-149999999999': {
          name: 'Endless Ways',
          symbol: 'EWY',
          decimals: 0,
          description: 'A unique mint of an artwork on Endless Ways.',
          displayAsset: '../../../assets/img/tokens/endlessways.svg',
          thumbnailAsset: '../../../assets/img/tokens/endlessways.svg',
          shouldPreferSymbol: false,
          status: 1
        }
      }
    }, 
    'KT1EibnzPnFiCKtaN8EyUrhxyGk1N8XT1Tmu': {
      kind: 'FA2',
      category: 'collectibles',
      tokens: {
        '1-999990000000000': {
          name: 'Endless Ways',
          symbol: 'EWY',
          decimals: 0,
          description: 'A unique mint of an artwork on Endless Ways.',
          displayAsset: '../../../assets/img/tokens/endlessways.svg',
          thumbnailAsset: '../../../assets/img/tokens/endlessways.svg',
          shouldPreferSymbol: false,
          status: 1
        }
      }
    }, 
  },
  NFT_CONTRACT_OVERRIDES: [],
  CONTRACT_OVERRIDES: {}
};
const _TRUSTED_TOKEN_CONTRACTS = [];
const _BLACKLISTED_TOKEN_CONTRACTS = []

export const CONSTANTS = JSON.parse(JSON.stringify(_CONSTANTS));
export const TRUSTED_TOKEN_CONTRACTS = JSON.parse(JSON.stringify(_TRUSTED_TOKEN_CONTRACTS));
export const BLACKLISTED_TOKEN_CONTRACTS = JSON.parse(JSON.stringify(_BLACKLISTED_TOKEN_CONTRACTS));
