interface Net {
    NAME: string;
    NETWORK: string;
    CSI?: { // Conseil Server Info
        url: string;
        apiKey: string;
    };
    NODE_URL: string;
    BLOCK_EXPLORER_URL: string;
    ASSETS: Assets;
}
type Assets = Record<string, AssetData>;
interface AssetData {
  name: string;
  symbol: string;
  kind: string;
  decimals: number;
  assetCategory: string;
  description: string;
  imageFileName: string;
}
export class Constants {
    // Select Testnet or Mainnet
    readonly NET: Net = this.carthagenet();

    private mainnet(): Net {
        return {
            NAME: 'Mainnet',
            NETWORK: 'mainnet',
            CSI: {
                url: 'https://conseil-prod.cryptonomic-infra.tech',
                apiKey: 'klassare'
            },
            NODE_URL: 'https://mainnet-tezos.giganode.io',
            BLOCK_EXPLORER_URL: 'https://tzkt.io',
            ASSETS: {}
        };
    }
    private carthagenet(): Net {
        return {
            NAME: 'Testnet / Carthage',
            NETWORK: 'carthagenet',
            NODE_URL: 'https://testnet-tezos.giganode.io',
            BLOCK_EXPLORER_URL: 'https://carthage.tzkt.io',
            ASSETS: {
              'KT1TjdF4H8H2qzxichtEbiCwHxCRM1SVx6B7' : {
                name: 'tzBTC',
                symbol: 'tzBTC',
                kind: 'FA1.2',
                decimals: 6,
                assetCategory: 'finance',
                description: 'tzBtc delivers the power of Bitcoin as a token on the Tezos blockchain.',
                imageFileName: 'tzbtc.png'
              },
              'KT1HzQofKBxzfiKoMzGbkxBgjis2mWnCtbC2' : {
                name: 'USD tez',
                symbol: 'USDtz',
                kind: 'FA1.2',
                decimals: 6,
                assetCategory: 'finance',
                description: 'USD Tez (Symbol USDtz ) is a Tezos on-chain stablecoin pegged to the value of the United States Dollar.',
                imageFileName: 'usdtz.png'
              },
              'KT1C1UcCzh5B7iTWpG2o4pPM3dTZDAc6WrNB' : {
                name: 'Kukai Monk Token',
                symbol: 'kktm',
                kind: 'FA2',
                decimals: 6,
                assetCategory: 'finance',
                description: '',
                imageFileName: 'kktm.png'
              }
            }
        };
    }
    private delphinet(): Net {
      return {
          NAME: 'Testnet / Delphi',
          NETWORK: 'delphinet',
          NODE_URL: 'https://delphinet-tezos.giganode.io/',
          BLOCK_EXPLORER_URL: 'https://delphi.tzkt.io',
          ASSETS: {}
      };
  }
}
