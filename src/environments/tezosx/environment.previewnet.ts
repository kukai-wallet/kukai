// Tezos X Previewnet (Michelson interface)
// https://previewnet.tezosx.nomadic-labs.com/
// https://github.com/trilitech/tezos-x-previewnet
// Faucet: https://faucet.previewnet.tezosx.nomadic-labs.com
// Chain id: NetXY2oPPzkxUW1. Beacon / WalletConnect network type: tezosx-previewnet
import { Constants } from '../../app/interfaces';

export const environment = {
  production: false
};
const _CONSTANTS: Constants = {
  NETWORK: 'tezosx-previewnet',
  NAME: 'Tezos X Previewnet',
  TEZOS_DOMAIN: {
    TOP_DOMAINS: []
  },
  MAINNET: false,
  TEZOS_X: true,
  NODE_URL: ['https://michelson.previewnet.tezosx.nomadic-labs.com'],
  API_URL: 'https://api.previewnet.tezosx.tzkt.io/v1',
  BLOCK_EXPLORER_URL: 'https://tzkt.previewnet.tezosx.nomadic-labs.com',
  HARD_LIMITS: {
    hard_gas_limit_per_operation: 660000,
    hard_gas_limit_per_block: 660000,
    hard_storage_limit_per_operation: 60000
  },
  COST_PER_BYTE: 1,
  FEE_PARAMS: { minimalFees: 100, nanotezPerGas: 45, nanotezPerByte: 4000 }, // used only when chains/main/mempool/filter is unavailable
  ASSETS: {},
  NFT_CONTRACT_OVERRIDES: [],
  CONTRACT_OVERRIDES: {},
  FEATURE_CONTRACTS: {}
};
const _TRUSTED_TOKEN_CONTRACTS = [];

export const CONSTANTS = JSON.parse(JSON.stringify(_CONSTANTS));
export const TRUSTED_TOKEN_CONTRACTS = JSON.parse(JSON.stringify(_TRUSTED_TOKEN_CONTRACTS));
