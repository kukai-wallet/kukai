import { Constants } from './../app/interfaces';
import {
  CONSTANTS as _CONSTANTS,
  TRUSTED_TOKEN_CONTRACTS as _TTC,
  BLACKLISTED_TOKEN_CONTRACTS as _BLTC,
  MODEL_3D_WHITELIST as _M3DW
} from './environment.ghostnet';

export const environment = {
  production: false
};
export const CONSTANTS: Constants = _CONSTANTS;
export const TRUSTED_TOKEN_CONTRACTS = _TTC;
export const BLACKLISTED_TOKEN_CONTRACTS = _BLTC;
export const MODEL_3D_WHITELIST = _M3DW;
