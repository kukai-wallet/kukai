// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { Constants } from './../app/interfaces';
import { CONSTANTS as _CONSTANTS, TRUSTED_TOKEN_CONTRACTS as _TTC, BLACKLISTED_TOKEN_CONTRACTS as _BLTC } from './environment.hangzhounet';

export const environment = {
  production: false
};
export const CONSTANTS: Constants = _CONSTANTS;
export const TRUSTED_TOKEN_CONTRACTS = _TTC;
export const BLACKLISTED_TOKEN_CONTRACTS = _BLTC;
