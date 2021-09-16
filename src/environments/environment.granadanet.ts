// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { Constants } from './../app/interfaces';

export const environment = {
  production: false
};
export const CONSTANTS: Constants = {
  NETWORK: 'granadanet',
  NAME: 'Testnet / Granadanet',
  TEZOS_DOMAIN: {
    CONTRACT: 'KT1Pg2i2fySptcJg3QEwvQzTUPAyoGADNSLe',
    TOP_DOMAIN: 'gra'
  },
  MAINNET: false,
  NODE_URL: 'https://api.tez.ie/rpc/granadanet',
  BLOCK_EXPLORER_URL: 'https://granadanet.tzkt.io',
  ALLOWED_EMBED_ORIGINS: [],
  HARD_LIMITS: {
    hard_gas_limit_per_operation: 1040000,
    hard_gas_limit_per_block: 5200000,
    hard_storage_limit_per_operation: 60000
  },
  CONTRACT_ALIASES: {},
  ASSETS: {},
  NFT_CONTRACT_OVERRIDES: [],
  CONTRACT_OVERRIDES: {}
};
export const TRUSTED_TOKEN_CONTRACTS = [
  'KT1RWoiiyQTd88etyJq33KvJgsLioSgngBfB',
  'KT1TzKzgaBAKiKdrnuxRY3YnYFmRTTnhx29Z',
  'KT1CwDfjEPsR1kTrgsH2EXztD9ke8Krcz8ig',
  'KT1F4ibGZGfiMVEHhyWgh1RzBRdJmtNVgkse',
  'KT1D2UEB5LNUPSyPoP3QeWpcekh25Me27HrW'
];
export const BLACKLISTED_TOKEN_CONTRACTS = []