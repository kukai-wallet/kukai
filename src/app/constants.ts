import { ContractType } from './services/token/token.service';
interface Net {
  NAME: string;
  NETWORK: string;
  CSI?: { // Conseil Server Info
    url: string;
    apiKey: string;
  };
  NODE_URL: string;
  BLOCK_EXPLORER_URL: string;
  _ASSETS: Record<string, ContractType>;
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
        'KT1HzQofKBxzfiKoMzGbkxBgjis2mWnCtbC2': {
          kind: 'FA1.2',
          category: 'finance',
          tokens: {
            0: {
              name: 'USDtz',
              symbol: 'USDTZ',
              decimals: 6,
              description: 'USDtz is a Tezos on-chain stablecoin pegged to the value of the United States Dollar.',
              imageSrc: '../../../assets/img/tokens/usdtz.png'
            }
          }
        },
        'KT1C1UcCzh5B7iTWpG2o4pPM3dTZDAc6WrNB': {
          kind: 'FA2',
          category: 'finance',
          tokens: {
            1: {
              name: 'Kukai Monk Token',
              symbol: 'KKTM',
              decimals: 6,
              description: '',
              imageSrc: '../../../assets/img/tokens/kktm.png'
            }
          }
        },
        'KT1TjdF4H8H2qzxichtEbiCwHxCRM1SVx6B7': {
          kind: 'FA1.2',
          category: 'finance',
          tokens: {
            0: {
              name: 'tzBTC',
              symbol: 'TZBTC',
              decimals: 8,
              description: 'tzBTC delivers the power of Bitcoin as a token on the Tezos blockchain.',
              imageSrc: '../../../assets/img/tokens/tzbtc.png'
            }
          }
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
      _ASSETS: {}
    };
  }
}
