import { Constants, DisplayLinkOption } from './../app/interfaces';

export const environment = {
  production: false
};
const _CONSTANTS: Constants = {
  NAME: 'Mainnet',
  // https://gitlab.com/tezos-domains/contracts/-/blob/master/deployed/mainnet.json#L9
  TEZOS_DOMAIN: {
    CONTRACT: 'KT1P8n2qzJjwMPbHJfi4o8xu6Pe3gaU3u2A3',
    TOP_DOMAINS: ['tez', 'xyz']
  },
  NETWORK: 'mainnet',
  MAINNET: true,
  NODE_URL: 'https://mainnet.kukai.network',
  API_URL: 'https://kukai.api.tzkt.io/v1',
  OBJKT_URL: 'https://data.objkt.com/v3/graphql',
  BLOCK_EXPLORER_URL: 'https://tzkt.io',
  HARD_LIMITS: {
    hard_gas_limit_per_operation: 1040000,
    hard_gas_limit_per_block: 5200000,
    hard_storage_limit_per_operation: 60000
  },
  CONTRACT_ALIASES: {
    xanadu: {
      name: 'Xanadu NFT Gallery',
      address: ['KT1D5o5b7dTGVe2z5mpUdWR9hWKDs8zbhtzA'],
      thumbnailUrl: 'assets/img/alias/xanadu-nft-gallery.jpg',
      discoverUrl: 'assets/img/alias/xanadu-nft-discover.jpg',
      zoomDiscoverImg: true,
      link: 'https://info.xanadu.asia/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['art'],
      description: 'Works of art minted and displayed in Xanadu NFT Gallery'
    },
	manutd: {
      name: 'Manchester United',
      address: ['KT1V7QCmuKpGsThwCNRALmsVfDAYopV98EEL'],
      thumbnailUrl: 'assets/img/alias/mufc.png',
      discoverUrl: 'assets/img/alias/mufc-discover.jpg',
      zoomDiscoverImg: true,
      link: 'http://collectibles.manutd.com',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['sports', 'collectibles'],
      description: 'Officially licensed Digital Collectibles, powered by Tezos'
    },
    EmergentsTCG: {
      name: 'Emergents TCG',
      address: ['KT1QuEhDNh51R8ERiCSh2VE1DjVPPgFrGMja'],
      thumbnailUrl: 'assets/img/alias/emergents.svg',
      discoverUrl: 'assets/img/alias/emergents-discover.png',
      link: 'https://minterpop.com/emergentstcg',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['games', 'collectibles'],
      zoomDiscoverImg: true,
      description: 'A next-gen superhero trading card game'
    },
    dogami: {
      name: 'Dogamí',
      address: ['KT1NVvPsNDChrLRH5K2cy6Sc9r1uuUwdiZQd', 'KT1SnUZLQ4gVrQeapUvp6GY9UKKb4gAZJ8D9', 'KT1CAbPGHUWvkSA9bxMPkqSgabgsjtmRYEda'],
      thumbnailUrl: 'assets/img/alias/dogami-thumbnail.png',
      discoverUrl: 'assets/img/alias/dogami-discover.png',
      link: 'https://dogami.com',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['games', 'collectibles'],
      zoomDiscoverImg: true,
      description: 'Raise unique virtual NFT avatars on mobile'
    },
    gap: {
      name: 'Gap Threads',
      address: ['KT1GA6KaLWpURnjvmnxB4wToErzM2EXHqrMo'],
      thumbnailUrl: 'assets/img/alias/gap_600x600.png',
      discoverUrl: 'assets/img/alias/gap-discover.svg',
      link: 'https://www.gap.com/nft',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['collectibles'],
      backgroundColor: 'black',
      description: 'A fun and interactive digital collectible experience'
    },
    fxhash: {
      name: 'fxhash',
      address: ['KT1KEa8z6vWXDJrVqtMrAeDVzsvxat3kHaCE', 'KT1U6EHmNxJTkvaWJ4ThczG4FSDaHC21ssvi'],
      thumbnailUrl: '../../../assets/img/alias/fxhash.svg',
      discoverUrl: '../../../assets/img/alias/fxhash-discover.jpg',
      link: 'https://www.fxhash.xyz',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['marketplace'],
      backgroundColor: 'black',
      zoomDiscoverImg: true,
      description: 'Open generative art NFT platform on Tezos'
    },
    UbisoftQuartz: {
      name: 'Ubisoft Quartz',
      address: ['KT1TnVQhjxeNvLutGvzwZvYtC7vKRpwPWhc6'],
      thumbnailUrl: 'assets/img/alias/Kukai-UbisoftQuartz-ProfilPic-white-thumbnail.png',
      discoverUrl: 'assets/img/alias/logoquartz-h-white-color-beta-discover.svg',
      link: 'https://quartz.ubisoft.com/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['games', 'collectibles'],
      backgroundColor: 'black',
      description: 'The first Ubisoft NFTs playable in a HD game'
    },
    mooncakes: {
      name: 'Mooncakes',
      address: ['KT1Qm7MHmbdiBzoRs7xqBiqoRxw7T2cxTTJN', 'KT1CzVSa18hndYupV9NcXy3Qj7p8YFDZKVQv'],
      thumbnailUrl: '../../../assets/img/alias/mooncakes.svg',
      discoverUrl: '../../../assets/img/alias/mooncakes-discover.jpg',
      zoomDiscoverImg: true,
      link: 'https://mooncakes.fun',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['collectibles'],
      backgroundColor: '#1C1C20',
      description: 'Have fun exploring a galaxy of NFTs'
    },
    vitality: {
      name: 'V.Hive by Vitality',
      address: [
        'KT1L6BTeGP5NcVmRjys85EaDxBymxMyx5rj8',
        'KT1MxZTs3QrWffkGCLrkw8hVXxBiSbqo3JZn',
        'KT1NpS5Kfn4foSj2rKDwYraFHADq8eNuxpQS',
        'KT1G5ph5ybHBbAy2hEd5RbPTuGEQuWXMWsBB',
        'KT1HVzCL4e4F4f4pRwxG9ye9oo85YB6t7cmd'
      ],
      thumbnailUrl: '../../../assets/img/alias/vitality.png',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None
    },
    mclarenracing: {
      name: 'McLaren Racing Collective',
      address: ['KT1PEGqt5rMmHpyaMXc8RFTFkkAUDrzSFRWk'],
      thumbnailUrl: '../../../assets/img/alias/mclaren-thumbnail.png',
      discoverUrl: '../../../assets/img/alias/mclaren-discover.png',
      link: 'https://mclarenracingcollective.com',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['collectibles'],
      description: 'Collect & Build a digital MCL35M F1 CAR',
      backgroundColor: 'black'
    },
    OneOf: {
      name: 'OneOf',
      address: ['KT1Up463qVJqtW5KF7dQZz5SsWMiS32GtBrw'],
      thumbnailUrl: '../../../assets/img/alias/oneof.png',
      discoverUrl: '../../../assets/img/alias/oneof-discover.svg',
      link: 'https://www.oneof.com/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['music', 'collectibles'],
      backgroundColor: '#000',
      description: 'A green NFT platform for the music community'
    },
    Verses: {
      name: 'Verses',
      address: ['KT1Qi93pZoig6grMNBd7GGA7fveE2cxQK9Ei'],
      thumbnailUrl: '../../../assets/img/alias/verses.png',
      discoverUrl: '../../../assets/img/alias/verses-discover.png',
      link: 'https://minterpop.com/?fa2=Verses',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['games', 'collectibles'],
      description: 'Collect the Art. Play the Game.'
    },
    ZIGGURATS: {
      name: 'ZIGGURATS',
      address: ['KT1PNcZQkJXMQ2Mg92HG1kyrcu3auFX5pfd8'],
      thumbnailUrl: 'assets/img/alias/ziggurats.png',
      discoverUrl: 'assets/img/alias/ziggurats-discover.png',
      link: 'https://ziggurats.xyz',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['collectibles'],
      backgroundColor: '#000',
      description: 'Generative mixtape + art by Mike Shinoda'
    },
    randomlycommonskeles: {
      name: 'randomly common skeles',
      address: ['KT1HZVd9Cjc2CMe3sQvXgbxhpJkdena21pih'],
      thumbnailUrl: 'assets/img/alias/commonskeles.jpg',
      discoverUrl: 'assets/img/alias/skele-grid-discover.jpg',
      zoomDiscoverImg: true,
      link: 'https://objkt.com/collection/rcs',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['collectibles'],
      description: 'randomly generated skeleton .gifs by john karel : )'
    },
    hen: {
      name: 'Hic et Nunc (HEN)',
      address: ['KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW', 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton', 'KT1M2JnD1wsg7w2B4UXJXtKQPuDUpU2L7cJH'],
      thumbnailUrl: '../../../assets/img/alias/hen.png',
      discoverUrl: '../../../assets/img/alias/hen.svg',
      link: 'https://teia.art',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['marketplace'],
      backgroundColor: 'black',
      description: 'Largest independent artist-friendly NFT Marketplace'
    },
    QuipuSwap: {
      name: 'QuipuSwap',
      address: [],
      thumbnailUrl: '../../../assets/img/alias/quipuswap_logo.jpeg',
      discoverUrl: '../../../assets/img/alias/quipuswap-discover.jpeg',
      link: 'https://quipuswap.com/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['exchange'],
      backgroundColor: '#222d47',
      description: 'A decentralized exchange on Tezos'
    },
    Objkt: {
      name: 'objkt.com',
      address: [],
      thumbnailUrl: '../../../assets/img/alias/objktcom.svg',
      discoverUrl: '../../../assets/img/alias/objktcom.svg',
      link: 'https://objkt.com/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['marketplace'],
      description: 'The best Tezos NFTs all in one place'
    },
    MinterPop: {
      name: 'Minter Pop',
      address: ['KT1AaaBSo5AE6Eo8fpEN5xhCD4w3kHStafxk'],
      thumbnailUrl: '../../../assets/img/alias/minterpop.svg',
      discoverUrl: '../../../assets/img/alias/minterpop-discover.png',
      link: 'https://minterpop.com/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['collectibles'],
      description: 'Curated NFT art and collectibles marketplace'
    },
    TezosDomains: {
      name: 'Tezos Domains',
      address: ['KT1GBZmSxmnKJXGMdMLbugPfLyUPmuLSMwKS'],
      thumbnailUrl: '../../../assets/img/domain-logo.svg',
      discoverUrl: '../../../assets/img/alias/tezosdomains-discover.png',
      link: 'https://tezos.domains/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['identity'],
      description: 'Friendly names on Tezos',
      backgroundColor: '#f1f4f8'
    },
    InterpopComics: {
      name: 'Interpop Comics',
      address: ['KT1UxMVVrK2pbYYEtwes1zKYdpYnzoZ6yPKC'],
      thumbnailUrl: '../../../assets/img/alias/interpop.svg',
      discoverUrl: '../../../assets/img/alias/interpop-discover.png',
      link: 'https://interpopcomics.com/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['collectibles'],
      description: 'Digitally native comics as NFTs',
      backgroundColor: '#5f8394'
    },
    Kalamint: {
      name: 'Kalamint',
      address: ['KT1EpGgjQs73QfFJs9z7m1Mxm5MTnpC2tqse'],
      thumbnailUrl: '../../../assets/img/alias/kalamint-thumbnail.png',
      discoverUrl: '../../../assets/img/alias/kalamint.svg',
      link: 'https://kalamint.io/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['marketplace'],
      backgroundColor: '#0ab688',
      description: 'Create, sell and collect NFTs'
    },
    PixelPotus: {
      name: 'PixelPotus',
      address: ['KT1WGDVRnff4rmGzJUbdCRAJBmYt12BrPzdD'],
      thumbnailUrl: '../../../assets/img/alias/pixelpotus.png',
      link: 'https://www.pixelpotus.com/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['game', 'collectibles'],
      description: 'Collectibles game with FREE daily NFTs',
      backgroundColor: '#c7b299'
    },
    TzColors: {
      name: 'Tz Colors',
      address: ['KT1FyaDqiMQWg7Exo7VUiXAgZbd2kCzo3d4s'],
      thumbnailUrl: '../../../assets/img/alias/tzcolors.png',
      link: 'https://www.tzcolors.io/',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['collectibles'],
      description: 'Unique colors as NFT tokens on Tezos'
    },
    Tezotopia: {
      name: 'Tezotopia',
      address: ['KT1ViVwoVfGSCsDaxjwoovejm1aYSGz7s2TZ'],
      thumbnailUrl: '../../../assets/img/alias/tezotopia.png',
      discoverUrl: '../../../assets/img/alias/tezotopia-discover.png',
      link: 'https://app.tezotopia.com/marketplace/artifacts',
      shouldDisplayLink: DisplayLinkOption.All,
      category: ['game', 'collectibles'],
      description: 'Battle, earn, win prizes plus NFT yield farming'
    },
    Diplomats: {
      name: 'Diplomats of Tezotopia',
      address: ['KT1BqfEQFrfx3h2wWQo7gTM1SE6FpH1Y5pqK'],
      thumbnailUrl: '../../../assets/img/alias/diplomats.png',
      link: 'https://gallery.diplomats.tezotopia.com/',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['game', 'collectibles'],
      description:
        'Diplomats of Tezotopia are more than a simple PFP collectible, these representatives unlock the ability to perform various diplomatic actions in the game.'
    },
    'Bazaar Market': {
      name: 'Bazaar Market',
      address: ['KT1PKvHNWuWDNVDtqjDha4AostLrGDu4G1jy'],
      thumbnailUrl: '../../../assets/img/alias/bazaar.png',
      backgroundColor: '#4a9fd5',
      discoverUrl: '../../../assets/img/alias/bazaar.svg',
      link: 'https://bazaarnft.xyz/',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['marketplace'],
      description: 'Create and mint NFTs guilt-free'
    },
    TezosCampaigns: {
      name: 'Tezos Campaigns',
      address: ['KT1BA9igcUcgkMT4LEEQzwURsdMpQayfb6i4', 'KT1JXZPcfEnxswdzYLox1LeALWTkSm1nsdhp'],
      thumbnailUrl: '../../../assets/img/alias/tezos-campaigns-thumbnail.jpeg',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles']
    },
    Alchememist: {
      name: 'Alchememist',
      address: ['KT1W4wh1qDc2g22DToaTfnCtALLJ7jHn38Xc', 'KT1Em3sjKdHo3Fo9Az4EusZXQbkgsdZHkQkF'],
      thumbnailUrl: '../../../assets/img/alias/alchememist.jfif',
      link: 'https://auctions.alchememist.com/',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles']
    },
    SalsaDaoTacoshop: {
      name: 'SalsaDao Tacoshop & Casino',
      address: [
        'KT1UmxSSUQ5716tRa2RLNSAkiSG6TWbzZ7GL',
        'KT1JYWuC4eWqYkNC1Sh6BiD89vZzytVoV2Ae',
        'KT1NvPaecvj8g7SbDs8E5s2jxbEBKHxZssP1',
        'KT1LhNu3v6rCa3Ura3bompAAJZD9io5VRaWZ',
        'KT1VHd7ysjnvxEzwtjBAmYAmasvVCfPpSkiG'
      ],
      thumbnailUrl: '../../../assets/img/alias/salsadao.png',
      link: 'https://tezostaco.shop/#/',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles']
    },
    Truesy: {
      name: 'Truesy',
      address: [
        'KT1PvfewvyW7zxWHSHCivkeJRFyrHNjE3xDr',
        'KT1LfsA9WzzGX7jkhovSTVnZZoBQQNcpvatQ',
        'KT1WAxpXZ8hvyoXy47YogdNURArGkFy4k3To',
        'KT1CGHpbtxvPRX6HF4mVQo48Rb5z2aYVnvB6',
        'KT1FCCDtoG71hJb4KiUegpCqGr1GDG3YyY7g',
        'KT1K1vBSP5MyKfBBpyHEjmCHTuYeugid4Tqn',
        'KT1UQaoRqLgFvsTwprgsGXj84DT9Wm5jC7tY',
        'KT1Gba7KnVXB563kxmk4mgKUQ4ujP8yFbQfr',
        'KT1RbCvEFWCJXUswKxWrH9wxgu88hMm8YEZz',
        'KT1AGcbS4TyquQjQsa4fwce3FjLZv2UpGMse',
        'KT1KJNPUsHrjhN9iUJMz7DL3WkTcibhGrxse',
        'KT1WN9yWqV9pEm1ANR56ExJZbnVukWN31fTY',
        'KT1WBXFKW1sozV7ZLBHvw5eks6Pb8KSoVmLq',
        'KT1KWNNBtb7z8pejNUNigaRWSTkTQL4DEcf8',
        'KT1D6CNSXcftRTArCF73Jpsh95dwgEwAy6qZ',
        'KT1R87j2qFxtPZE3EmmeSoubg2mZkk3j4X8y',
        'KT1HRCc359qXshgMpBygY3VwqTnV7fc7nYfp',
        'KT1MU8Pb9DFjnVpEULyWDrqPLjedZPNHFrEN',
        'KT1FPfsRVWVju2mH1r2iFg5jfzWj7RDCb6ia',
        'KT19AqSn4m3NtvztPXuETjCzoQ75bKDd1Pyi',
        'KT1PcYxsFmXuoxcJpcfRSCcQQeSDLERSMzsW',
        'KT1KSYCk8zjdhgzDDRsmb2ygAfanjBx25Wto',
        'KT1LqKWDtzUh4CXNqfJQMcATv4PdZxBjPJjH',
        'KT197APGtQ8mk2svRSpDkqXLzHedRtkJ7Hjr',
        'KT1CTqQ4vg2zyG1AQmDLVeJ473ueoy2Rw8t1',
        'KT1QE4nZiAXbpuDCu4P5QTNibQSx6FFW3y2W',
        'KT1QbzLyzwXB9JTevvjT3B24BzgWfMzFfBHt'
      ],
      thumbnailUrl: '../../../assets/img/spinner/truesy.svg',
      shouldDisplayLink: DisplayLinkOption.None
    },
    OpenMinter: {
      name: 'OpenMinter',
      address: ['KT1QcxwB4QyPKfmSwjH1VRxa6kquUjeDWeEy'],
      thumbnailUrl: '../../../assets/img/alias/openminter.svg',
      shouldDisplayLink: DisplayLinkOption.None
    },
    Tezzardz: {
      name: 'Tezzardz',
      address: ['KT1LHHLso8zQWQWg1HUukajdxxbkGfNoHjh6'],
      thumbnailUrl: '../../../assets/img/alias/tezzardz.png',
      shouldDisplayLink: DisplayLinkOption.None
    },
    ArtCardz: {
      name: 'Art Cardz',
      address: ['KT1LbLNTTPoLgpumACCBFJzBEHDiEUqNxz5C'],
      thumbnailUrl: '../../../assets/img/alias/artcardz.png',
      discoverUrl: '../../../assets/img/alias/artcardz.png',
      link: 'https://artcardz.xyz/',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles']
    },
    PRJKTNEON: {
      name: 'PRJKTNEON',
      address: ['KT1VbHpQmtkA3D4uEbbju26zS8C42M5AGNjZ', 'KT1H8sxNSgnkCeZsij4z76pkXu8BCZNvPZEx'],
      thumbnailUrl: '../../../assets/img/alias/prjktneon.png',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None
    },
    NEONZ: {
      name: 'NEONZ',
      address: ['KT1MsdyBSAMQwzvDH4jt2mxUKJvBSWZuPoRJ'],
      thumbnailUrl: '../../../assets/img/alias/neonz.jpg',
      link: 'https://neonz.xyz',
      shouldDisplayLink: DisplayLinkOption.None
    },
    GOGOs: {
      name: 'GOGOs',
      address: ['KT1SyPgtiXTaEfBuMZKviWGNHqVrBBEjvtfQ'],
      thumbnailUrl: '../../../assets/img/alias/gogo.jpg',
      link: 'https://gogos.tez.page/',
      shouldDisplayLink: DisplayLinkOption.None
    },
    GOGOsInventoryItems: {
      name: 'GOGOs Inventory Items',
      address: ['KT1Xf44LpwrA7oBcB3VwWTtUBP1eNRaNnWeh'],
      thumbnailUrl: '../../../assets/img/alias/gogo.jpg',
      link: 'https://gogos.tez.page/',
      shouldDisplayLink: DisplayLinkOption.None
    },
    HashThreePoints: {
      name: 'Hash Three Points',
      address: ['KT1Fxz4V3LaUcVFpvF8pAAx8G3Z4H7p7hhDg'],
      thumbnailUrl: '../../../assets/img/alias/hashthreepoints.png',
      link: 'https://h3p.deconcept.com/',
      shouldDisplayLink: DisplayLinkOption.None
    },
    TheMoments: {
      name: 'The Moments',
      address: ['KT1CNHwTyjFrKnCstRoMftyFVwoNzF6Xxhpy'],
      thumbnailUrl: '../../../assets/img/alias/themoments.jpeg',
      link: 'https://themoments.xyz/',
      shouldDisplayLink: DisplayLinkOption.None
    },
    HOLLOWS: {
      name: 'HOLLOWS',
      address: ['KT1Ak8AFA54waFVMyPXNE925cUaQjFEqxuYN'],
      thumbnailUrl: '../../../assets/img/alias/hollows.jpg',
      link: 'https://hollowsnft.xyz/',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles']
    },
    TacoNFT: {
      name: 'TacoNFT',
      address: ['KT1Mf8Pqn6NMt8VGuVaySohvSvQQpvcM37eZ', 'KT1BkStQej7MwnkWhCV2tUanETeN25zc7ADe'],
      thumbnailUrl: 'assets/img/alias/taconft.png',
      link: 'https://taconft.xyz/',
      shouldDisplayLink: DisplayLinkOption.None
    },
    C0FACE: {
      name: '0xC0FACE COLLECTION',
      address: ['KT1DuZFNv6JwwA7kS8RXvoQiANm3L4dfn6qP'],
      thumbnailUrl: 'assets/img/alias/0xC0FACE-thumb.jpg',
      shouldDisplayLink: DisplayLinkOption.None
    },
    DY5P1ACE: {
      name: 'DY5P1ACE COLLECTION',
      address: ['KT1XPCvaKhH4PXMiWLJo8AvKMAvFySLWuGFk'],
      thumbnailUrl: 'assets/img/alias/DY5P1ACE-thumb.jpg',
      shouldDisplayLink: DisplayLinkOption.None
    },
    VERSA: {
      name: 'VERSA',
      address: ['KT1Afa8abYrcu9WW7Zbv1f4W6zAgrnYtVaFM'],
      thumbnailUrl: 'assets/img/alias/VERSA.png',
      shouldDisplayLink: DisplayLinkOption.None
    },
    FloSports: {
      name: 'FloSports',
      address: ['KT1SQFuskMGQB7arqvQyuCH9v2utbJNmGcR6'],
      thumbnailUrl: 'assets/img/alias/FloSports.png',
      shouldDisplayLink: DisplayLinkOption.None
    },
    RichieHawtin: {
      name: 'Richie Hawtin - Proof of Performance',
      address: ['KT1FTHGWAPpNGqu8iDZMp52niALdpRpwmF3N'],
      thumbnailUrl: 'assets/img/alias/RichieHawtin.jpg',
      shouldDisplayLink: DisplayLinkOption.None
    },
    TezDev: {
      name: 'TezDev Merch',
      address: ['KT1TKH1tNgHozZkCGfoMAG9SiA9jPphTj3ym'],
      thumbnailUrl: 'assets/img/alias/TezDev_NFT.png',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None
    },
    MarinaAbramovicTheHero: {
      name: 'Marina Abramović - The Hero 25FPS',
      address: ['KT1Do66uucsbGELYV1sbLwBttCc5Gu6NrKmo'],
      thumbnailUrl: 'assets/img/alias/MarinaAbrabmovicTheHero.jpg',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None
    },
    LifeAfterBobTrueName: {
      name: 'Life After BOB: TRUE NAME',
      address: ['KT1GBWC8L4HYXM62GDBGipnZ6Bc9sWgqhcFF'],
      thumbnailUrl: 'assets/img/alias/afterbob-truename.png',
      link: 'https://truename.me',
      shouldDisplayLink: DisplayLinkOption.None
    },
    ChopSumo: {
      name: 'Chop Sumo',
      address: ['KT1Wm4Cegd7wW6MYxEhg6AH5iFX48y65nWvv'],
      thumbnailUrl: 'assets/img/alias/chopsumo.png',
      link: 'https://chopsumo.xyz',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles']
    },
    FLUX: {
      name: 'FLUX',
      address: ['KT1QRtkWmCKSnLDnEzJVoj2ya2Ef2mTjszwH', 'KT1XKUyUtRqobh5CqZzXFJW6UT5t55Sn3iT6'],
      thumbnailUrl: '../../../assets/img/alias/flux.png',
      link: 'https://fluxtribe.xyz',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles']
    },
    CyberGeckoGang: {
      name: 'Cyber Gecko Gang',
      address: ['KT1CwSgYmZewFazZsW348RAQYn1nthiGP3Qa'],
      thumbnailUrl: 'assets/img/alias/cyber-gecko-gang.png',
      link: 'https://cybergeckogang.xyz',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: 'Cyber Gecko Gang is a limited collection of smug geckos programmatically, randomly generated on the Tezos blockchain'
    },
    YourCryptoMom: {
      name: 'Your Crypto Mom',
      address: ['KT1AYP8jy46BJ9U17wbrvTSKsdgFiwLuvoVo'],
      thumbnailUrl: '../../../assets/img/alias/cryptomom.jpeg',
      link: 'https://yourcryptomom.com',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: 'Your Crypto mom is a tribute to every mom in the world. Every art is unique.'
    },
    CUBEHEADS: {
      name: 'CUBE HEAD',
      address: ['KT1XHyDd8ScUteYRWNocHgwZtj2BwBcoCZZo', 'KT1SioBPZ6HB4J1cL3jZYBv3WZPydxfswz4k', 'KT1HVjodj7Wh1Z92vVgowZwu3PU2A6ZqbmQv'],
      thumbnailUrl: '../../../assets/img/alias/cubeheads.png',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: 'Collections made with a unique cube character set'
    },
    FormallyVerified: {
      name: 'Formally Verified',
      address: ['KT1Lk3fKhyFMVSdDGcqKKetqsVw3t5sHBXb8'],
      thumbnailUrl: '../../../assets/img/alias/formally-verified.png',
      link: 'https://formallyverified.xyz',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['badges'],
      description: 'Formally Verified is a contract for digital badges proving that someone has attended an event.'
    },
    BoomerPunks: {
      name: 'BoomerPunks',
      address: ['KT1UvePjsyA1dAViNu8JMiDmDm1as1PT8ZQs'],
      thumbnailUrl: '../../../assets/img/alias/boomerpunks.png',
      link: 'https://nft.angentur-boomer.de',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles']
    },
    BoomerPunksV2: {
      name: "New Year's BoomerPunks",
      address: ['KT1WLLNJ6ouSrVoAC789FniwdSnVjqGZELJa'],
      thumbnailUrl: '../../../assets/img/alias/boomerpunks2.png',
      link: 'https://nft.angentur-boomer.de',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles']
    },
    PixelPanda: {
      name: 'Pixel Panda',
      address: ['KT1AFxcFeTyrgmULfBwvo9oCSkTwi5TZb2hm'],
      thumbnailUrl: '../../../assets/img/alias/panda.jpeg',
      link: 'https://pixelpanda.xyz',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: 'Pixel Panda is an army of 3000 randomly generated Pixelated FuRRballs on Tezos blockchain by AK creations'
    },
    CyberKidzClub: {
      name: 'CyberKidz Club',
      address: ['KT1DuZFNv6JwwA7kS8RXvoQiANm3L4dfn6qP'],
      thumbnailUrl: '../../../assets/img/alias/cyberkidzclub.png',
      link: 'https://cyberkidzclub.xyz',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description:
        'In 2420, only 6666 kids survived the destruction of the global ecosystem caused by the excessive minting of dirty NFTs on proof of work blockchains. CyberKidz Club.'
    },
    SkratzTribute: {
      name: 'Skratz Tributes',
      address: [
        'KT1LaGxGqGCE7wRRP6NpZ9CSwq78y5PS6udh',
        'KT1R5SsFitVz8Zxc27NNPxeBogBFK2upfndF',
        'KT1Pr6rNNzyRirHCiTn7CWpP7off6sH8M3HU',
        'KT1UQhWV1Q2ArnDkWPoYgk4Kbm4dgE2BS7G8',
        'KT1AWUzFdNwZn7YprZitR6Q6eUuVmfUG1HMP',
        'KT19hJSZZYnD41xuEjEgodhAnnuLh142g8QJ',
        'KT1F9uU1xXJEzKmPvxMAdo1cMwnhnBHEB6pN'
      ],
      thumbnailUrl: '../../../assets/img/alias/skratz.jpeg',
      link: 'https://houseofskratz.com',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: 'Skratz Tribute from https://houseofskratz.com.'
    },
    HouseOfSkratz: {
      name: 'House Of Skratz',
      address: [
        'KT1UHiGBUpbmUSV68tiGi8owFP7VWr2zBMCk',
        'KT1MWKxDT6QJWgPH4Wq1TuHwW2tcvJRbuKMZ',
        'KT1HMvdTCsK9Su7RkFKgFwQuxaqgmNdbtdLS',
        'KT1CFdGeFo44DN64JgtfHF2YqrZTKg1yFXM4'
      ],
      thumbnailUrl: '../../../assets/img/alias/skratz.jpeg',
      link: 'https://houseofskratz.com',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: '2222 Skratz from https://houseofskratz.com.'
    },
    TezApeGang: {
      name: 'TezApeGang',
      address: ['KT1FReMp4U1KipyH53xXUnnjtdRQZaLnQpUj'],
      thumbnailUrl: '../../../assets/img/alias/tezapegang.png',
      link: 'https://tezapegang.xyz',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: 'TezApeGang is a collection of 6969 Apes living on the Tezos Blockchain. With Ape staking feature and DAO from Day1.'
    },
    MekatronK9: {
      name: 'MekatronK9',
      address: ['KT1PooRxUckYjnWVvn9CetZxC9YeG1kkFYW5'],
      thumbnailUrl: '../../../assets/img/alias/mekatron.jpeg',
      link: 'https://www.mekatron.club/',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description:
        "Driven from their homeword, they are the last surviving Mekatron k9, now seeking refuge in earth's metaverse. Their fight for survival has just begun."
    },
    rarible: {
      name: 'Rarible',
      address: ['KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS'],
      thumbnailUrl: '../../../assets/img/alias/rarible.png',
      link: 'https://rarible.com',
      shouldDisplayLink: DisplayLinkOption.None
    },
    TheTransmission: {
      name: 'The Transmission',
      address: [
        'KT1LikBSDucbAfYLN9Uxosh4V2SNRrbQwfrJ',
        'KT1A93CFh7JhYcJFhJqwHskVPFzQJgSRmLW7',
        'KT1BwNPvwjYm7bLEzt93MWDTb6pE8xsac9c1',
        'KT1FivwAmg7oB6mDSKnkRfvi32wL8TQAsfHz',
        'KT1P5zodzq7DtfQkdbHz65WhtQYMwmEXNitP'
      ],
      thumbnailUrl: '../../../assets/img/alias/transmission.png',
      link: 'https://thetransmission.xyz',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['game', 'collectibles'],
      backgroundColor: '#0d0d1a',
      description: 'A Crypto-Techno-Horror Adventure. 666 fully algo-generated residents take part in missions to uncover the mystery of The Transmission.'
    },
    Platypoos: {
      name: 'Platypoos',
      address: ['KT1D394hqndjvTcFgrmUYBxwrzUTNtzrZ5ox'],
      thumbnailUrl: '../../../assets/img/alias/platypoo.jpg',
      link: 'https://objkt.com/collection/KT1D394hqndjvTcFgrmUYBxwrzUTNtzrZ5ox',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      backgroundColor: 'black',
      description: 'aka P.Poos, 250, super rare, totally worthless'
    },
    Versum: {
      name: 'Versum',
      address: ['KT1LjmAdYQCLBjwv4S2oFkEzyHVkomAf5MrW'],
      thumbnailUrl: '../../../assets/img/alias/versum.png',
      discoverUrl: '../../../assets/img/alias/versum.svg',
      link: 'https://versum.xyz',
      shouldDisplayLink: DisplayLinkOption.None,
      backgroundColor: 'black',
      category: ['marketplace'],
      description: 'NFT Marketplace focused on organic content and curation.'
    },
    VesselGen0: {
      name: 'Vessel Gen0',
      address: ['KT1U1GDQDE7C9DNfE9iSojsKfWf5zUXdSVde'],
      thumbnailUrl: '../../../assets/img/alias/vesselgen0.jpg',
      link: 'https://vesselsgen0.xyz/',
      shouldDisplayLink: DisplayLinkOption.None,
      description: 'An eclectic kaleidoscope: alien cultists, scifi loving tech heads, old earth culture pilfering retronauts and flamboyant gang members.',
      category: ['collectibles']
    },
    FCOREBOLLO: {
      name: 'FCO. REBOLLO',
      address: ['KT1Qc8xu8i72QX5S72ifPB3KJGsJqXB79eTP'],
      thumbnailUrl: '../../../assets/img/alias/FCOREBOLLO.png',
      link: 'https://fcorebollo.com',
      shouldDisplayLink: DisplayLinkOption.None,
      backgroundColor: '#312615',
      category: ['collectibles'],
      description: 'Original artworks by Francisco Rebollo'
    },
    DistributedConsciousness: {
      name: 'Distributed Consciousness',
      address: ['KT1S9VbCtVZUgAG4Q3VArvY5stu96q4CiPHZ', 'KT1JYioHwutnTpYPTk5yRe9YSfCaFGWhd9MR'],
      thumbnailUrl: '../../../assets/img/alias/distribconsc.jpg',
      link: 'https://www.distributedconsciousness.xyz/',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['art', 'collectibles'],
      description: 'AI generated Tentacular Critters and Verses. By Memo Akten (memo.tv)'
    },
    Monarx: {
      name: 'Monarx',
      address: ['KT1V3BYwUN7FiBqADLMvMpWbz33tq1vudBh5'],
      thumbnailUrl: '../../../assets/img/alias/monarx.jpg',
      link: 'https://monarx.art/',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      backgroundColor: 'black',
      description: 'A generative collection on Tezos of 666 NFTs'
    },
    Basqunks: {
      name: 'Basqunks',
      address: ['KT1DtsVHqUvKBkkypLB3x2bYd4jWdbbaHdMy'],
      thumbnailUrl: '../../../assets/img/alias/basqunks.png',
      link: 'https://objkt.com/collection/KT1DtsVHqUvKBkkypLB3x2bYd4jWdbbaHdMy',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      backgroundColor: 'red',
      description: 'A CryptoPunks inspired collection, combining the style of Jean-Michel Basquiat with the Crypto Punks.'
    },
    Ottez: {
      name: 'Ottez',
      address: ['KT1L7GvUxZH5tfa6cgZKnH6vpp2uVxnFVHKu'],
      thumbnailUrl: '../../../assets/img/alias/ottez.png',
      link: 'https://ottez.xyz',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: 'Humans are gone. Ottez have moved in. 4,007 generative, collectible PFP otters have taken over Earth. '
    },
    Parrotz: {
      name: 'Parrotz',
      address: ['KT1GMRLLmxfNBb5VPASEouaKhnhQvBigzDtL'],
      thumbnailUrl: '../../../assets/img/alias/Parrotz.png',
      link: 'https://parrotz.tzdropz.com/',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description:
        'In a new world that was once dominated by lizzards and otters, evolution took hold and a flock of 10k generative PFP Parrotz came to Tezos as NFTs to live peacefully with those that came before them.'
    },
    xarb: {
      name: 'Xarb',
      address: ['KT1JsJUo4PQARJB3AkstQJ8mHskoNJb29a7Z'],
      thumbnailUrl: '../../../assets/img/alias/xarb.png',
      link: 'https://xarb.io',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['marketplace'],
      description: 'A Place To Find And Collect NFTs'
    },
    BunnyKnights2ndGen: {
      name: 'Bunny Knights 2nd Gen',
      address: ['KT1EVBE1T4GqviEopZEtEQhPEyTQvWyDqDNE'],
      thumbnailUrl: '../../../assets/img/alias/bunnyknights2ndgen.png',
      link: 'https://bunnyknights.com',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: '2nd Generation Collection of Bunny Knights.'
    },
    alchemy: {
      name: 'Ch=mpathy Alch=my',
      address: ['KT1MjS4L4HRajqNhQCdTSXgSPhW4A6gHiQo7'],
      thumbnailUrl: '../../../assets/img/alias/alchemy.png',
      link: 'https://al.chempathy.xyz',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: '3477 Arcan=s transmuted and summoned by Overlords on the Tezos Blockchain.'
    },
    Ilmeresh: {
      name: 'Fellowship of Ilmeresh',
      address: ['KT1HJExmBz4G4kG1wx9zqs394kgRiDLWCb4m'],
      thumbnailUrl: '../../../assets/img/alias/ilmeresh.png',
      link: 'https://ilmeresh.com',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: 'The Fellowship of Ilmeresh is a collection of randomly generated characters .jpg on the Tezos blockchain. Designed in 3D!'
    },
    HereAndNow4: {
      name: 'HERE & NOW: Edition 4',
      address: ['KT1SRFbwhvfkXoRGqiDFVVsf5GTp16wGgtCa'],
      thumbnailUrl: '../../../assets/img/alias/HereAndNowEd4.png',
      link: 'https://hereandnow.events/',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['art', 'collectibles'],
      description: 'Here and Now is an interactive virtual Art experience that showcases emerging and established artists.'
    },
    Orbix360: {
      name: 'Orbix360',
      address: ['KT1Nf6V7fje6ELNgD6hkKfc3SXaDNVFAifEX', 'KT1BQv5ynR5rV1Wf42iBgZP4cERgjn4ihbBx'],
      thumbnailUrl: '../../../assets/img/alias/orbix360.png',
      discoverUrl: '../../../assets/img/alias/orbix360.svg',
      link: 'https://minter.orbix360.com',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['marketplace'],
      backgroundColor: '#171717',
      description: 'NFT Marketplace with Metaverse Creation Tools'
    },
    EndlessWays: {
      name: 'Endless Ways',
      address: ['KT1VdCrmZsQfuYgbQsezAHT1pXvs6zKF8xHB'],
      thumbnailUrl: '../../../assets/img/alias/endlesswaysLogo.png',
      link: 'https://endlessways.net',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: 'Generative Art. Proper Curation.'
    },
    TokenGesture: {
      name: 'A Token Gesture',
      address: ['KT1GU8M8kxFiK4HF9uzdXLUonX5JuddBsrba'],
      thumbnailUrl: '../../../assets/img/alias/tokengesture.png',
      link: 'https://nft.inspace.ed.ac.uk',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: 'A Token Gesture is an interactive NFT exhibition at Inspace, part of the Institute for Design Informatics, University of Edinburgh.'
    },
    Flex: {
      name: 'Flex',
      address: ['KT1AWoUQAuUudqpc75cGukWufbfim3GRn8h6'],
      thumbnailUrl: '../../../assets/img/alias/Flex_Monument.png',
      link: 'https://flex.fashion',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['fashion', 'collectibles'],
      description: 'Fashion, Creativity, and NFTs on Tezos'
    },
    BlueVishnu: {
      name: 'BlueVishnu - Digital Humans',
      address: ['KT1Lz7Jd6Sh1zUE66nDGS7hGnjwcyTBCiYbF', 'KT1D1XtWFoQDPtuYzbkeRJhcDgH6CDem2FkZ'],
      thumbnailUrl: '../../../assets/img/alias/bluevishnu.jpg',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['3D', 'collectibles'],
      description: ''
    },
    Pantone: {
      name: 'PANTONE Very Peri',
      address: ['KT1AjuZb9TZTastAzhbufGsYG7vVNADUFmue'],
      thumbnailUrl: '../../../assets/img/alias/pantone-very-peri.jpg',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: ''
    },
    FILMCrew: {
      name: 'FILMCrew Collection',
      address: ['KT1Su3fNrnABFSYMtWVDZnMbH3DzJeysAd6t'],
      thumbnailUrl: '../../../assets/img/alias/filmcrew.png',
      discoverUrl: '../../../assets/img/alias/filmcrew-discover.png',
      link: 'https://decentralized.pictures/filmcrew-collection',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      backgroundColor: '#435259',
      description: `A series of illustrations portraying the key components of film sets, FILMCrew is the world's first limited NFT collection of its kind.`
    },
    Decathlon: {
      name: 'Decathlon NFT',
      address: ['KT1QXngq1CCuWv5RtnuYCSvGdKGeBxsRCWvQ'],
      thumbnailUrl: '../../../assets/img/alias/decathlon.png',
      link: 'https://www.decathlon.com',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: 'First step in building a future where digital goods are connected to physical goods'
    },
    Taqueria: {
      name: 'Taqueria Collection',
      address: ['KT1D6er82V26zwV7RUxA9Wq7YyjziC52STjo'],
      thumbnailUrl: '../../../assets/img/alias/taqueria.png',
      link: 'https://taqueria.io/',
      shouldDisplayLink: DisplayLinkOption.None,
      description: `Taqueria is a Tezos developer tool suite, designed to make working with Tezos easier and more secure.`
    },
    'HCKR Lounge': {
      name: 'Tezos HCKR Lounge',
      address: ['KT1Fezth36inWMKtTh8Rt6NaQSM1im5LwP4T'],
      thumbnailUrl: '../../../assets/img/alias/tezos_blue_bg.jpg',
      shouldDisplayLink: DisplayLinkOption.None,
      description: ``
    },
    GJOE: {
      name: 'GJOE',
      address: ['KT1QdMB7uePDFGoFLDZmAL34roFYqYhzHu7N'],
      thumbnailUrl: '../../../assets/img/alias/gjoe.jpg',
      link: 'https://customhorror.net/gjoe',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description: 'Generative Jolt of Expression'
    },
    connies: {
      name: 'Connies',
      address: ['KT1Bq16tfwdzWXHsnw4YjQvwB779u1AJnsyx'],
      thumbnailUrl: '../../../assets/img/alias/connies-discover.png',
      link: '',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['collectibles'],
      description:
        'Connies is a collection of randomly generated Unicorns on the Tezos blockchain. This collection of originally drawn “Connie the Unicorn” NFTs was created and distributed to attendees at VidCon 2022.'
    },
    OneOfGloGang: {
      name: 'OneOf - GloGang',
      address: ['KT1Fv8TsEeafDhZXsHCyxFas96YDhXpdmUmz'],
      thumbnailUrl: '../../../assets/img/alias/glogang.jpg',
      link: 'https://www.oneof.com/GloGang',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['music', 'collectibles'],
      backgroundColor: '#000',
      description: 'Genesis collection by Chief Keef and ColorfulMula'
    },
    Blockxer: {
      name: 'Blockxer',
      address: ['KT1NjMYSVnfrTiuKEKsyXp61hnWP3CL6qPW2'],
      thumbnailUrl: '../../../assets/img/alias/blockxer.png',
      discoverUrl: '../../../assets/img/alias/blockxer-discover.png',
      link: 'https://blockxer.com',
      shouldDisplayLink: DisplayLinkOption.None,
      category: ['games', 'collectibles'],
      description: 'An epic NFT-powered beat’em up style game.'
    },
    Trance: {
      name: 'TRANCE by Stacie Ant and Nsasi',
      address: ['KT1C8JDN7mJfz5A4fQWFmqbRmcCR511r7Y8i'],
      thumbnailUrl: '../../../assets/img/alias/trance.png',
      shouldDisplayLink: DisplayLinkOption.None
    },
    Portrait: {
      name: 'Collective Voice ID by Portrait XO',
      address: ['KT1TKLuE2RCoCoQsxkCosHjsQgEbavpsrf4Z'],
      thumbnailUrl: '../../../assets/img/alias/portrait.png',
      shouldDisplayLink: DisplayLinkOption.None
    },
    Museum: {
      name: 'Nxt Museum X Scotch and Soda',
      address: ['KT1Vits8ubN3ApXL3vCsm98bu2WnzLaGs3Yp'],
      thumbnailUrl: '../../../assets/img/alias/museum-nacht.png',
      shouldDisplayLink: DisplayLinkOption.None
    },
    Femgen: {
      name: 'Femgen - Miami 22',
      address: ['KT1QWtzjPpCZ7mpDdC5YxUszY1897d6JMJws'],
      thumbnailUrl: 'ipfs://QmaSjSstwf5YTqQ7aMK2cNQBVLh4XdnZu4h1kaPJdusj8G',
      shouldDisplayLink: DisplayLinkOption.None
    }
  },
  ASSETS: {
    KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV: {
      // kUSD
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Kolibri USD',
          symbol: 'kUSD',
          decimals: 18,
          description: 'Kolibri is a Tezos based stablecoin built on Collateralized Debt Positions (CDPs) known as Ovens.',
          displayAsset: 'assets/img/tokens/kusd.png',
          thumbnailAsset: 'assets/img/tokens/kusd.png',
          shouldPreferSymbol: true,
          status: 1
        }
      }
    },
    KT1JkoE42rrMBP9b2oDhbx6EUr26GcySZMUH: {
      // kDAO
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Kolibri DAO',
          symbol: 'kDAO',
          decimals: 18,
          description: '',
          displayAsset: 'assets/img/tokens/kdao.png',
          thumbnailAsset: 'assets/img/tokens/kdao.png',
          shouldPreferSymbol: true,
          status: 1
        }
      }
    },
    KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9: {
      // USDtz
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'USD Tez',
          symbol: 'USDtz',
          decimals: 6,
          description: 'USDtz is a Tezos on-chain stablecoin pegged to the value of the United States Dollar.',
          displayAsset: 'assets/img/tokens/usdtz.png',
          thumbnailAsset: 'assets/img/tokens/usdtz.png',
          shouldPreferSymbol: true,
          status: 1
        }
      }
    },
    KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW: {
      // uUSD
      kind: 'FA2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Youves uUSD',
          symbol: 'uUSD',
          decimals: 12,
          description: '',
          displayAsset: 'assets/img/tokens/uusd.png',
          thumbnailAsset: 'assets/img/tokens/uusd.png',
          shouldPreferSymbol: true,
          status: 1
        }
      }
    },
    KT1Xobej4mc6XgEjDoJoHtTKgbD1ELMvcQuL: {
      // YOU
      kind: 'FA2',
      category: 'finance',
      tokens: {
        0: {
          name: 'youves YOU Governance',
          symbol: 'YOU',
          decimals: 12,
          description: '',
          displayAsset: 'assets/img/tokens/you.png',
          thumbnailAsset: 'assets/img/tokens/you.png',
          shouldPreferSymbol: true,
          status: 1
        }
      }
    },
    KT1BzmcWWUV1dnGF58AZ67GySwsniPL2PKYq: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        0: {
          name: 'BTCtez',
          symbol: 'BTCtz',
          decimals: 8,
          description: 'BTCtz is a Tezos on-chain stablecoin pegged to the value of Bitcoin.',
          displayAsset: 'assets/img/tokens/btctz.png',
          thumbnailAsset: 'assets/img/tokens/btctz.png',
          shouldPreferSymbol: true,
          status: 1
        }
      }
    },
    KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn: {
      // tzBTC
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'tzBTC',
          symbol: 'tzBTC',
          decimals: 8,
          description: 'tzBTC delivers the power of Bitcoin as a token on the Tezos blockchain.',
          displayAsset: 'assets/img/tokens/tzbtc.png',
          thumbnailAsset: 'assets/img/tokens/tzbtc.png',
          shouldPreferSymbol: true,
          status: 1
        }
      }
    },
    KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8: {
      // ETHtz
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Ethertez',
          symbol: 'ETHtz',
          decimals: 18,
          description: 'ETHtz is Ethereum wrapped in the Tezos FA 2.0 token standard.',
          displayAsset: 'assets/img/tokens/ethtz.png',
          thumbnailAsset: 'assets/img/tokens/ethtz.png',
          shouldPreferSymbol: true,
          status: 1
        }
      }
    },
    KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH: {
      // wXTZ
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Wrapped Tezos',
          symbol: 'wXTZ',
          decimals: 6,
          description: 'Wrapped Tezos by StakerDAO, a fully collateralized representation of XTZ.',
          displayAsset: 'assets/img/tokens/wxtz.png',
          thumbnailAsset: 'assets/img/tokens/wxtz.png',
          shouldPreferSymbol: true,
          status: 1
        }
      }
    },
    KT1Gx5FUi9yxjhivFEYaYd2QyWhTQnXPcwCv: {
      // MFIL
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
    KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW: {
      // hDAO
      kind: 'FA2',
      category: 'finance',
      tokens: {
        0: {
          name: 'hic et nunc DAO',
          symbol: 'hDAO',
          decimals: 6,
          description: '',
          displayAsset: 'assets/img/tokens/hdao.png',
          thumbnailAsset: 'assets/img/tokens/hdao.png',
          isTransferable: true,
          isBooleanAmount: false,
          shouldPreferSymbol: true,
          status: 1
        }
      }
    },
    KT1AafHA1C1vk959wvHWBispY9Y2f3fxBUUo: {
      kind: 'FA1.2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Sirius',
          symbol: 'SIRS',
          decimals: 0,
          description: '',
          displayAsset: 'assets/img/tokens/sirius.png',
          thumbnailAsset: 'assets/img/tokens/sirius.png',
          isTransferable: true,
          isBooleanAmount: false,
          shouldPreferSymbol: true,
          status: 1
        }
      }
    },
    KT197APGtQ8mk2svRSpDkqXLzHedRtkJ7Hjr: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-9': {
          name: 'Goated: Die Ideale',
          symbol: '',
          decimals: 0,
          description:
            'A recreation of Die Ideale by Piet Mondrian painted with brush strokes of gemstones and precious metals. The work comprises various iconic jewelry styles and pieces from diamond tennis chains, loose gemstones, timepieces and rope chains among numerous others. The work was assembled and designed by artist Rachel Goatlely in partnership with Greg Yüna who crafted and designed the jewelry pieces used.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmSEtUcV9HuvLdcZbyxVK23TNoyCouf5cpsb1JwoWZffeK',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmbxKzdmd9uWT9AYTmzJNDabvRmC916XkqXeuycoHH2dTC',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1CTqQ4vg2zyG1AQmDLVeJ473ueoy2Rw8t1: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-9': {
          name: 'Goated: The Kiss',
          symbol: '',
          decimals: 0,
          description:
            'A recreation of The Kiss by Gustav Klimt painted with brush strokes of gemstones and precious metals. The work comprises various iconic jewelry styles and pieces from diamond tennis chains, loose gemstones, timepieces and rope chains among numerous others. The work was assembled and designed by artist Rachel Goatlely in partnership with Greg Yüna who crafted and designed the jewelry pieces used.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmWeiSKjS3tXLemcdRSEV8wZMwpx71kQ9dJcpxo2BmUonh',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmQTTxZ4eveDM65Lu7W2pKv1hGJjbsj66ZBfhPkiKBW3kT',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1JXZPcfEnxswdzYLox1LeALWTkSm1nsdhp: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-126': {
          name: 'ATX Tezos Taco',
          symbol: '',
          decimals: 0,
          description:
            'This Taco NFT was inspired by and minted for Austin, Texas on Taco Tuesday, May 4th, 2021, to help push the Clean NFT movement forward. Enjoy your taco or send it to a friend to help spread the word about Clean NFTs on Tezos.',
          displayAsset: {
            // ipfs://QmYbWkagqQyQ4bJhWWWSGaCLNGP1czbPgD2PLmJ4aVmtGR
            uri: 'https://cloudflare-ipfs.com/ipfs/QmYbWkagqQyQ4bJhWWWSGaCLNGP1czbPgD2PLmJ4aVmtGR',
            mimeType: 'image/jpeg'
          },
          thumbnailAsset: '',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1QE4nZiAXbpuDCu4P5QTNibQSx6FFW3y2W: {
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
    KT1QbzLyzwXB9JTevvjT3B24BzgWfMzFfBHt: {
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
    KT1LqKWDtzUh4CXNqfJQMcATv4PdZxBjPJjH: {
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
    KT1WN9yWqV9pEm1ANR56ExJZbnVukWN31fTY: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-4': {
          name: 'Starry Serenade',
          symbol: '',
          decimals: 0,
          description:
            'The stars and sky dance in the tempestuous night. El Guitarrista joins in the nocturnal symphony of the cosmos. He plays, the sky dances—a dalliance that lasts until the dawn.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmNym5CYDeSTneeL9oSzcGZ5QfUzYjPv97EYpK92LneNav',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmTaWdJxu8vaqgr3XAJ92TsX6d6aPpxo6qjyANNedMX4vK',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1WBXFKW1sozV7ZLBHvw5eks6Pb8KSoVmLq: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-1': {
          name: 'Dynamic Starry Serenade',
          symbol: '',
          decimals: 0,
          description:
            'The stars and sky dance in the tempestuous night. El Guitarrista joins in the nocturnal symphony of the cosmos. He plays, the sky dances—a dalliance that lasts until the dawn.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmTaWdJxu8vaqgr3XAJ92TsX6d6aPpxo6qjyANNedMX4vK',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmTaWdJxu8vaqgr3XAJ92TsX6d6aPpxo6qjyANNedMX4vK',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1KWNNBtb7z8pejNUNigaRWSTkTQL4DEcf8: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-4': {
          name: 'Piano Man II',
          symbol: '',
          decimals: 0,
          description:
            'The Piano Man, hypnotized in atmospheric space, ensconced in smoke, translates emotions musically—melancholy, sorrow, passion, and love. We see him through the lens of our own fleshly perceptions. He is a reflection, a mirror, a teacher…',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmUceK52RXegM9Uj1KrojSdmaiDvSNPG4cwrrQNHP7FrGp',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmXk9udjsm4ErhpBPv4W3tX8q7Zm7m6NiKVcBaztdCV3Xs',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1D6CNSXcftRTArCF73Jpsh95dwgEwAy6qZ: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-1': {
          name: 'Dynamic Piano Man II',
          symbol: '',
          decimals: 0,
          description:
            'The Piano Man, hypnotized in atmospheric space, ensconced in smoke, translates emotions musically—melancholy, sorrow, passion, and love. We see him through the lens of our own fleshly perceptions. He is a reflection, a mirror, a teacher…',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmXk9udjsm4ErhpBPv4W3tX8q7Zm7m6NiKVcBaztdCV3Xs',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmXk9udjsm4ErhpBPv4W3tX8q7Zm7m6NiKVcBaztdCV3Xs',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1R87j2qFxtPZE3EmmeSoubg2mZkk3j4X8y: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-4': {
          name: 'DJ Mona Lisa',
          symbol: '',
          decimals: 0,
          description:
            "DJ MONA LISA is the amalgamation of one of the most recognizable images from 15th century Florence, blended and mixed with BUA’s classic, iconographic pop culture DJ painting. Her flirtatious smile might make you wonder what DJ Mona is mixing up on the 1's & 2's.",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmQTdKE183LWB33VmJQPEZMtEGg3JMFF2dgtLfezgUANeq',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmQzfvT6tPTdECds6Q11NpYcAf9pcjUHqmCBZ9NDjJMotM',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1HRCc359qXshgMpBygY3VwqTnV7fc7nYfp: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-1': {
          name: 'Dynamic DJ Mona Lisa',
          symbol: '',
          decimals: 0,
          description:
            "DJ MONA LISA is the amalgamation of one of the most recognizable images from 15th century Florence, blended and mixed with BUA’s classic, iconographic pop culture DJ painting. Her flirtatious smile might make you wonder what DJ Mona is mixing up on the 1's & 2's.",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmQzfvT6tPTdECds6Q11NpYcAf9pcjUHqmCBZ9NDjJMotM',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmQzfvT6tPTdECds6Q11NpYcAf9pcjUHqmCBZ9NDjJMotM',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1MU8Pb9DFjnVpEULyWDrqPLjedZPNHFrEN: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-4': {
          name: 'The Block',
          symbol: '',
          decimals: 0,
          description:
            'The Block is a home we all belong to. A place to come where warmth embraces and the light is always on. The birds and brownstones syncopate with the urban landscape, indicative of the unspoken language between the wild and tamed on The Block.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmVvFrcxoJjbtAJVxoLhvHxnG1jdAc5E69Lp6a42A3VFfS',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmRAWffkFZdeLFWmLoVuLqTqW3D8yq4hPZroGfGkLDd6Dz',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1FPfsRVWVju2mH1r2iFg5jfzWj7RDCb6ia: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-1': {
          name: 'Dynamic The Block',
          symbol: '',
          decimals: 0,
          description:
            'The Block is a home we all belong to. A place to come where warmth embraces and the light is always on. The birds and brownstones syncopate with the urban landscape, indicative of the unspoken language between the wild and tamed on The Block.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmRAWffkFZdeLFWmLoVuLqTqW3D8yq4hPZroGfGkLDd6Dz',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmRAWffkFZdeLFWmLoVuLqTqW3D8yq4hPZroGfGkLDd6Dz',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT19AqSn4m3NtvztPXuETjCzoQ75bKDd1Pyi: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-4': {
          name: 'Trumpet Man',
          symbol: '',
          decimals: 0,
          description:
            'A year ago the world stopped. Trumpet Man cries and mourns for the city he belongs to.  Trumpet man’s musical notes give us hope.  He delicately conducts his magic in an architectural symphony. The coolness of the monochromatic palette is complemented by the warm yellow windows that illuminate his horn.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmemuQ5X6stcbFQgR79rjBU3oxbzRGLgjMiehSh244c5kM',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmUZNJ3Ez4QZfyEkpKHK4BwQj5jskuvt3pfJRsQSskyW2G',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1PcYxsFmXuoxcJpcfRSCcQQeSDLERSMzsW: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-1': {
          name: 'Dynamic Trumpet Man',
          symbol: '',
          decimals: 0,
          description:
            'A year ago the world stopped. Trumpet Man cries and mourns for the city he belongs to.  Trumpet man’s musical notes give us hope.  He delicately conducts his magic in an architectural symphony. The coolness of the monochromatic palette is complemented by the warm yellow windows that illuminate his horn.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmUZNJ3Ez4QZfyEkpKHK4BwQj5jskuvt3pfJRsQSskyW2G',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmUZNJ3Ez4QZfyEkpKHK4BwQj5jskuvt3pfJRsQSskyW2G',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1KSYCk8zjdhgzDDRsmb2ygAfanjBx25Wto: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        0: {
          name: 'Dynamic DJ Mona Lisa AP',
          symbol: '',
          decimals: 0,
          description:
            "DJ MONA LISA is the amalgamation of one of the most recognizable images from 15th century Florence, blended and mixed with BUA’s classic, iconographic pop culture DJ painting. Her flirtatious smile might make you wonder what DJ Mona is mixing up on the 1's & 2's.",
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmQzfvT6tPTdECds6Q11NpYcAf9pcjUHqmCBZ9NDjJMotM',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmQzfvT6tPTdECds6Q11NpYcAf9pcjUHqmCBZ9NDjJMotM',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1KJNPUsHrjhN9iUJMz7DL3WkTcibhGrxse: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-23': {
          name: 'Gerbil Abloh',
          symbol: '',
          decimals: 0,
          description: '',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmTdRF1uNMQhkHqqrQstiwtZzfsUd39wMUzqCTJSQmE8ef',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmXATeW5cS1dMHymiHay1HQrhrixSRuAVjPedB2nYg3cAq',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1AGcbS4TyquQjQsa4fwce3FjLZv2UpGMse: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-49': {
          name: 'I Believe in Goddess voice memo demo 1',
          symbol: '',
          decimals: 0,
          description:
            'It’s hard to tell this is even the same song. The first time I heard this, I didn’t know what song it was. Then I heard the second version and figured it out. Oh, and the bridge at the end…. What the hell was I thinking?',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/Qmauf5qn3gq8dTpQZNVT6iruzuYuAscp7ns2bg6Pe39wdp',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/Qmauf5qn3gq8dTpQZNVT6iruzuYuAscp7ns2bg6Pe39wdp',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1RbCvEFWCJXUswKxWrH9wxgu88hMm8YEZz: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-49': {
          name: 'Total Bummer full band demo',
          symbol: '',
          decimals: 0,
          description:
            'from the Pump Up the Valuum demo collection. Recorded in 1999. What’s cool about this version is that there’s an octave chord part that we never put on the album. The sound isn’t that great, but Smelly rips and Mel’s octaves are really cool. My vocals…… ugh… Photo by Lisa Johnson',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmdyEUPQZnF8XKoxAGtidUgLz4AMtBSLFGo7MV3C5r1hsY',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmdyEUPQZnF8XKoxAGtidUgLz4AMtBSLFGo7MV3C5r1hsY',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1Gba7KnVXB563kxmk4mgKUQ4ujP8yFbQfr: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-27': {
          name: 'Herojuana cassette demo',
          symbol: '',
          decimals: 0,
          description:
            'I wrote this in 1999 and clearly I couldn’t decide if it was going to be a fast song or a slow song. I don’t know what the hell I was singing about either. Just place holder lyrics, but I think they sound kind of sweet. I think it would have been better slow…. Oh well. Photo by Krousky.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmeoazGDgUdykHWWVG99bd1ifVUzpVq6wZcrv7toLbehqM',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmeoazGDgUdykHWWVG99bd1ifVUzpVq6wZcrv7toLbehqM',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1UQaoRqLgFvsTwprgsGXj84DT9Wm5jC7tY: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-49': {
          name: 'I Believe in Goddess full band demo',
          symbol: '',
          decimals: 0,
          description: '',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmWFUrVwyexUcNPsCgQriHLZ4ea5oXBomjyddrcRxJJeqC',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmWFUrVwyexUcNPsCgQriHLZ4ea5oXBomjyddrcRxJJeqC',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1K1vBSP5MyKfBBpyHEjmCHTuYeugid4Tqn: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-49': {
          name: 'I Believe in Goddess voice memo demo 3',
          symbol: '',
          decimals: 0,
          description: '',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmSsRt6PXMii8uCC6mNhMHfcwPuYJEDtK7JG5avEuJypTz',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmSsRt6PXMii8uCC6mNhMHfcwPuYJEDtK7JG5avEuJypTz',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1FCCDtoG71hJb4KiUegpCqGr1GDG3YyY7g: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-49': {
          name: 'I Believe in Goddess voice memo demo 2',
          symbol: '',
          decimals: 0,
          description:
            'Recorded in 2009- What is the deal with me and that lame bridge. Stop it! At least I got a better hold on the verse, and I started to write the cool guitar riff. I actually wish I would of kept the rhythm at 2:20. Whoops. Photo by Jonathon Weiner',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmcU5pmCwcwvHaArZLaabF5PTnbqpCoUr67ywgga796rAU',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmcU5pmCwcwvHaArZLaabF5PTnbqpCoUr67ywgga796rAU',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1CGHpbtxvPRX6HF4mVQo48Rb5z2aYVnvB6: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-99': {
          name: 'Underground Soul',
          symbol: '',
          decimals: 0,
          description:
            'This NFT was created to share our love of travel, and how music has been the catalyst for us to explore mother earth, enabling us to give back and serve the communities on our journey. The sights and sounds and people and colors we encounter when we travel and how it connects us and brings us together.\nCreated by the Room Service International (RSI) team, Rahmi Halaby & Julio Galvez, exclusively for Truesy. Photography by Rahmi Halaby, Joshua Lang, TESIBE and The Whooligan.\nMusic: Humanity’s Universal Language\nMusic produced by The Whooligan.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmavbVoEMaNGrkCxG1Eem1JMoE4A7zw5zN6z7mJd3EpQun',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmavbVoEMaNGrkCxG1Eem1JMoE4A7zw5zN6z7mJd3EpQun',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1WAxpXZ8hvyoXy47YogdNURArGkFy4k3To: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-1': {
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
    KT1LfsA9WzzGX7jkhovSTVnZZoBQQNcpvatQ: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0-2': {
          name: 'The Dancer',
          symbol: '',
          decimals: 0,
          description:
            'From an early age, I was exposed to ballet. My mother would bring me to the studio and I would sit and watch in awe as the dancers practiced for hours upon hours.\nI was taken by the beauty of the female body, the movements, balance, and more than anything, the commitment it takes to be a successful ballerina. I also saw the frustration, tears, anxiety, joy and many other emotions that are displayed backstage.\nA recurring theme in this work parallels the social media era we are living in today. Just like the ballerinas who hide the pain, anxiety, and tears on stage, many people portray a perfect life on social media, but behind closed doors, are dealing with life’s issues.\nThe Dancer is a celebration of women, their strength, perseverance, and beauty, reinforces the idea of hard work and dedication, and serves as a constant reminder to spread love and be there for the ones you love, as you don’t always know what’s going on backstage.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmcLELkXz39Sqrn1wHMasbDygjxTvuB44Zqpg9ubnrWP9M',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmcLELkXz39Sqrn1wHMasbDygjxTvuB44Zqpg9ubnrWP9M',
          shouldPreferSymbol: false,
          isBooleanAmount: true,
          status: 1
        }
      }
    },
    KT1PvfewvyW7zxWHSHCivkeJRFyrHNjE3xDr: {
      kind: 'FA2',
      category: 'finance',
      tokens: {
        '0': {
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
    },
    KT1BA9igcUcgkMT4LEEQzwURsdMpQayfb6i4: {
      kind: 'FA2',
      category: '',
      tokens: {
        66: {
          name: 'The Non-Friendly Turtle #2',
          symbol: 'Tezos',
          decimals: 0,
          description:
            'NFTs are changing everything...but what exactly is an NFT? A Non-Friendly Turtle? Discover how Tezos is changing NFTs, and collect your own at Tezos.com/NFTgallery.',
          displayAsset: {
            // ipfs://QmTmSjweqQrba5WGRUxB4u5WEbwktQBQekioi9K7Kkos6x
            uri: 'https://cloudflare-ipfs.com/ipfs/QmTmSjweqQrba5WGRUxB4u5WEbwktQBQekioi9K7Kkos6x',
            mimeType: 'image/gif'
          },
          thumbnailAsset: '',
          isBooleanAmount: false,
          isTransferable: true,
          shouldPreferSymbol: false,
          status: 1
        },
        69: {
          name: 'Bear Pawtrait',
          symbol: 'Tezos',
          decimals: 0,
          description: 'NFTs are changing everything...but what exactly is an NFT? A Nice Foliage Trim? Discover how Tezos is changing NFTs.',
          displayAsset: 'https://cloudflare-ipfs.com/ipfs/QmW9RfyhsMxZLoJjLRFUSZ2SEjVSwu6TjcqEnH8ephzWtU',
          thumbnailAsset: 'https://cloudflare-ipfs.com/ipfs/QmW9RfyhsMxZLoJjLRFUSZ2SEjVSwu6TjcqEnH8ephzWtU',
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
    'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9:mint_OBJKT': { storage: 308 },
    'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9:swap': { storage: 180 },
    'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9:curate': { storage: 100 },
    'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9:collect': { storage: 212 },
    'KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5:xtzToToken': { storage: 83 },
    'KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5:addLiquidity': { storage: 69 },
    'KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5:removeLiquidity': { storage: 82 },
    'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn:approve': { storage: 35 }
  },
  NFT_CONTRACT_OVERRIDES: [
    'KT1AafHA1C1vk959wvHWBispY9Y2f3fxBUUo:0', //lp tzBTC
    'KT1JBNFcB5tiycHNdYGYCtR3kk6JaJysUCi8:0', // Lugh Euro
    'KT1Ha4yFVeyzw6KRAdkzq6TxDHB97KG4pZe8:0' // Dogami
  ],
  FEATURE_CONTRACTS: {
    theme: {
      dark: ['KT1CzVSa18hndYupV9NcXy3Qj7p8YFDZKVQv:43']
    }
  }
};
const _TRUSTED_TOKEN_CONTRACTS = [
  'KT1Em3sjKdHo3Fo9Az4EusZXQbkgsdZHkQkF', //alchememist giveaway
  'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton', //hicetnunc
  'KT1M2JnD1wsg7w2B4UXJXtKQPuDUpU2L7cJH', //hicetnunc-legacy
  'KT1W4wh1qDc2g22DToaTfnCtALLJ7jHn38Xc', //alchememist
  'KT1EH8yKXkRoxNkULRB1dSuwhkKyi5LJH82o', //mandala
  'KT1DKBvxiwDR7qazNuuxCxY2AaXnoytmDE7H', //Mandala v2
  'KT1UxMVVrK2pbYYEtwes1zKYdpYnzoZ6yPKC', //Comic app
  'KT1AaaBSo5AE6Eo8fpEN5xhCD4w3kHStafxk', //Minterpop
  'KT1EpGgjQs73QfFJs9z7m1Mxm5MTnpC2tqse', //Kalamint NFT
  'KT1A5P4ejnLix13jtadsfV9GCnXLMNnab8UT', //Kalamint token
  'KT1ViVwoVfGSCsDaxjwoovejm1aYSGz7s2TZ', //Teztopia
  'KT1BqfEQFrfx3h2wWQo7gTM1SE6FpH1Y5pqK', //Diplomats
  'KT1BA9igcUcgkMT4LEEQzwURsdMpQayfb6i4', //turtle
  'KT1PKvHNWuWDNVDtqjDha4AostLrGDu4G1jy', //Bazaar Market
  'KT1WGDVRnff4rmGzJUbdCRAJBmYt12BrPzdD', //PixelPotus
  'KT1FyaDqiMQWg7Exo7VUiXAgZbd2kCzo3d4s', //TzColors
  'KT1EVXyKLk4MSAfsSqyLVSTsRHYG9fXFHnwe', //Uanon 1
  'KT1SFDJHTVMnfvc72E4vUt4Rpy9xvGKt1xSw', //Uanon 2
  'KT1UmxSSUQ5716tRa2RLNSAkiSG6TWbzZ7GL', //SalsaDao Tacos 2
  'KT1JYWuC4eWqYkNC1Sh6BiD89vZzytVoV2Ae', //SalsaDao Tacos 3
  'KT1NvPaecvj8g7SbDs8E5s2jxbEBKHxZssP1', //SalsaDao BuildTaco
  'KT1LHHLso8zQWQWg1HUukajdxxbkGfNoHjh6', //Tezzardz
  'KT1LbLNTTPoLgpumACCBFJzBEHDiEUqNxz5C', //Art Cardz
  'KT1VbHpQmtkA3D4uEbbju26zS8C42M5AGNjZ', //PRJKTNEON
  'KT1H8sxNSgnkCeZsij4z76pkXu8BCZNvPZEx', //PRJKTNEON FILES
  'KT1PEGqt5rMmHpyaMXc8RFTFkkAUDrzSFRWk', //mclaren
  'KT1MsdyBSAMQwzvDH4jt2mxUKJvBSWZuPoRJ', //NEONZ
  'KT1SyPgtiXTaEfBuMZKviWGNHqVrBBEjvtfQ', //GOGOs
  'KT1Xf44LpwrA7oBcB3VwWTtUBP1eNRaNnWeh', //GOGOs Inventory Items
  'KT1Fxz4V3LaUcVFpvF8pAAx8G3Z4H7p7hhDg', //Hash Three Points
  'KT1CNHwTyjFrKnCstRoMftyFVwoNzF6Xxhpy', //The Moments
  'KT1HZVd9Cjc2CMe3sQvXgbxhpJkdena21pih', //randomly common skeles
  'KT1Ak8AFA54waFVMyPXNE925cUaQjFEqxuYN', //HOLLOWS
  'KT1BkStQej7MwnkWhCV2tUanETeN25zc7ADe', //TacoNFT premint tokens
  'KT1Mf8Pqn6NMt8VGuVaySohvSvQQpvcM37eZ', //TacoNFT
  'KT1DuZFNv6JwwA7kS8RXvoQiANm3L4dfn6qP', //0xC0FACE
  'KT1Wm4Cegd7wW6MYxEhg6AH5iFX48y65nWvv', //ChopSumo
  'KT1QRtkWmCKSnLDnEzJVoj2ya2Ef2mTjszwH', //FLUX
  'KT1XKUyUtRqobh5CqZzXFJW6UT5t55Sn3iT6', //New Flux City
  'KT1CwSgYmZewFazZsW348RAQYn1nthiGP3Qa', //Cyber Gecko Gang
  'KT1PNcZQkJXMQ2Mg92HG1kyrcu3auFX5pfd8', //ZIGGURATS
  'KT1AYP8jy46BJ9U17wbrvTSKsdgFiwLuvoVo', //Your Crypto Mom
  'KT1Up463qVJqtW5KF7dQZz5SsWMiS32GtBrw', //OneOf
  'KT1Fv8TsEeafDhZXsHCyxFas96YDhXpdmUmz', //GloGang
  'KT1XHyDd8ScUteYRWNocHgwZtj2BwBcoCZZo', //Cubeheads
  'KT1SioBPZ6HB4J1cL3jZYBv3WZPydxfswz4k', //AK1RA
  'KT1HVjodj7Wh1Z92vVgowZwu3PU2A6ZqbmQv', //basqubes
  'KT1KEa8z6vWXDJrVqtMrAeDVzsvxat3kHaCE', //fx(hash)
  'KT1Lk3fKhyFMVSdDGcqKKetqsVw3t5sHBXb8', //Formally Verified
  'KT1UvePjsyA1dAViNu8JMiDmDm1as1PT8ZQs', // BoomerPunks
  'KT1WLLNJ6ouSrVoAC789FniwdSnVjqGZELJa', // BoomerPunks v2
  'KT1TnVQhjxeNvLutGvzwZvYtC7vKRpwPWhc6', // Ubisoft Quartz
  'KT1AFxcFeTyrgmULfBwvo9oCSkTwi5TZb2hm', //Pixel Panda
  'KT1DuZFNv6JwwA7kS8RXvoQiANm3L4dfn6qP', //CyberKidz Club
  'KT1LaGxGqGCE7wRRP6NpZ9CSwq78y5PS6udh', //Skratz Basq
  'KT1R5SsFitVz8Zxc27NNPxeBogBFK2upfndF', //Skratz Neonz
  'KT1Pr6rNNzyRirHCiTn7CWpP7off6sH8M3HU', //Skratz Gogos
  'KT1UQhWV1Q2ArnDkWPoYgk4Kbm4dgE2BS7G8', //Skratz x Jawnz
  'KT1AWUzFdNwZn7YprZitR6Q6eUuVmfUG1HMP', //Skratz Geckos
  'KT19hJSZZYnD41xuEjEgodhAnnuLh142g8QJ', //Skratz Akira
  'KT1F9uU1xXJEzKmPvxMAdo1cMwnhnBHEB6pN', //Skratz x Tezape
  'KT1UHiGBUpbmUSV68tiGi8owFP7VWr2zBMCk', // Skratz v1
  'KT1MWKxDT6QJWgPH4Wq1TuHwW2tcvJRbuKMZ', // House Of Skratz Whitelist
  'KT1HMvdTCsK9Su7RkFKgFwQuxaqgmNdbtdLS', // House Of Skratz DAO
  'KT1CFdGeFo44DN64JgtfHF2YqrZTKg1yFXM4', // House Of Skratz
  'KT1FReMp4U1KipyH53xXUnnjtdRQZaLnQpUj', //TezApeGang
  'KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS', //Rarible
  'KT1LikBSDucbAfYLN9Uxosh4V2SNRrbQwfrJ', //Transmission Residents
  'KT1A93CFh7JhYcJFhJqwHskVPFzQJgSRmLW7', //Transmission Valley Video
  'KT1BwNPvwjYm7bLEzt93MWDTb6pE8xsac9c1', //Transmission Items
  'KT1FivwAmg7oB6mDSKnkRfvi32wL8TQAsfHz', //Transmission Merch
  'KT1P5zodzq7DtfQkdbHz65WhtQYMwmEXNitP', //Transmission Extras
  'KT1D394hqndjvTcFgrmUYBxwrzUTNtzrZ5ox', //Platypoos
  'KT1GA6KaLWpURnjvmnxB4wToErzM2EXHqrMo', //Gap
  'KT1LjmAdYQCLBjwv4S2oFkEzyHVkomAf5MrW', //Versum
  'KT1U1GDQDE7C9DNfE9iSojsKfWf5zUXdSVde', // Vessel Gen0
  'KT1Qc8xu8i72QX5S72ifPB3KJGsJqXB79eTP', // FCO REBOLLO
  'KT1V3BYwUN7FiBqADLMvMpWbz33tq1vudBh5', //Monarx
  'KT1S9VbCtVZUgAG4Q3VArvY5stu96q4CiPHZ', // Distributed Consciousness
  'KT1JYioHwutnTpYPTk5yRe9YSfCaFGWhd9MR', // Distributed Consciousness Verses
  'KT1Qi93pZoig6grMNBd7GGA7fveE2cxQK9Ei', //Verses
  'KT1DtsVHqUvKBkkypLB3x2bYd4jWdbbaHdMy', //Basqunks
  'KT1L7GvUxZH5tfa6cgZKnH6vpp2uVxnFVHKu', //Ottez
  'KT1JsJUo4PQARJB3AkstQJ8mHskoNJb29a7Z', //Xarb
  'KT1EVBE1T4GqviEopZEtEQhPEyTQvWyDqDNE', // Bunny Knights 2nd Gen
  'KT1MjS4L4HRajqNhQCdTSXgSPhW4A6gHiQo7', //Ch=mpathy Alch=my
  'KT1PooRxUckYjnWVvn9CetZxC9YeG1kkFYW5', // MekatronK9
  'KT1SRFbwhvfkXoRGqiDFVVsf5GTp16wGgtCa', //here and now 4
  'KT1Qm7MHmbdiBzoRs7xqBiqoRxw7T2cxTTJN', //mooncakes
  'KT1HJExmBz4G4kG1wx9zqs394kgRiDLWCb4m', // Fellowship of Ilmeresh
  'KT1Nf6V7fje6ELNgD6hkKfc3SXaDNVFAifEX', // Orbix360
  'KT1VdCrmZsQfuYgbQsezAHT1pXvs6zKF8xHB', //Endless Ways
  'KT1GU8M8kxFiK4HF9uzdXLUonX5JuddBsrba', //A Token Gesture
  'KT1AWoUQAuUudqpc75cGukWufbfim3GRn8h6', //Flex
  'KT1Lz7Jd6Sh1zUE66nDGS7hGnjwcyTBCiYbF', //BlueVishnu
  'KT1AjuZb9TZTastAzhbufGsYG7vVNADUFmue', //PantoneVeryPeri
  'KT1Su3fNrnABFSYMtWVDZnMbH3DzJeysAd6t', //FILMCrew
  'KT1QXngq1CCuWv5RtnuYCSvGdKGeBxsRCWvQ', //Decathlon
  'KT1D6er82V26zwV7RUxA9Wq7YyjziC52STjo' //Taqueria
];
const _BLACKLISTED_TOKEN_CONTRACTS = [];

const _MODEL_3D_WHITELIST = [
  'KT1NVvPsNDChrLRH5K2cy6Sc9r1uuUwdiZQd' /* Dogami */,
  'KT1AWoUQAuUudqpc75cGukWufbfim3GRn8h6' /* Flex */,
  'KT1Lz7Jd6Sh1zUE66nDGS7hGnjwcyTBCiYbF' /* SXSW */,
  'KT1D1XtWFoQDPtuYzbkeRJhcDgH6CDem2FkZ' /* BlueVishnu */
];

export const CONSTANTS = JSON.parse(JSON.stringify(_CONSTANTS));
export const TRUSTED_TOKEN_CONTRACTS = JSON.parse(JSON.stringify(_TRUSTED_TOKEN_CONTRACTS));
export const BLACKLISTED_TOKEN_CONTRACTS = JSON.parse(JSON.stringify(_BLACKLISTED_TOKEN_CONTRACTS));
export const MODEL_3D_WHITELIST = JSON.parse(JSON.stringify(_MODEL_3D_WHITELIST));
