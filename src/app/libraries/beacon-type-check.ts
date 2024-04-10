import { assertMichelsonData } from '@taquito/michel-codec';
import {
  PartialTezosDelegationOperation,
  PartialTezosTransactionOperation,
  PartialTezosOriginationOperation,
  PartialTezosOperation
} from '../types/PartialTezosOperations';

/*
  For untrusted external requests (Beacon or WC2) we:
  1. Sanitize
  2. Normalize
  3. Type Check
*/

function sanitizeOperations(operations: any[]): any[] {
  let sanitizedOperations: PartialTezosOperation[] = [];
  const others = ['kind', 'gas_limit', 'storage_limit'];
  const allowedProperties = {
    transaction: ['amount', 'destination', 'parameters', ...others],
    delegation: ['delegate', ...others],
    origination: ['balance', 'script', ...others]
  };
  for (const op of operations) {
    const allowedList = allowedProperties[op?.kind] ?? null;
    if (allowedList) {
      const sanitizedOperation: PartialTezosOperation = Object.fromEntries(
        Object.entries(op).filter(([key]) => allowedList.includes(key))
      ) as PartialTezosOperation;
      sanitizedOperations.push(sanitizedOperation);
    } else {
      throw new Error(`Unsupported operation kind: '${op?.kind}'`);
    }
  }
  return sanitizedOperations;
}

function normalizeOperations(operations: any[]): any[] {
  let isInt = (n: string): boolean => {
    return /^\d+$/.test(n);
  };
  for (const op of operations) {
    if (op.gas_limit && (typeof op.gas_limit !== 'string' || !isInt(op.gas_limit))) {
      delete op.gas_limit;
    } else if (op.storage_limit && (typeof op.storage_limit !== 'string' || !isInt(op.storage_limit))) {
      delete op.storage_limit;
    }
  }
  return operations;
}

function isPartialTezosOperation(obj: any): obj is PartialTezosOperation {
  return isPartialTezosTransactionOperation(obj) || isPartialTezosOriginationOperation(obj) || isPartialTezosDelegationOperation(obj);
}

function checkOptionalProperties(obj: any): boolean {
  return (obj.gas_limit === undefined || typeof obj.gas_limit === 'string') && (obj.storage_limit === undefined || typeof obj.storage_limit === 'string');
}

function isPartialTezosOriginationOperation(obj: any): obj is PartialTezosOriginationOperation {
  return (
    obj &&
    obj.kind === 'origination' &&
    obj.balance !== undefined &&
    typeof obj.balance === 'string' &&
    obj.script !== undefined &&
    (!obj.delegate || typeof obj.delegate === 'string') &&
    checkOptionalProperties(obj)
  );
}

function isPartialTezosDelegationOperation(obj: any): obj is PartialTezosDelegationOperation {
  return obj && obj.kind === 'delegation' && (obj.delegate === undefined || typeof obj.delegate === 'string') && checkOptionalProperties(obj);
}

function isPartialTezosTransactionOperation(obj: any): obj is PartialTezosTransactionOperation {
  if (!obj) {
    return false;
  }
  let parametersResult = true;
  if (obj.parameters) {
    try {
      if (!obj.parameters.value || !obj.parameters.entrypoint) {
        console.warn('A transaction with parameters should have a value and an entrypoint.');
        return false;
      }
      parametersResult = assertMichelsonData(obj.parameters.value);
    } catch (e) {
      parametersResult = false;
    }
  }
  return parametersResult && obj.kind === 'transaction' && obj.amount !== undefined && obj.destination !== undefined && checkOptionalProperties(obj);
}

function shouldHandleOperations(operations: any, modalName: string): boolean {
  if (operations?.length && operations.every(isPartialTezosOperation)) {
    const modalHandler = ((ops): string => {
      if (ops?.length === 1 && ops[0].kind === 'delegation') {
        return 'delegate-confirm';
      } else if (ops.every((op) => op.kind === 'transaction')) {
        return 'send';
      }
      return 'operation';
    })(operations);
    if (modalHandler === modalName) {
      return true;
    }
  }
  return false;
}

export { sanitizeOperations, normalizeOperations, isPartialTezosOperation, shouldHandleOperations };
