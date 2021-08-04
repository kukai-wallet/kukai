// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { Constants } from './../app/interfaces';
import { CONSTANTS as _CONSTANTS } from './environment.florencenet';

export const environment = {
  production: false
};
export const CONSTANTS: Constants = _CONSTANTS;