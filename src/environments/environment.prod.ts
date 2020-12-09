import { Constants } from './../app/interfaces';

export const environment = {
  production: true
};
export const CONSTANTS: Constants = {
  NAME: 'Mainnet',
  NETWORK: 'mainnet',
  MAINNET: true,
  NODE_URL: 'https://mainnet-tezos.giganode.io',
  BLOCK_EXPLORER_URL: 'https://tzkt.io',
  CSI: {
    url: 'https://conseil-prod.cryptonomic-infra.tech',
    apiKey: 'klassare'
  },
  ASSETS: {}
};
