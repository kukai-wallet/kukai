interface Net {
  NAME: string;
  NETWORK: string;
  CSI?: { // Conseil Server Info
    url: string;
    apiKey: string;
  };
  NODE_URL: string;
  BLOCK_EXPLORER_URL: string;
  _ASSETS: Tokens;
  //TOKEN: Token;
}
export type Tokens = Record<string, TokenContract>;
export type TokenContract = FA12 | FA2;
export interface FA12 extends FA {
  kind: 'FA1.2',
  category: string,
  asset: AssetData
}
export interface FA {
  kind: string,
  category: string,
  asset: AssetData | Record<number, AssetData>
}
export interface FA2 extends FA {
  kind: 'FA2',
  category: string,
  asset: Record<number, AssetData>
}
export interface AssetData {
  name: string;
  symbol: string;
  decimals: number;
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
      _ASSETS: {}
    };
  }
  private carthagenet(): Net {
    return {
      NAME: 'Testnet / Carthage',
      NETWORK: 'carthagenet',
      NODE_URL: 'https://testnet-tezos.giganode.io',
      BLOCK_EXPLORER_URL: 'https://carthage.tzkt.io',
      _ASSETS: {
        'KT1TjdF4H8H2qzxichtEbiCwHxCRM1SVx6B7': {
          kind: 'FA1.2',
          category: 'finance',
          asset: {
            name: 'tzBTC',
            symbol: 'tzBTC',
            decimals: 6,
            description: 'tzBtc delivers the power of Bitcoin as a token on the Tezos blockchain.',
            imageFileName: 'tzbtc.png'
          }
        },
        'KT1HzQofKBxzfiKoMzGbkxBgjis2mWnCtbC2': {
          kind: 'FA1.2',
          category: 'finance',
          asset: {
            name: 'USD tez',
            symbol: 'USDtz',
            decimals: 6,
            description: 'USD Tez (Symbol USDtz ) is a Tezos on-chain stablecoin pegged to the value of the United States Dollar.',
            imageFileName: 'usdtz.png'
          }
        },
        'KT1C1UcCzh5B7iTWpG2o4pPM3dTZDAc6WrNB': {
          kind: 'FA2',
          category: 'finance',
          asset: {
            1: {
              name: 'Kukai Monk Token',
              symbol: 'kktm',
              decimals: 6,
              description: '',
              imageFileName: 'kktm.png'
            }
          }
        }
      }
    }
  }
  private delphinet(): Net {
    return {
      NAME: 'Testnet / Delphi',
      NETWORK: 'delphinet',
      NODE_URL: 'https://delphinet-tezos.giganode.io/',
      BLOCK_EXPLORER_URL: 'https://delphi.tzkt.io',
      _ASSETS: {}
    };
  }
}
