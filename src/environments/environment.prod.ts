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
    'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9': { // USDtz
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'USD Tez',
          symbol: 'USDtz',
          decimals: 6,
          description: 'USDtz is a Tezos on-chain stablecoin pegged to the value of the United States Dollar.',
          displayUrl: '../../../assets/img/tokens/usdtz.png',
          symbolPreference: true
        }
      }
    },
    'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn': { // tzBTC
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'tzBTC',
          symbol: 'tzBTC',
          decimals: 8,
          description: 'tzBTC delivers the power of Bitcoin as a token on the Tezos blockchain.',
          displayUrl: '../../../assets/img/tokens/tzbtc.png',
          symbolPreference: true
        }
      }
    },
    'KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8': { // ETHtz
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Ethertez',
          symbol: 'ETHtz',
          decimals: 18,
          description: 'ETHtz is Ethereum wrapped in the Tezos FA 2.0 token standard.',
          displayUrl: '../../../assets/img/tokens/ethtz.png',
          symbolPreference: true
        }
      }
    },
    'KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH': { // wXTZ
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Wrapped Tezos',
          symbol: 'wXTZ',
          decimals: 6,
          description: 'Wrapped Tezos by StakerDAO, a fully collateralized representation of XTZ.',
          displayUrl: '../../../assets/img/tokens/wxtz.png',
          symbolPreference: true
        }
      }
    },
    'KT1Gx5FUi9yxjhivFEYaYd2QyWhTQnXPcwCv': { // MFIL
      kind: 'FA2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Tezos Israel Workshop Certificate',
          symbol: 'MFIL',
          decimals: 0,
          description: 'This certificate verifies that the holder of its private key attended, contributed and completed the Tezos Israel and Madfish Solution Workshop on December 7th to the 9th, 2020. The certificate holder utilized skills in smart contract development and tokenization to build, test and deploy a token on the Tezos blockchain.',
          displayUrl: '../../../assets/img/tokens/mfil.jfif',
          nonTransferable: true,
          booleanAmount: true
        }
      }
    }
  }
};
export const TRUSTED_TOKEN_CONTRACTS = [];