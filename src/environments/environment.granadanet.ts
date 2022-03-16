// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { Constants, DisplayLinkOption } from './../app/interfaces';

export const environment = {
  production: false
};
const _CONSTANTS: Constants = {
  NETWORK: 'granadanet',
  NAME: 'Testnet / Granadanet',
  TEZOS_DOMAIN: {
    CONTRACT: 'KT1Pg2i2fySptcJg3QEwvQzTUPAyoGADNSLe',
    TOP_DOMAIN: 'gra'
  },
  MAINNET: false,
  NODE_URL: 'https://api.tez.ie/rpc/granadanet',
  BLOCK_EXPLORER_URL: 'https://granadanet.tzkt.io',
  HARD_LIMITS: {
    hard_gas_limit_per_operation: 1040000,
    hard_gas_limit_per_block: 5200000,
    hard_storage_limit_per_operation: 60000
  },
  CONTRACT_ALIASES: {
    QuipuSwap: {
      name: 'QuipuSwap',
      address: [],
      thumbnailUrl: '../../../assets/img/alias/quipu.png',
      discoverUrl: '../../../assets/img/alias/quipuswap-discover.jpeg',
      link: 'https://quipuswap.com/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['exchange'],
      backgroundColor: '#222d47',
      description: 'A decentralized exchange on Tezos'
    },
    MinterPop: {
      name: 'Minter Pop',
      address: ['KT1T7ShxhtSRuhvhHeug6Sjc7W8irLmswEt7'],
      thumbnailUrl: '../../../assets/img/alias/minterpop.svg',
      discoverUrl: '../../../assets/img/alias/minterpop-discover.png',
      link: 'https://minterpop-dev.vercel.app/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['collectibles'],
      description: 'Curated NFT art and collectibles marketplace'
    },
    Quartz: {
      name: 'Quartz',
      address: ['KT1Caj4ZXbop5AswuH4RAv61rMVEeVdtFk4f'],
      thumbnailUrl: '../../../assets/img/alias/quartz-demo.svg',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: ''
    },
    TezosDomains: {
      name: 'Tezos Domains',
      address: ['KT1Ch6PstAQG32uNfQJUSL2bf2WvimvY5umk'],
      thumbnailUrl: '',
      discoverUrl: '../../../assets/img/alias/tezosdomains-discover.png',
      link: 'https://granadanet.tezos.domains/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['identity'],
      description: 'Friendly names on Tezos',
      backgroundColor: '#f1f4f8'
    },
    Kalamint: {
      name: 'Kalamint',
      address: ['KT1FWJZb8eAXmucegZ3tWQB7TCRvQGjTmfB6'],
      thumbnailUrl: '../../../assets/img/alias/kalamint-thumbnail.png',
      discoverUrl: '../../../assets/img/alias/kalamint.svg',
      link: 'https://testnet.kalamint.io/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['marketplace'],
      backgroundColor: '#0ab688',
      description: 'Create, sell and collect NFTs'
    },
    PixelPotus: {
      name: 'PixelPotus',
      address: ['KT1B3pPLmJnVUfEogxDTc7tGNQdicbHToyBx'],
      thumbnailUrl: '../../../assets/img/alias/pixelpotus.png',
      link: 'https://www.pixelpotus.com/',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['game', 'collectibles'],
      description: 'Collectibles game with FREE daily NFTs',
      backgroundColor: '#c7b299'
    },
    Tezotopia: {
      name: 'Tezotopia',
      address: ['KT1SZ87ihAWc43YZxYjoRz8MQyAapUGbZigG'],
      thumbnailUrl: '../../../assets/img/alias/tezotopia.png',
      discoverUrl: '../../../assets/img/alias/tezotopia-discover.png',
      link: 'https://testnet.app.tezotopia.com/marketplace/units',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['game', 'collectibles'],
      description: 'Battle, earn, win prizes plus NFT yield farming'
    },
    Versum: {
      name: 'Versum',
      address: ['KT1XUw3is6ZbTJ1xKUYPefuVZ2ECd7LEan2Q'],
      thumbnailUrl: '../../../assets/img/alias/versum.png',
      discoverUrl: '../../../assets/img/alias/versum.svg',
      link: 'https://versum.xyz',
      shouldDisplayLink: DisplayLinkOption.All,
      backgroundColor: 'black',
      category: ['marketplace'],
      description: 'NFT Marketplace focused on organic content and curation.'
    }
  },
  ASSETS: {},
  NFT_CONTRACT_OVERRIDES: [],
  CONTRACT_OVERRIDES: {}
};
const _TRUSTED_TOKEN_CONTRACTS = [
  'KT1RWoiiyQTd88etyJq33KvJgsLioSgngBfB', //spicyswap fake token assets
  'KT1TzKzgaBAKiKdrnuxRY3YnYFmRTTnhx29Z', //spicyswap swap lp
  'KT1CwDfjEPsR1kTrgsH2EXztD9ke8Krcz8ig', //spicyswap swap lp
  'KT1F4ibGZGfiMVEHhyWgh1RzBRdJmtNVgkse', //spicyswap swap lp
  'KT1D2UEB5LNUPSyPoP3QeWpcekh25Me27HrW', //spicyswap swap lp
  'KT1Caj4ZXbop5AswuH4RAv61rMVEeVdtFk4f', //Quartz demo
  'KT1T7ShxhtSRuhvhHeug6Sjc7W8irLmswEt7', //Minterpop
  'KT1SZ87ihAWc43YZxYjoRz8MQyAapUGbZigG', //Tezotopia
  'KT1B3pPLmJnVUfEogxDTc7tGNQdicbHToyBx', //PixelPotus old test
  'KT1FWJZb8eAXmucegZ3tWQB7TCRvQGjTmfB6' //Kalamint
];
const _BLACKLISTED_TOKEN_CONTRACTS = [];
const _MODEL_3D_WHITELIST = [];

export const CONSTANTS = JSON.parse(JSON.stringify(_CONSTANTS));
export const TRUSTED_TOKEN_CONTRACTS = JSON.parse(JSON.stringify(_TRUSTED_TOKEN_CONTRACTS));
export const BLACKLISTED_TOKEN_CONTRACTS = JSON.parse(JSON.stringify(_BLACKLISTED_TOKEN_CONTRACTS));
export const MODEL_3D_WHITELIST = JSON.parse(JSON.stringify(_MODEL_3D_WHITELIST));
