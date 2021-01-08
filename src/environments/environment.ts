// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { Constants } from './../app/interfaces';

export const environment = {
  production: false
};
export const CONSTANTS: Constants = {
  NAME: 'Testnet / Delphinet',
  NETWORK: 'delphinet',
  MAINNET: false,
  NODE_URL: 'https://delphinet-tezos.giganode.io',
  BLOCK_EXPLORER_URL: 'https://delphinet.tzkt.io',
  ASSETS: {
    'KT1REPEBMQS3Be8ZybkQQfSwAv3g4pHJViuK': {
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'USD Tez',
          symbol: 'USDtz',
          decimals: 6,
          description: 'USDtz is a Tezos on-chain stablecoin pegged to the value of the United States Dollar.',
          imageSrc: '../../../assets/img/tokens/usdtz.png'
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
          imageSrc: '../../../assets/img/tokens/mfil.jfif',
          nonTransferable: true,
          symbolPrecedence: false,
          binaryAmount: true
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
          imageSrc: '../../../assets/img/tokens/kusd.png',
          nonTransferable: true,
          symbolPrecedence: false,
          binaryAmount: true
        }
      }
    }
  }
};
export const TRUSTED_TOKEN_CONTRACTS = [
  'KT1T6uCxdWcvUhKZfeg83QU2wrormgy63Upd'
];
