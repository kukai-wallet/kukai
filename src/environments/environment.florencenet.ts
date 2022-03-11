// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { Constants, DisplayLinkOption } from '../app/interfaces';

export const environment = {
  production: false
};
const _CONSTANTS: Constants = {
  NAME: 'Testnet / Florencenet',
  TEZOS_DOMAIN: {
    CONTRACT: 'KT1KQkkVMTRhGUfJYbHBoaeJ6NUJi8o58cvg',
    TOP_DOMAIN: 'flo'
  },
  NETWORK: 'florencenet',
  MAINNET: false,
  NODE_URL: 'https://florencenet.api.tez.ie',
  BLOCK_EXPLORER_URL: 'https://florencenet.tzkt.io',
  HARD_LIMITS: {
    hard_gas_limit_per_operation: 1040000,
    hard_gas_limit_per_block: 5200000,
    hard_storage_limit_per_operation: 60000
  },
  CONTRACT_ALIASES: {
    Eli: {
      address: ['KT1DgT2VViqZR5qt9bzXZnmbAsPkdad8fxrc'],
      thumbnailUrl: 'https://cloudflare-ipfs.com/ipfs/QmXJHCoidLgxcf4Sbi3UvasEtFTbzVme6f7ztSQ6tJFXTr',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None
    },
    USDtz: {
      address: ['KT1FCMQk44tEP9fm9n5JJEhkSk1TW3XQdaWH'],
      thumbnailUrl: '../../../assets/img/tokens/usdtz.png',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None
    },
    tzBTC: {
      address: ['KT1CUg39jQF8mV6nTMqZxjUUZFuz1KXowv3K'],
      thumbnailUrl: '../../../assets/img/tokens/tzbtc.png',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None
    },
    MFIL: {
      address: ['KT1MGe5wY9FugXvsjin4SnQFEU7yM1FFBF9U'],
      thumbnailUrl: '../../../assets/img/tokens/mfil.jfif',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None
    },
    kUSD: {
      address: ['KT1RXpLtz22YgX24QQhxKVyKvtKZFaAVtTB9'],
      thumbnailUrl: '../../../assets/img/tokens/kusd.png',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None
    },
    OpenMinter: {
      address: ['KT1DzPX2SHnviWURFUfD5NQ9FcHQVmYFuPYu'],
      thumbnailUrl: '../../../assets/img/tokens/minter.svg',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None
    },
    PixelPotus: {
      address: ['KT1D1S7KywvhzrTWHBo9MWUn5x3R9vxBmbio'],
      thumbnailUrl: 'https://www.pixelpotus.com/img/eagle-right.d1840b0b.png',
      link: 'https://pixelpotus-frontend-172tineil-pixelpotus.vercel.app/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['collectibles']
    },
    MysteryMap: {
      address: ['KT1MktwJ9ud6i57e4NKzBkwweEArVsMobHrU'],
      thumbnailUrl: '',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None
    },
    SpicySwap: {
      address: ['KT1QzkVVgUYMTvwnyRwGttM8zTg5CyuHKxQH', 'KT1HEzZQV9B85HZnGpDgaZtZNk4ZXbLRuBii'],
      thumbnailUrl: 'https://miro.medium.com/max/1950/1*P4W6alVA28NnbBy9CfJOpg.png',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None
    },
    Truesy: {
      address: ['KT1TVA93qdPyhKXXgi5rN4XphJZBh4PgARb5', 'KT1Dwucgeaa9bgFi3Ds16Q1VAgpapXPhMZ5Q'],
      thumbnailUrl: '../../../assets/img/spinner/truesy.svg',
      link: 'https://www.truesy.com/',
      shouldDisplayLink: DisplayLinkOption.None
    },
    MinterPop: {
      address: ['KT1M2TMFrF1gbr64a7ySE3Cvt5BjZqQLKE6s'],
      thumbnailUrl: '../../../assets/img/alias/minterpop.svg',
      // thumbnailUrl: {
      //   filename: 'u4tdtnfwszmavwllohvxnhm6x6udvp',
      //   extension: 'svg'
      // },
      link: 'https://minterpop.vercel.app/',
      shouldDisplayLink: DisplayLinkOption.DirectAuth,
      category: ['collectibles']
    },
    MinterPopDev: {
      name: 'MinterPop Dev',
      address: ['KT1AzVpQRrQNNQU4x1KGUS3E6P96yZYjQfbS'],
      thumbnailUrl: '../../../assets/img/alias/minterpop.svg',
      // thumbnailUrl: {
      //   filename: 'u4tdtnfwszmavwllohvxnhm6x6udvp',
      //   extension: 'svg'
      // },
      link: 'https://minterpop-dev.vercel.app/',
      shouldDisplayLink: DisplayLinkOption.DirectAuth,
      category: ['collectibles']
    },
    PixelPotusv2: {
      name: 'PixelPotus v2',
      address: ['KT1AorRGJvDkbpa8ap6setUGMCNm21bpp8qe'],
      thumbnailUrl: 'https://www.pixelpotus.com/img/eagle-right.d1840b0b.png',
      // thumbnailUrl: {
      //   filename: '5oqkhgoiie2dqyylrvk47spwt4webt',
      //   extension: 'png'
      // },
      link: 'https://pixelpotus-frontend-r7y63b2h9-pixelpotus.vercel.app/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['collectibles']
    },
    Kalamint: {
      address: ['KT1DEJEcfiMUWYjn1ZCTbbLokRcP26sx2pTH'],
      thumbnailUrl: 'https://testnet.kalamint.io/static/media/logo.2681f48f.svg',
      discoverUrl: '../../../assets/img/alias/kalamint.svg',
      link: 'https://testnet.kalamint.io/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['marketplaces'],
      backgroundColor: '#0ab688'
    },
    Tezotopia: {
      address: ['KT1G1V5hS6ghW95GsUV2ZbEfEHENAvq3zTMn'],
      thumbnailUrl: '../../../assets/img/alias/tezotopia.png',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None
    },
    InterpopComics: {
      name: 'Interpop Comics',
      address: ['KT1KG5XcKeUtFWvQBkeiTe5vjvrAya8VsQFi'],
      thumbnailUrl: '../../../assets/img/tokens/INTERPOP_FINAL_ICON.svg',
      // thumbnailUrl: {
      //   filename: '2fl5x5wifmqwbsd6d4axz5wrxwlpqv',
      //   extension: 'svg'
      // },
      link: 'https://dev.interpopcomics.com/',
      shouldDisplayLink: DisplayLinkOption.DirectAuth,
      category: ['collectibles']
    }
  },
  ASSETS: {
    KT1FCMQk44tEP9fm9n5JJEhkSk1TW3XQdaWH: {
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'USD Tez',
          symbol: 'USDtz',
          decimals: 6,
          description: 'USDtz is a Tezos on-chain stablecoin pegged to the value of the United States Dollar.',
          displayAsset: '../../../assets/img/tokens/usdtz.png',
          thumbnailAsset: '../../../assets/img/tokens/usdtz.png',
          shouldPreferSymbol: true,
          status: 1
        }
      }
    },
    KT1CUg39jQF8mV6nTMqZxjUUZFuz1KXowv3K: {
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'tzBTC',
          symbol: 'tzBTC',
          decimals: 8,
          description: '',
          displayAsset: '../../../assets/img/tokens/tzbtc.png',
          thumbnailAsset: '../../../assets/img/tokens/tzbtc.png',
          isTransferable: false,
          isBooleanAmount: false,
          status: 1
        }
      }
    },
    KT1MGe5wY9FugXvsjin4SnQFEU7yM1FFBF9U: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Tezos Israel Workshop Certificate',
          symbol: 'MFIL',
          decimals: 0,
          description:
            'This certificate verifies that the holder of its private key attended, contributed and completed the Tezos Israel and Madfish Solution Workshop on December 7th to the 9th, 2020. The certificate holder utilized skills in smart contract development and tokenization to build, test and deploy a token on the Tezos blockchain.',
          displayAsset: '../../../assets/img/tokens/mfil.jfif',
          thumbnailAsset: '../../../assets/img/tokens/mfil.jfif',
          isTransferable: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1RXpLtz22YgX24QQhxKVyKvtKZFaAVtTB9: {
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Kolibri USD',
          symbol: 'kUSD',
          decimals: 18,
          description: 'Kolibri is a Tezos based stablecoin built on Collateralized Debt Positions (CDPs) known as Ovens.',
          displayAsset: '../../../assets/img/tokens/kusd.png',
          thumbnailAsset: '../../../assets/img/tokens/kusd.png',
          shouldPreferSymbol: true,
          status: 1
        }
      }
    },
    KT1DgT2VViqZR5qt9bzXZnmbAsPkdad8fxrc: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-29': {
          name: 'Eli Forever',
          symbol: '',
          decimals: 0,
          description: 'You can keep my face',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmZwSEXcagB1SGtbbncSDxMwAe6haf1xyFKMUwpMwvMAEc',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmXJHCoidLgxcf4Sbi3UvasEtFTbzVme6f7ztSQ6tJFXTr',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1Dwucgeaa9bgFi3Ds16Q1VAgpapXPhMZ5Q: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-9': {
          name: 'in bloom',
          symbol: '',
          decimals: 0,
          description:
            'I had a pretty intense year both personally and artistically, something between dream and frenzy. Things I was expecting for a long time happened suddenly and I feel like everything is blooming right now. It’s funny because the artwork itself is blooming while you’re watching it.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmaN5STTo5TS5ittfMVFPmQSsS3z4JdNQfpMJNJtsCNsYZ',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmaN5STTo5TS5ittfMVFPmQSsS3z4JdNQfpMJNJtsCNsYZ',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1TVA93qdPyhKXXgi5rN4XphJZBh4PgARb5: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-9': {
          name: 'Welcome to Miami',
          symbol: '',
          decimals: 0,
          description:
            'This piece was the first time I painted something inspired by the city that I’ve called home for my whole life. Miami. \nWhen I was considering the composition for this piece, I kept coming back to that famous saying, “the whole is greater than the sum of its parts.”\nSo if you asked me, what makes Miami, “Miami”? It’s the Miami skyline. It’s the palm trees that line the streets. It’s the boats parked on the dock. It’s the lifeguard towers spread along the beaches. It’s the ocean’s waves. And it’s the weather. The bipolar weather represented in the woman carrying an umbrella. First it’s sunny, then it rains, then it’s sunny again.\nMiami wouldn’t be “Miami” without all these features incorporated together that make up the vibrant city that it is. And so much more.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmPfQcyyjqAATqjtpVH9YCUxKH8fasUYZGoaSR4BwyMiu5',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmPfQcyyjqAATqjtpVH9YCUxKH8fasUYZGoaSR4BwyMiu5',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    }
  },
  CONTRACT_OVERRIDES: {
    // mystery map
    'KT1TWb6cE56q2L8yTeNNchXqDSXacrNqyVNZ:reward': {
      storage: 150,
      gas: 60000
    },
    'KT1RUSCZ7pJ3WNTuXFD44UpStmNRjA459guZ:reward': {
      storage: 150,
      gas: 60000
    },
    'KT1PrNd3sy1pLAqGtft47dzG4v8KizqPJntT:reward': {
      storage: 150,
      gas: 59920
    }
  },
  NFT_CONTRACT_OVERRIDES: ['KT1QzkVVgUYMTvwnyRwGttM8zTg5CyuHKxQH', 'KT1HEzZQV9B85HZnGpDgaZtZNk4ZXbLRuBii']
};
const _TRUSTED_TOKEN_CONTRACTS = [
  'KT1LyJV9JdcDCp5zDfw6MxpoShXYrBMG3dfK',
  'KT1RfMoskMhR1hDFJTVN6gGMwQLDSTmLeDsc',
  'KT1Szwqme712TkQ7LdP1hBqKjdUUBjxoB8bR',
  'KT1PS2jZVzNMW54UsnqBqwwkArXnAZ29jiTF',
  'KT1XgGvzQSYrvo4NCxwTvJ7tSbZqGcji4BeV',
  'KT1R3TqdxsHPYxNQBdY7jmXAeU17WpucMXDh',
  'KT1PS2jZVzNMW54UsnqBqwwkArXnAZ29jiTF',
  'KT1Jscaxi6J9sKUzX37wFfRRdZPdNfMDy85R',
  'KT1NaoA6pjAMCpnQAmUoQTxMCuEjJ2kodyrj',
  'KT1RMqNMuXm2EU99E75cHk53iN75y9kmCG1X',
  'KT1TWb6cE56q2L8yTeNNchXqDSXacrNqyVNZ',
  'KT1PBL66suJeW2nBbWXgR9ex9gu7TFCmSgQg',
  'KT1R5U6HXDZAykVd5gcoWEoGGwE7mznWLajL',
  'KT1Ea5N3B4b3LTWvCX7FZoV9Q3pjs4XSvPHh',
  'KT1Eb4LP7k15y6zCdHUjM3qkzi5T1dRSLPhq',
  'KT1WcB4vxci5C1DjmJkMNSmaANFvgQDvdprZ',
  'KT1T66r244FFuH2hpfZgoKVRLXDtnfjBRxVc',
  'KT1XgGvzQSYrvo4NCxwTvJ7tSbZqGcji4BeV',
  'KT1GhzeDu852VfxHQT3AnnUu2U1q4GnVTYJv',
  'KT1R3TqdxsHPYxNQBdY7jmXAeU17WpucMXDh',
  'KT1RUSCZ7pJ3WNTuXFD44UpStmNRjA459guZ',
  'KT1PrNd3sy1pLAqGtft47dzG4v8KizqPJntT',
  'KT1WgeR4SaaTiTrwzrR1aD7h9YfeUTWcvC9j',
  'KT1D1S7KywvhzrTWHBo9MWUn5x3R9vxBmbio',
  'KT1DzPX2SHnviWURFUfD5NQ9FcHQVmYFuPYu',
  'KT1D1S7KywvhzrTWHBo9MWUn5x3R9vxBmbio',
  'KT1MktwJ9ud6i57e4NKzBkwweEArVsMobHrU',
  'KT1QzkVVgUYMTvwnyRwGttM8zTg5CyuHKxQH',
  'KT1HEzZQV9B85HZnGpDgaZtZNk4ZXbLRuBii',
  'KT1M2TMFrF1gbr64a7ySE3Cvt5BjZqQLKE6s',
  'KT1G1V5hS6ghW95GsUV2ZbEfEHENAvq3zTMn',
  'KT1DEJEcfiMUWYjn1ZCTbbLokRcP26sx2pTH'
];
const _BLACKLISTED_TOKEN_CONTRACTS = [];
const _MODEL_3D_WHITELIST = [];

export const CONSTANTS = JSON.parse(JSON.stringify(_CONSTANTS));
export const TRUSTED_TOKEN_CONTRACTS = JSON.parse(JSON.stringify(_TRUSTED_TOKEN_CONTRACTS));
export const BLACKLISTED_TOKEN_CONTRACTS = JSON.parse(JSON.stringify(_BLACKLISTED_TOKEN_CONTRACTS));
export const MODEL_3D_WHITELIST = JSON.parse(JSON.stringify(_MODEL_3D_WHITELIST));
