import { Constants } from './../app/interfaces';
import {
  CONSTANTS as _CONSTANTS,
  TRUSTED_TOKEN_CONTRACTS as _TTC
} from './environment.mainnet';

export const environment = {
  production: true
};
export const CONSTANTS: Constants = _CONSTANTS;
export const TRUSTED_TOKEN_CONTRACTS = _TTC;
