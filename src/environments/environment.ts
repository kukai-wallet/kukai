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
          name: 'USD tez',
          symbol: 'USDtz',
          decimals: 6,
          description: 'USDtz is a Tezos on-chain stablecoin pegged to the value of the United States Dollar.',
          imageSrc: '../../../assets/img/tokens/usdtz.png'
        }
      }
    }
  }
};
