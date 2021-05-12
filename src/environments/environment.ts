// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { Constants } from './../app/interfaces';

export const environment = {
  production: false
};
export const CONSTANTS: Constants = {
  NAME: 'Testnet / Edonet',
  TEZOS_DOMAIN_CONTRACT: 'KT1KQkkVMTRhGUfJYbHBoaeJ6NUJi8o58cvg',
  NETWORK: 'edonet',
  MAINNET: false,
  NODE_URL: 'https://api.tez.ie/rpc/edonet',
  BLOCK_EXPLORER_URL: 'https://edo2net.tzkt.io',
  ASSETS: {
    'KT1FCMQk44tEP9fm9n5JJEhkSk1TW3XQdaWH': {
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'USD Tez',
          symbol: 'USDtz',
          decimals: 6,
          description: 'USDtz is a Tezos on-chain stablecoin pegged to the value of the United States Dollar.',
          displayUrl: '../../../assets/img/tokens/usdtz.png',
          thumbnailUrl: '../../../assets/img/tokens/usdtz.png',
          shouldPreferSymbol: true
        }
      }
    },
    'KT1CUg39jQF8mV6nTMqZxjUUZFuz1KXowv3K': {
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'tzBTC',
          symbol: 'tzBTC',
          decimals: 8,
          description: '',
          displayUrl: '../../../assets/img/tokens/tzbtc.png',
          thumbnailUrl: '../../../assets/img/tokens/tzbtc.png',
          isTransferable: false,
          isBooleanAmount: false
        }
      }
    },
    'KT1MGe5wY9FugXvsjin4SnQFEU7yM1FFBF9U': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Tezos Israel Workshop Certificate',
          symbol: 'MFIL',
          decimals: 0,
          description: 'This certificate verifies that the holder of its private key attended, contributed and completed the Tezos Israel and Madfish Solution Workshop on December 7th to the 9th, 2020. The certificate holder utilized skills in smart contract development and tokenization to build, test and deploy a token on the Tezos blockchain.',
          displayUrl: '../../../assets/img/tokens/mfil.jfif',
          thumbnailUrl: '../../../assets/img/tokens/mfil.jfif',
          isTransferable: false,
          isBooleanAmount: true
        }
      }
    },
    'KT1RXpLtz22YgX24QQhxKVyKvtKZFaAVtTB9': {
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Kolibri USD',
          symbol: 'kUSD',
          decimals: 18,
          description: 'Kolibri is a Tezos based stablecoin built on Collateralized Debt Positions (CDPs) known as Ovens.',
          displayUrl: '../../../assets/img/tokens/kusd.png',
          thumbnailUrl: '../../../assets/img/tokens/kusd.png',
          shouldPreferSymbol: true
        }
      }
    },
    'KT1DgT2VViqZR5qt9bzXZnmbAsPkdad8fxrc': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-29': {
          name: 'Eli Forever',
          symbol: '',
          decimals: 0,
          description: 'You can keep my face',
          displayUrl: 'https://cloudflare-ipfs.com/ipfs/QmZwSEXcagB1SGtbbncSDxMwAe6haf1xyFKMUwpMwvMAEc',
          thumbnailUrl: 'https://cloudflare-ipfs.com/ipfs/QmXJHCoidLgxcf4Sbi3UvasEtFTbzVme6f7ztSQ6tJFXTr',
          shouldPreferSymbol: false,
          isBooleanAmount: true
        }
      }
    }
  },
  CONTRACT_OVERRIDES: {
    // mystery map
    'KT1TWb6cE56q2L8yTeNNchXqDSXacrNqyVNZ:reward': {
      storageUsage: 150, gasUsage: 59920
    },
    'KT1RUSCZ7pJ3WNTuXFD44UpStmNRjA459guZ:reward': {
      storageUsage: 150, gasUsage: 59920
    },
    'KT1PrNd3sy1pLAqGtft47dzG4v8KizqPJntT:reward': {
      storageUsage: 150, gasUsage: 59920
    },
  }
};
export const TRUSTED_TOKEN_CONTRACTS = [
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
  'KT1WgeR4SaaTiTrwzrR1aD7h9YfeUTWcvC9j'
];
