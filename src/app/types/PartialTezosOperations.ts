import { Optional, TezosDelegationOperation, TezosOriginationOperation, TezosTransactionOperation } from '@airgap/beacon-types'

/**
 * @publicapi
 * @category Tezos
 */
export type omittedProperties = 'source' | 'fee' | 'counter'
export type optionalProperties = 'gas_limit' | 'storage_limit';

/**
 * @internalapi
 * @category Tezos
 */
type Transform<Type, OmittedKeys extends keyof Type, OptionalKeys extends keyof Type> =
  Omit<Type, OmittedKeys | OptionalKeys> & Pick<Type, OptionalKeys>

export type PartialTezosDelegationOperation = Transform<
  TezosDelegationOperation,
  omittedProperties,
  optionalProperties
>
/**
 * @internalapi
 * @category Tezos
 */
export type PartialTezosOriginationOperation = Transform<
  TezosOriginationOperation,
  omittedProperties,
  optionalProperties
>
/**
 * @internalapi
 * @category Tezos
 */
export type PartialTezosTransactionOperation = Transform<
  TezosTransactionOperation,
  omittedProperties,
  optionalProperties
>

/**
 * @publicapi
 * @category Tezos
 */
export type PartialTezosOperation =
  | PartialTezosDelegationOperation
  | PartialTezosOriginationOperation
  | PartialTezosTransactionOperation