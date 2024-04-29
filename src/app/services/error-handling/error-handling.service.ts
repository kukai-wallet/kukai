import { Pipe, PipeTransform } from '@angular/core';
import { rpcErrors } from './rpc-errors';

interface CustomError {
  msg: string;
}

const customErrors: Record<string, CustomError> = {
  TooHighFee: {
    msg: 'Fee exceeded hard cap!'
  },
  'Timeout has occurred': {
    msg: 'Node error: Timeout has occurred! Please try again later.'
  },
  'Only one manager operation per manager per block allowed': {
    msg: 'Error while applying operation: Please try again.'
  },
  'proto.alpha.contract.balance_too_low': {
    msg: 'Not enoght tez (XTZ) to perform this operation'
  }
};

@Pipe({
  name: 'errorHandling'
})
export class ErrorHandlingService implements PipeTransform {
  transform(errorId: string, withObj?: any, location?: number): any {
    const protocol = errorId.match(/[0-9]{3}-P\w{7}/g);
    if (protocol && protocol[0]) {
      errorId = errorId.replace(protocol[0], 'alpha');
    }
    let errorMessage = '';
    console.log('ErrorHandlingService encountered errorId:', errorId);
    if (withObj) {
      console.log('withObj', withObj);
    }
    const error = customErrors[errorId] || rpcErrors[errorId] || null;
    if (errorId === 'proto.alpha.michelson_v1.script_rejected' && withObj) {
      if (withObj.string) {
        if (withObj.string.toLowerCase() === 'fa2_insufficient_balance') {
          errorMessage = 'Insufficient FA2 token balance';
        } else if (withObj.string.toLowerCase() === 'fa1.2_insufficientbalance') {
          errorMessage = 'Insufficient FA1.2 token balance';
        } else if (withObj.string.toLowerCase() === 'notenoughbalance') {
          errorMessage = 'Insufficient token balance';
        } else {
          errorMessage = `${error.msg} | ${withObj.string}`;
        }
      } else if (withObj?.int === '4' && location === 206) {
        errorMessage = 'Tokens deposited is greater than maximum tokens deposited. Please retry in a while.';
      } else {
        let jsonWith = JSON.stringify(withObj);
        if (jsonWith.length > 200) {
          jsonWith = '[...]';
          console.error('FAILWITH', withObj);
        }
        errorMessage = `${error.msg} ${jsonWith}`;
      }
      console.log(withObj);
    } else if (error) {
      errorMessage = error.msg;
    } else {
      if (errorId.indexOf('branch refused (Error:') !== -1 && errorId.indexOf('already used for contract') !== -1) {
        errorMessage =
          'Counter error: Another operation in mempool is blocking your operation. Wait for it to be included in a block or pruned from mempool (up to 60 minutes).';
      } else {
        if (errorId?.startsWith('Failed to parse the request body')) {
          const lines = errorId.split('At /kind, unexpected string instead of ');
          for (let line of lines) {
            if (line.startsWith('reveal\n  Unhandled error')) {
              return line.replace('reveal\n  ', '');
            }
          }
        } else {
          return 'Unrecognized error: ' + errorId;
        }
      }
    }
    return errorMessage;
  }
}
