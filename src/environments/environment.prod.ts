import { Constants } from './../app/interfaces';

export const environment = {
  production: true
};
export const CONSTANTS: Constants = {
  NAME: 'Mainnet',
  NETWORK: 'mainnet',
  MAINNET: true,
  NODE_URL: 'https://kukai-mainnet.tez.ie',
  BLOCK_EXPLORER_URL: 'https://tzkt.io',
  ASSETS: {
    'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV': { // kUSD
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
          thumbnailUrl: '../../../assets/img/tokens/usdtz.png',
          shouldPreferSymbol: true
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
          thumbnailUrl: '../../../assets/img/tokens/tzbtc.png',
          shouldPreferSymbol: true
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
          thumbnailUrl: '../../../assets/img/tokens/ethtz.png',
          shouldPreferSymbol: true
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
          thumbnailUrl: '../../../assets/img/tokens/wxtz.png',
          shouldPreferSymbol: true
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
          thumbnailUrl: '../../../assets/img/tokens/mfil.jfif',
          isTransferable: false,
          isBooleanAmount: true
        }
      }
    },
    'KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW': { // hDAO
      kind: 'FA2',
      category: 'finance',
      tokens: {
        0: {
          name: 'hic et nunc DAO',
          symbol: 'hDAO',
          decimals: 6,
          description: '',
          displayUrl: '../../../assets/img/tokens/hdao.png',
          thumbnailUrl: '../../../assets/img/tokens/hdao.png',
          isTransferable: true,
          isBooleanAmount: false,
          shouldPreferSymbol: true
        }
      }
    },
    'KT197APGtQ8mk2svRSpDkqXLzHedRtkJ7Hjr': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-9': {
          name: 'Goated: Die Ideale',
          symbol: '',
          decimals: 0,
          description: 'A recreation of Die Ideale by Piet Mondrian painted with brush strokes of gemstones and precious metals. The work comprises various iconic jewelry styles and pieces from diamond tennis chains, loose gemstones, timepieces and rope chains among numerous others. The work was assembled and designed by artist Rachel Goatlely in partnership with Greg Yüna who crafted and designed the jewelry pieces used.',
          displayUrl: 'https://cloudflare-ipfs.com/ipfs/QmSEtUcV9HuvLdcZbyxVK23TNoyCouf5cpsb1JwoWZffeK',
          thumbnailUrl: 'https://cloudflare-ipfs.com/ipfs/QmbxKzdmd9uWT9AYTmzJNDabvRmC916XkqXeuycoHH2dTC',
          shouldPreferSymbol: false,
          isBooleanAmount: true
        }
      }
    },
    'KT1CTqQ4vg2zyG1AQmDLVeJ473ueoy2Rw8t1': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-9': {
          name: 'Goated: The Kiss',
          symbol: '',
          decimals: 0,
          description: 'A recreation of The Kiss by Gustav Klimt painted with brush strokes of gemstones and precious metals. The work comprises various iconic jewelry styles and pieces from diamond tennis chains, loose gemstones, timepieces and rope chains among numerous others. The work was assembled and designed by artist Rachel Goatlely in partnership with Greg Yüna who crafted and designed the jewelry pieces used.',
          displayUrl: 'https://cloudflare-ipfs.com/ipfs/QmWeiSKjS3tXLemcdRSEV8wZMwpx71kQ9dJcpxo2BmUonh',
          thumbnailUrl: 'https://cloudflare-ipfs.com/ipfs/QmQTTxZ4eveDM65Lu7W2pKv1hGJjbsj66ZBfhPkiKBW3kT',
          shouldPreferSymbol: false,
          isBooleanAmount: true
        }
      }
    }
  },
  CONTRACT_OVERRIDES: {
    // hice et nunc
    'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9:mint_OBJKT': { storageUsage: 308 },
    'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9:swap': { storageUsage: 180 },
    'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9:curate': { storageUsage: 100 },
    'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9:collect': { storageUsage: 212 },
  }
};
export const TRUSTED_TOKEN_CONTRACTS = [
  'KT1Em3sjKdHo3Fo9Az4EusZXQbkgsdZHkQkF',
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',//hicetnunc
  'KT1M2JnD1wsg7w2B4UXJXtKQPuDUpU2L7cJH',//hicetnunc-legacy
  'KT1W4wh1qDc2g22DToaTfnCtALLJ7jHn38Xc',//alchememist
  'KT1EH8yKXkRoxNkULRB1dSuwhkKyi5LJH82o',//mandala
  'KT1DKBvxiwDR7qazNuuxCxY2AaXnoytmDE7H',//Mandala v2
];