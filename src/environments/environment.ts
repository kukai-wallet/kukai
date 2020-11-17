// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { Constants } from './../app/interfaces';

export const environment = {
  production: false
};
export const CONSTANTS: Constants = {
  NAME: 'Testnet / Delphi',
  NETWORK: 'delphinet',
  MAINNET: false,
  NODE_URL: 'https://delphinet-tezos.giganode.io/',
  BLOCK_EXPLORER_URL: 'https://delphi.tzkt.io'
};
