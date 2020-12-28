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
  ASSETS: {
    'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9': {
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
    'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn': {
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'tzBTC',
          symbol: 'tzBTC',
          decimals: 8,
          description: 'tzBTC delivers the power of Bitcoin as a token on the Tezos blockchain.',
          imageSrc: '../../../assets/img/tokens/tzbtc.png',
          nonTransferable: false,
          symbolPrecedence: true,
          binaryAmount: false
        }
      }
    }
  }
};
export const TRUSTED_TOKEN_CONTRACTS = [];