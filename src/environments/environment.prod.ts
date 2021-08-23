import { Constants, DisplayLinkOption } from './../app/interfaces';

export const environment = {
  production: true
};
export const CONSTANTS: Constants = {
  NAME: 'Mainnet',
  // https://gitlab.com/tezos-domains/contracts/-/blob/master/deployed/mainnet.json#L9
  TEZOS_DOMAIN: {
    CONTRACT: 'KT1P8n2qzJjwMPbHJfi4o8xu6Pe3gaU3u2A3',
    TOP_DOMAIN: 'tez'
  },
  NETWORK: 'mainnet',
  MAINNET: true,
  NODE_URL: 'https://mainnet.kukai.network',
  BLOCK_EXPLORER_URL: 'https://tzkt.io',
  ALLOWED_EMBED_ORIGINS: [
    'https://www.truesy.com',
    'https://playwithbrio.com',
    'https://www.playwithbrio.com',
    'https://minterpop.com',
    'https://interpopcomics.com',
    'https://www.interpopcomics.com'
  ],
  HARD_LIMITS: {
    hard_gas_limit_per_operation: 1040000,
    hard_gas_limit_per_block: 5200000,
    hard_storage_limit_per_operation: 60000
  },
  CONTRACT_ALIASES: {
    'hen': {
      name: 'Hic et Nunc (HEN)',
      address: ["KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW", "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton", "KT1M2JnD1wsg7w2B4UXJXtKQPuDUpU2L7cJH"],
      thumbnailUrl: "https://dashboard-assets.dappradar.com/document/7357/hicetnunc-dapp-marketplaces-tezos-logo-166x166_88a66b54787c555ea5237fa002586ae5.png",
      link: "https://www.hicetnunc.xyz/", shouldDisplayLink: DisplayLinkOption.All, category: "marketplaces"
    },
    'QuipuSwap': {
      address: [],
      thumbnailUrl: "https://dashboard-assets.dappradar.com/document/7360/quipuswap-dapp-exchanges-tezos-logo-166x166_f8f472a49e3f3d6b591a13dbd979a857.png",
      link: "https://quipuswap.com/", shouldDisplayLink: DisplayLinkOption.All, category: "exchanges"
    },
    'Minterpop': {
      address: ["KT1AaaBSo5AE6Eo8fpEN5xhCD4w3kHStafxk"],
      thumbnailUrl: "https://minterpop.com/_next/static/images/logo-ac73543744326030947adf91a3dad06c.svg",
      link: "https://minterpop.com/", shouldDisplayLink: DisplayLinkOption.DirectAuth, category: "collectibles"
    },
    'Kalamint': {
      address: ["KT1EpGgjQs73QfFJs9z7m1Mxm5MTnpC2tqse"],
      thumbnailUrl: "https://dashboard-assets.dappradar.com/document/7358/kalamint-dapp-marketplaces-tezos-logo-166x166_3157752c764b72d1e7759b1b005b07d7.png",
      link: "https://kalamint.io/", shouldDisplayLink: DisplayLinkOption.All, category: "marketplaces"
    },
    'InterpopComics': {
      name: 'Interpop Comics',
      address: ["KT1UxMVVrK2pbYYEtwes1zKYdpYnzoZ6yPKC"],
      thumbnailUrl: "https://dev.interpopcomics.com/interpop_logo.png",
      link: "https://interpopcomics.com/", shouldDisplayLink: DisplayLinkOption.DirectAuth, category: "collectibles"
    },
    'Bazaar Market': {
      address: ["KT1PKvHNWuWDNVDtqjDha4AostLrGDu4G1jy"],
      thumbnailUrl: "https://dashboard-assets.dappradar.com/document/7444/bazaarmarket-dapp-marketplaces-tezos-logo-166x166_eeff309690a4abe4d06e78922012d985.png",
      link: "https://bazaarnft.xyz/", shouldDisplayLink: DisplayLinkOption.All, category: "marketplaces"
    },
    'TzColors': {
      address: ["KT1FyaDqiMQWg7Exo7VUiXAgZbd2kCzo3d4s"],
      thumbnailUrl: "https://dashboard-assets.dappradar.com/document/7361/tzcolors-dapp-marketplaces-tezos-logo-166x166_4731835687c8ad06edf1d8c140905e12.png",
      link: "https://www.tzcolors.io/", shouldDisplayLink: DisplayLinkOption.All, category: "collectibles"
    },
    'PixelPotus': {
      name: 'PixelPotus',
      address: ["KT1WGDVRnff4rmGzJUbdCRAJBmYt12BrPzdD"],
      thumbnailUrl: "https://www.pixelpotus.com/img/eagle-right.d1840b0b.png",
      link: "https://www.pixelpotus.com/", shouldDisplayLink: DisplayLinkOption.All, category: "collectibles"
    },
    'SalsaDaoTacoshop': {
      name: 'SalsaDao Tacoshop & Casino',
      address: ["KT1UmxSSUQ5716tRa2RLNSAkiSG6TWbzZ7GL", "KT1JYWuC4eWqYkNC1Sh6BiD89vZzytVoV2Ae", "KT1NvPaecvj8g7SbDs8E5s2jxbEBKHxZssP1", "KT1LhNu3v6rCa3Ura3bompAAJZD9io5VRaWZ", "KT1VHd7ysjnvxEzwtjBAmYAmasvVCfPpSkiG"],
      thumbnailUrl: "https://dashboard-assets.dappradar.com/document/7837/salsadao-dapp-other-tezos-logo-166x166_d4625f93b4fa3858c32b15b36c99617e.png",
      link: "https://tezostaco.shop/#/", shouldDisplayLink: DisplayLinkOption.None, category: "collectibles"
    },
    "Truesy": {
      address: ["KT197APGtQ8mk2svRSpDkqXLzHedRtkJ7Hjr", "KT1CTqQ4vg2zyG1AQmDLVeJ473ueoy2Rw8t1", "KT1QE4nZiAXbpuDCu4P5QTNibQSx6FFW3y2W", "KT1QbzLyzwXB9JTevvjT3B24BzgWfMzFfBHt"],
      thumbnailUrl: "https://wallet.kukai.app/assets/img/spinner/truesy.svg",
      link: "", shouldDisplayLink: DisplayLinkOption.None
    },
    "NBA": {
      address: ["KT1LqKWDtzUh4CXNqfJQMcATv4PdZxBjPJjH"],
      thumbnailUrl: "",
      link: "", shouldDisplayLink: DisplayLinkOption.None
    },
    "BUA": {
      address: ["KT1WN9yWqV9pEm1ANR56ExJZbnVukWN31fTY", "KT1WBXFKW1sozV7ZLBHvw5eks6Pb8KSoVmLq", "KT1KWNNBtb7z8pejNUNigaRWSTkTQL4DEcf8", "KT1D6CNSXcftRTArCF73Jpsh95dwgEwAy6qZ", "KT1R87j2qFxtPZE3EmmeSoubg2mZkk3j4X8y", "KT1HRCc359qXshgMpBygY3VwqTnV7fc7nYfp", "KT1MU8Pb9DFjnVpEULyWDrqPLjedZPNHFrEN", "KT1FPfsRVWVju2mH1r2iFg5jfzWj7RDCb6ia", "KT19AqSn4m3NtvztPXuETjCzoQ75bKDd1Pyi", "KT1PcYxsFmXuoxcJpcfRSCcQQeSDLERSMzsW", "KT1KSYCk8zjdhgzDDRsmb2ygAfanjBx25Wto"],
      thumbnailUrl: "../../../assets/img/tokens/bua.png",
      link: "", shouldDisplayLink: DisplayLinkOption.None
    },
    'OpenMinter': {
      address: ["KT1QcxwB4QyPKfmSwjH1VRxa6kquUjeDWeEy"],
      thumbnailUrl: "https://openminter.com/static/media/header-logo.a9dd48a8.svg",
      link: "", shouldDisplayLink: DisplayLinkOption.None
    },
    'Alchememist': {
      address: ["KT1W4wh1qDc2g22DToaTfnCtALLJ7jHn38Xc", "KT1Em3sjKdHo3Fo9Az4EusZXQbkgsdZHkQkF"],
      thumbnailUrl: "https://cloudflare-ipfs.com/ipfs/QmPmD4kdh8d2fxaHeHy7BTwmcYxhz3eA6nFeGJXHmNnSex",
      link: "https://auctions.alchememist.com/", shouldDisplayLink: DisplayLinkOption.None, category: "collectibles"
    }
  },
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
          displayAsset: '../../../assets/img/tokens/kusd.png',
          thumbnailAsset: '../../../assets/img/tokens/kusd.png',
          shouldPreferSymbol: true,
          status: 1
        }
      }
    },
    'KT1JkoE42rrMBP9b2oDhbx6EUr26GcySZMUH': { // kDAO
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Kolibri DAO',
          symbol: 'kDAO',
          decimals: 18,
          description: '',
          displayAsset: '../../../assets/img/tokens/kdao.png',
          thumbnailAsset: '../../../assets/img/tokens/kdao.png',
          shouldPreferSymbol: true,
          status: 1
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
          displayAsset: '../../../assets/img/tokens/usdtz.png',
          thumbnailAsset: '../../../assets/img/tokens/usdtz.png',
          shouldPreferSymbol: true,
          status: 1
        }
      }
    },
    'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW': { // uUSD
      kind: 'FA2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Youves uUSD',
          symbol: 'uUSD',
          decimals: 12,
          description: '',
          displayAsset: '../../../assets/img/tokens/uusd.png',
          thumbnailAsset: '../../../assets/img/tokens/uusd.png',
          shouldPreferSymbol: true,
          status: 1
        }
      }
    },
    'KT1Xobej4mc6XgEjDoJoHtTKgbD1ELMvcQuL': { // YOU
      kind: 'FA2',
      category: 'finance',
      tokens: {
        0: {
          name: 'youves YOU Governance',
          symbol: 'YOU',
          decimals: 12,
          description: '',
          displayAsset: '../../../assets/img/tokens/you.png',
          thumbnailAsset: '../../../assets/img/tokens/you.png',
          shouldPreferSymbol: true,
          status: 1
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
          displayAsset: '../../../assets/img/tokens/tzbtc.png',
          thumbnailAsset: '../../../assets/img/tokens/tzbtc.png',
          shouldPreferSymbol: true,
          status: 1
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
          displayAsset: '../../../assets/img/tokens/ethtz.png',
          thumbnailAsset: '../../../assets/img/tokens/ethtz.png',
          shouldPreferSymbol: true,
          status: 1
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
          displayAsset: '../../../assets/img/tokens/wxtz.png',
          thumbnailAsset: '../../../assets/img/tokens/wxtz.png',
          shouldPreferSymbol: true,
          status: 1
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
          displayAsset: '../../../assets/img/tokens/mfil.jfif',
          thumbnailAsset: '../../../assets/img/tokens/mfil.jfif',
          isTransferable: false,
          isBooleanAmount: true,
          status: 1
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
          displayAsset: '../../../assets/img/tokens/hdao.png',
          thumbnailAsset: '../../../assets/img/tokens/hdao.png',
          isTransferable: true,
          isBooleanAmount: false,
          shouldPreferSymbol: true,
          status: 1
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
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmSEtUcV9HuvLdcZbyxVK23TNoyCouf5cpsb1JwoWZffeK',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmbxKzdmd9uWT9AYTmzJNDabvRmC916XkqXeuycoHH2dTC',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
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
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmWeiSKjS3tXLemcdRSEV8wZMwpx71kQ9dJcpxo2BmUonh',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmQTTxZ4eveDM65Lu7W2pKv1hGJjbsj66ZBfhPkiKBW3kT',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1JXZPcfEnxswdzYLox1LeALWTkSm1nsdhp': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-126': {
          name: 'ATX Tezos Taco',
          symbol: '',
          decimals: 0,
          description: 'This Taco NFT was inspired by and minted for Austin, Texas on Taco Tuesday, May 4th, 2021, to help push the Clean NFT movement forward. Enjoy your taco or send it to a friend to help spread the word about Clean NFTs on Tezos.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmYbWkagqQyQ4bJhWWWSGaCLNGP1czbPgD2PLmJ4aVmtGR',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmYbWkagqQyQ4bJhWWWSGaCLNGP1czbPgD2PLmJ4aVmtGR',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1QE4nZiAXbpuDCu4P5QTNibQSx6FFW3y2W': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-332': {
          name: 'Fancy Turtle, 2017',
          symbol: '',
          decimals: 0,
          description: 'Turtle wears fancy outfit',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmVbriNfu2Xw1miWadT1zwC8BN36cGHMNBxd3TpzE5tLje',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/Qmat9rrmybBzuYgaVgFQvG9iaKkg96Y5u1EovihGxp9J8H',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1QbzLyzwXB9JTevvjT3B24BzgWfMzFfBHt': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-332': {
          name: 'Dancing Laa-Laa, 2019',
          symbol: '',
          decimals: 0,
          description: 'Laa-Laa dancing',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmZLutyj5jABYvt4ekU1Pq6hCZRBf8C9FwKVeZYHy7Zfv7',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmZLutyj5jABYvt4ekU1Pq6hCZRBf8C9FwKVeZYHy7Zfv7',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1LqKWDtzUh4CXNqfJQMcATv4PdZxBjPJjH': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-332': {
          name: 'Lebrun Jame TopShot Moment, 2021',
          symbol: '',
          decimals: 0,
          description: 'Lebrun dunks on Washington Wizards',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmRHvJRqJYMqbFfoKd1tXYkaxaKJcoao7VijT6yMDM67ud',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmRHvJRqJYMqbFfoKd1tXYkaxaKJcoao7VijT6yMDM67ud',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1WN9yWqV9pEm1ANR56ExJZbnVukWN31fTY': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-4': {
          name: 'Starry Serenade',
          symbol: '',
          decimals: 0,
          description: 'The stars and sky dance in the tempestuous night. El Guitarrista joins in the nocturnal symphony of the cosmos. He plays, the sky dances—a dalliance that lasts until the dawn.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmNym5CYDeSTneeL9oSzcGZ5QfUzYjPv97EYpK92LneNav',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmTaWdJxu8vaqgr3XAJ92TsX6d6aPpxo6qjyANNedMX4vK',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1WBXFKW1sozV7ZLBHvw5eks6Pb8KSoVmLq': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-1': {
          name: 'Dynamic Starry Serenade',
          symbol: '',
          decimals: 0,
          description: 'The stars and sky dance in the tempestuous night. El Guitarrista joins in the nocturnal symphony of the cosmos. He plays, the sky dances—a dalliance that lasts until the dawn.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmTaWdJxu8vaqgr3XAJ92TsX6d6aPpxo6qjyANNedMX4vK',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmTaWdJxu8vaqgr3XAJ92TsX6d6aPpxo6qjyANNedMX4vK',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1KWNNBtb7z8pejNUNigaRWSTkTQL4DEcf8': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-4': {
          name: 'Piano Man II',
          symbol: '',
          decimals: 0,
          description: 'The Piano Man, hypnotized in atmospheric space, ensconced in smoke, translates emotions musically—melancholy, sorrow, passion, and love. We see him through the lens of our own fleshly perceptions. He is a reflection, a mirror, a teacher…',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmUceK52RXegM9Uj1KrojSdmaiDvSNPG4cwrrQNHP7FrGp',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmXk9udjsm4ErhpBPv4W3tX8q7Zm7m6NiKVcBaztdCV3Xs',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1D6CNSXcftRTArCF73Jpsh95dwgEwAy6qZ': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-1': {
          name: 'Dynamic Piano Man II',
          symbol: '',
          decimals: 0,
          description: 'The Piano Man, hypnotized in atmospheric space, ensconced in smoke, translates emotions musically—melancholy, sorrow, passion, and love. We see him through the lens of our own fleshly perceptions. He is a reflection, a mirror, a teacher…',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmXk9udjsm4ErhpBPv4W3tX8q7Zm7m6NiKVcBaztdCV3Xs',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmXk9udjsm4ErhpBPv4W3tX8q7Zm7m6NiKVcBaztdCV3Xs',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1R87j2qFxtPZE3EmmeSoubg2mZkk3j4X8y': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-4': {
          name: 'DJ Mona Lisa',
          symbol: '',
          decimals: 0,
          description: "DJ MONA LISA is the amalgamation of one of the most recognizable images from 15th century Florence, blended and mixed with BUA’s classic, iconographic pop culture DJ painting. Her flirtatious smile might make you wonder what DJ Mona is mixing up on the 1's & 2's.",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmQTdKE183LWB33VmJQPEZMtEGg3JMFF2dgtLfezgUANeq',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmQzfvT6tPTdECds6Q11NpYcAf9pcjUHqmCBZ9NDjJMotM',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1HRCc359qXshgMpBygY3VwqTnV7fc7nYfp': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-1': {
          name: 'Dynamic DJ Mona Lisa',
          symbol: '',
          decimals: 0,
          description: "DJ MONA LISA is the amalgamation of one of the most recognizable images from 15th century Florence, blended and mixed with BUA’s classic, iconographic pop culture DJ painting. Her flirtatious smile might make you wonder what DJ Mona is mixing up on the 1's & 2's.",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmQzfvT6tPTdECds6Q11NpYcAf9pcjUHqmCBZ9NDjJMotM',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmQzfvT6tPTdECds6Q11NpYcAf9pcjUHqmCBZ9NDjJMotM',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1MU8Pb9DFjnVpEULyWDrqPLjedZPNHFrEN': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-4': {
          name: 'The Block',
          symbol: '',
          decimals: 0,
          description: 'The Block is a home we all belong to. A place to come where warmth embraces and the light is always on. The birds and brownstones syncopate with the urban landscape, indicative of the unspoken language between the wild and tamed on The Block.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmVvFrcxoJjbtAJVxoLhvHxnG1jdAc5E69Lp6a42A3VFfS',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmRAWffkFZdeLFWmLoVuLqTqW3D8yq4hPZroGfGkLDd6Dz',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1FPfsRVWVju2mH1r2iFg5jfzWj7RDCb6ia': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-1': {
          name: 'Dynamic The Block',
          symbol: '',
          decimals: 0,
          description: 'The Block is a home we all belong to. A place to come where warmth embraces and the light is always on. The birds and brownstones syncopate with the urban landscape, indicative of the unspoken language between the wild and tamed on The Block.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmRAWffkFZdeLFWmLoVuLqTqW3D8yq4hPZroGfGkLDd6Dz',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmRAWffkFZdeLFWmLoVuLqTqW3D8yq4hPZroGfGkLDd6Dz',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT19AqSn4m3NtvztPXuETjCzoQ75bKDd1Pyi': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-4': {
          name: 'Trumpet Man',
          symbol: '',
          decimals: 0,
          description: 'A year ago the world stopped. Trumpet Man cries and mourns for the city he belongs to.  Trumpet man’s musical notes give us hope.  He delicately conducts his magic in an architectural symphony. The coolness of the monochromatic palette is complemented by the warm yellow windows that illuminate his horn.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmemuQ5X6stcbFQgR79rjBU3oxbzRGLgjMiehSh244c5kM',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmUZNJ3Ez4QZfyEkpKHK4BwQj5jskuvt3pfJRsQSskyW2G',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1PcYxsFmXuoxcJpcfRSCcQQeSDLERSMzsW': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-1': {
          name: 'Dynamic Trumpet Man',
          symbol: '',
          decimals: 0,
          description: 'A year ago the world stopped. Trumpet Man cries and mourns for the city he belongs to.  Trumpet man’s musical notes give us hope.  He delicately conducts his magic in an architectural symphony. The coolness of the monochromatic palette is complemented by the warm yellow windows that illuminate his horn.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmUZNJ3Ez4QZfyEkpKHK4BwQj5jskuvt3pfJRsQSskyW2G',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmUZNJ3Ez4QZfyEkpKHK4BwQj5jskuvt3pfJRsQSskyW2G',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1KSYCk8zjdhgzDDRsmb2ygAfanjBx25Wto': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Dynamic DJ Mona Lisa AP',
          symbol: '',
          decimals: 0,
          description: "DJ MONA LISA is the amalgamation of one of the most recognizable images from 15th century Florence, blended and mixed with BUA’s classic, iconographic pop culture DJ painting. Her flirtatious smile might make you wonder what DJ Mona is mixing up on the 1's & 2's.",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmQzfvT6tPTdECds6Q11NpYcAf9pcjUHqmCBZ9NDjJMotM',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmQzfvT6tPTdECds6Q11NpYcAf9pcjUHqmCBZ9NDjJMotM',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1KJNPUsHrjhN9iUJMz7DL3WkTcibhGrxse': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-23': {
          name: 'Gerbil Abloh',
          symbol: '',
          decimals: 0,
          description: "",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmTdRF1uNMQhkHqqrQstiwtZzfsUd39wMUzqCTJSQmE8ef',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmXATeW5cS1dMHymiHay1HQrhrixSRuAVjPedB2nYg3cAq',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1AGcbS4TyquQjQsa4fwce3FjLZv2UpGMse': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-49': {
          name: 'I Believe in Goddess voice memo demo 1',
          symbol: '',
          decimals: 0,
          description: "It’s hard to tell this is even the same song. The first time I heard this, I didn’t know what song it was. Then I heard the second version and figured it out. Oh, and the bridge at the end…. What the hell was I thinking?",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/Qmauf5qn3gq8dTpQZNVT6iruzuYuAscp7ns2bg6Pe39wdp',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/Qmauf5qn3gq8dTpQZNVT6iruzuYuAscp7ns2bg6Pe39wdp',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1RbCvEFWCJXUswKxWrH9wxgu88hMm8YEZz': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-49': {
          name: 'Total Bummer full band demo',
          symbol: '',
          decimals: 0,
          description: "from the Pump Up the Valuum demo collection. Recorded in 1999. What’s cool about this version is that there’s an octave chord part that we never put on the album. The sound isn’t that great, but Smelly rips and Mel’s octaves are really cool. My vocals…… ugh… Photo by Lisa Johnson",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmdyEUPQZnF8XKoxAGtidUgLz4AMtBSLFGo7MV3C5r1hsY',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmdyEUPQZnF8XKoxAGtidUgLz4AMtBSLFGo7MV3C5r1hsY',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1Gba7KnVXB563kxmk4mgKUQ4ujP8yFbQfr': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-27': {
          name: 'Herojuana cassette demo',
          symbol: '',
          decimals: 0,
          description: "I wrote this in 1999 and clearly I couldn’t decide if it was going to be a fast song or a slow song. I don’t know what the hell I was singing about either. Just place holder lyrics, but I think they sound kind of sweet. I think it would have been better slow…. Oh well. Photo by Krousky.",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmeoazGDgUdykHWWVG99bd1ifVUzpVq6wZcrv7toLbehqM',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmeoazGDgUdykHWWVG99bd1ifVUzpVq6wZcrv7toLbehqM',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1UQaoRqLgFvsTwprgsGXj84DT9Wm5jC7tY': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-49': {
          name: 'I Believe in Goddess full band demo',
          symbol: '',
          decimals: 0,
          description: "",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmWFUrVwyexUcNPsCgQriHLZ4ea5oXBomjyddrcRxJJeqC',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmWFUrVwyexUcNPsCgQriHLZ4ea5oXBomjyddrcRxJJeqC',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1K1vBSP5MyKfBBpyHEjmCHTuYeugid4Tqn': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-49': {
          name: 'I Believe in Goddess voice memo demo 3',
          symbol: '',
          decimals: 0,
          description: "",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmSsRt6PXMii8uCC6mNhMHfcwPuYJEDtK7JG5avEuJypTz',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmSsRt6PXMii8uCC6mNhMHfcwPuYJEDtK7JG5avEuJypTz',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1FCCDtoG71hJb4KiUegpCqGr1GDG3YyY7g': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-49': {
          name: 'I Believe in Goddess voice memo demo 2',
          symbol: '',
          decimals: 0,
          description: "Recorded in 2009- What is the deal with me and that lame bridge. Stop it! At least I got a better hold on the verse, and I started to write the cool guitar riff. I actually wish I would of kept the rhythm at 2:20. Whoops. Photo by Jonathon Weiner",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmcU5pmCwcwvHaArZLaabF5PTnbqpCoUr67ywgga796rAU',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmcU5pmCwcwvHaArZLaabF5PTnbqpCoUr67ywgga796rAU',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1CGHpbtxvPRX6HF4mVQo48Rb5z2aYVnvB6': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-99': {
          name: 'Underground Soul',
          symbol: '',
          decimals: 0,
          description: "This NFT was created to share our love of travel, and how music has been the catalyst for us to explore mother earth, enabling us to give back and serve the communities on our journey. The sights and sounds and people and colors we encounter when we travel and how it connects us and brings us together.\nCreated by the Room Service International (RSI) team, Rahmi Halaby & Julio Galvez, exclusively for Truesy. Photography by Rahmi Halaby, Joshua Lang, TESIBE and The Whooligan.\nMusic: Humanity’s Universal Language\nMusic produced by The Whooligan.",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmavbVoEMaNGrkCxG1Eem1JMoE4A7zw5zN6z7mJd3EpQun',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmavbVoEMaNGrkCxG1Eem1JMoE4A7zw5zN6z7mJd3EpQun',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1WAxpXZ8hvyoXy47YogdNURArGkFy4k3To': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-1': {
          name: 'in bloom',
          symbol: '',
          decimals: 0,
          description: "I had a pretty intense year both personally and artistically, something between dream and frenzy. Things I was expecting for a long time happened suddenly and I feel like everything is blooming right now. It’s funny because the artwork itself is blooming while you’re watching it.",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmaN5STTo5TS5ittfMVFPmQSsS3z4JdNQfpMJNJtsCNsYZ',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmaN5STTo5TS5ittfMVFPmQSsS3z4JdNQfpMJNJtsCNsYZ',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1LfsA9WzzGX7jkhovSTVnZZoBQQNcpvatQ': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-2': {
          name: 'The Dancer',
          symbol: '',
          decimals: 0,
          description: "From an early age, I was exposed to ballet. My mother would bring me to the studio and I would sit and watch in awe as the dancers practiced for hours upon hours.\nI was taken by the beauty of the female body, the movements, balance, and more than anything, the commitment it takes to be a successful ballerina. I also saw the frustration, tears, anxiety, joy and many other emotions that are displayed backstage.\nA recurring theme in this work parallels the social media era we are living in today. Just like the ballerinas who hide the pain, anxiety, and tears on stage, many people portray a perfect life on social media, but behind closed doors, are dealing with life’s issues.\nThe Dancer is a celebration of women, their strength, perseverance, and beauty, reinforces the idea of hard work and dedication, and serves as a constant reminder to spread love and be there for the ones you love, as you don’t always know what’s going on backstage.",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmcLELkXz39Sqrn1wHMasbDygjxTvuB44Zqpg9ubnrWP9M',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmcLELkXz39Sqrn1wHMasbDygjxTvuB44Zqpg9ubnrWP9M',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1PvfewvyW7zxWHSHCivkeJRFyrHNjE3xDr': {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0': {
          name: 'Welcome to Miami',
          symbol: '',
          decimals: 0,
          description: "This piece was the first time I painted something inspired by the city that I’ve called home for my whole life. Miami. \nWhen I was considering the composition for this piece, I kept coming back to that famous saying, “the whole is greater than the sum of its parts.”\nSo if you asked me, what makes Miami, “Miami”? It’s the Miami skyline. It’s the palm trees that line the streets. It’s the boats parked on the dock. It’s the lifeguard towers spread along the beaches. It’s the ocean’s waves. And it’s the weather. The bipolar weather represented in the woman carrying an umbrella. First it’s sunny, then it rains, then it’s sunny again.\nMiami wouldn’t be “Miami” without all these features incorporated together that make up the vibrant city that it is. And so much more.",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmPfQcyyjqAATqjtpVH9YCUxKH8fasUYZGoaSR4BwyMiu5',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmPfQcyyjqAATqjtpVH9YCUxKH8fasUYZGoaSR4BwyMiu5',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    'KT1BA9igcUcgkMT4LEEQzwURsdMpQayfb6i4': {
      kind: 'FA2',
      category: '',
      tokens: {
        66: {
          name: 'The Non-Friendly Turtle #2',
          symbol: 'Tezos',
          decimals: 0,
          description: 'NFTs are changing everything...but what exactly is an NFT? A Non-Friendly Turtle? Discover how Tezos is changing NFTs, and collect your own at Tezos.com/NFTgallery.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmTmSjweqQrba5WGRUxB4u5WEbwktQBQekioi9K7Kkos6x',
          thumbnailAsset: '../../../assets/img/question-mark.svg',
          isBooleanAmount: false,
          isTransferable: true,
          shouldPreferSymbol: false,
          status: 1
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
  },
  NFT_CONTRACT_OVERRIDES: [
    "KT1AafHA1C1vk959wvHWBispY9Y2f3fxBUUo:0"//lp tzBTC
  ]
};
export const TRUSTED_TOKEN_CONTRACTS = [
  'KT1Em3sjKdHo3Fo9Az4EusZXQbkgsdZHkQkF',
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',//hicetnunc
  'KT1M2JnD1wsg7w2B4UXJXtKQPuDUpU2L7cJH',//hicetnunc-legacy
  'KT1W4wh1qDc2g22DToaTfnCtALLJ7jHn38Xc',//alchememist
  'KT1EH8yKXkRoxNkULRB1dSuwhkKyi5LJH82o',//mandala
  'KT1DKBvxiwDR7qazNuuxCxY2AaXnoytmDE7H',//Mandala v2
  'KT1UxMVVrK2pbYYEtwes1zKYdpYnzoZ6yPKC',//Comic app
  'KT1AaaBSo5AE6Eo8fpEN5xhCD4w3kHStafxk',//Minterpop
  'KT1EpGgjQs73QfFJs9z7m1Mxm5MTnpC2tqse',//Kalamint NFT
  'KT1A5P4ejnLix13jtadsfV9GCnXLMNnab8UT',//Kalamint token
  'KT1ViVwoVfGSCsDaxjwoovejm1aYSGz7s2TZ',//Teztopia
  'KT1BA9igcUcgkMT4LEEQzwURsdMpQayfb6i4',//turtle
  'KT1PKvHNWuWDNVDtqjDha4AostLrGDu4G1jy',//Bazaar Market
  'KT1WGDVRnff4rmGzJUbdCRAJBmYt12BrPzdD',//PixelPotus
  'KT1FyaDqiMQWg7Exo7VUiXAgZbd2kCzo3d4s',//TzColors
  'KT1EVXyKLk4MSAfsSqyLVSTsRHYG9fXFHnwe',//Uanon 1
  'KT1SFDJHTVMnfvc72E4vUt4Rpy9xvGKt1xSw',//Uanon 2
  'KT1UmxSSUQ5716tRa2RLNSAkiSG6TWbzZ7GL',//SalsaDao Tacos 2
  'KT1JYWuC4eWqYkNC1Sh6BiD89vZzytVoV2Ae',//SalsaDao Tacos 3
  'KT1NvPaecvj8g7SbDs8E5s2jxbEBKHxZssP1',//SalsaDao BuildTaco
];
export const BLACKLISTED_TOKEN_CONTRACTS = []