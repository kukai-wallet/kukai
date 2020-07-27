import { Pipe, PipeTransform } from '@angular/core';

/*
    Informs users on most common errors
    RPC errors doc: http://tezos.gitlab.io/mainnet/api/errors.html
*/

@Pipe({
  name: 'errorHandling',
})
export class ErrorHandlingPipe implements PipeTransform {
  ERROR_LIST = [
    {
      msg: 'A fatal assertion failed',
      id: 'proto.alpha.assertion',
    },
    {
      msg: 'The block\'s proof-of-work stamp is insufficient',
      id: 'proto.alpha.baking.insufficient_proof_of_work',
    },
    {
      msg: 'A block was not signed with the expected private key.',
      id: 'proto.alpha.baking.invalid_block_signature',
    },
    {
      msg: 'The gap of fitness is out of bounds',
      id: 'proto.alpha.baking.invalid_fitness_gap',
    },
    {
      msg: 'The block\'s signature is invalid',
      id: 'proto.alpha.baking.invalid_signature',
    },
    {
      msg:
        'The block timestamp is before the first slot for this baker at this level',
      id: 'proto.alpha.baking.timestamp_too_early',
    },
    {
      msg: 'The operation is signed by a delegate without endorsement rights.',
      id: 'proto.alpha.baking.unexpected_endorsement',
    },
    {
      msg: 'A double-baking evidence is inconsistent (two distinct delegates)',
      id: 'proto.alpha.block.inconsistent_double_baking_evidence',
    },
    {
      msg:
        'A double-endorsement evidence is inconsistent (two distinct delegates)',
      id: 'proto.alpha.block.inconsistent_double_endorsement_evidence',
    },
    {
      msg: 'The block header has invalid commitment.',
      id: 'proto.alpha.block.invalid_commitment',
    },
    {
      msg: 'A double-baking evidence is inconsistent (two distinct level)',
      id: 'proto.alpha.block.invalid_double_baking_evidence',
    },
    {
      msg: 'A double-endorsement evidence is malformed',
      id: 'proto.alpha.block.invalid_double_endorsement_evidence',
    },
    {
      msg: 'A manager operation should not contain more than one revelation',
      id: 'proto.alpha.block.multiple_revelation',
    },
    {
      msg: 'A double-baking evidence is outdated.',
      id: 'proto.alpha.block.outdated_double_baking_evidence',
    },
    {
      msg: 'A double-endorsement evidence is outdated.',
      id: 'proto.alpha.block.outdated_double_endorsement_evidence',
    },
    {
      msg: 'A double-baking evidence is in the future',
      id: 'proto.alpha.block.too_early_double_baking_evidence',
    },
    {
      msg: 'A double-endorsement evidence is in the future',
      id: 'proto.alpha.block.too_early_double_endorsement_evidence',
    },
    {
      msg: 'A double-baking evidence is unrequired',
      id: 'proto.alpha.block.unrequired_double_baking_evidence',
    },
    {
      msg: 'A double-endorsement evidence is unrequired',
      id: 'proto.alpha.block.unrequired_double_endorsement_evidence',
    },
    {
      msg: 'Unexpected JSON object.',
      id: 'proto.alpha.context.failed_to_decode_parameter',
    },
    {
      msg: 'The protocol parameters are not valid JSON.',
      id: 'proto.alpha.context.failed_to_parse_parameter',
    },
    {
      msg:
        'An error that should never happen unless something has been deleted or corrupted in the database.',
      id: 'proto.alpha.context.storage_error',
    },
    {
      msg: 'An operation tried to spend more tokens than the contract has',
      id: 'proto.alpha.contract.balance_too_low',
    },
    {
      msg: 'The storage fee is higher than the contract balance',
      id: 'proto.alpha.contract.cannot_pay_storage_fee',
    },
    {
      msg: 'An operation assumed a contract counter in the future',
      id: 'proto.alpha.contract.counter_in_the_future',
    },
    {
      msg: 'An operation assumed a contract counter in the past',
      id: 'proto.alpha.contract.counter_in_the_past',
    },
    {
      msg: 'Forbidden to credit 0ꜩ to a contract without code.',
      id: 'proto.alpha.contract.empty_transaction',
    },
    {
      msg: 'Unexpected contract storage error',
      id: 'proto.alpha.contract.failure',
    },
    {
      msg: 'A malformed contract notation was given to an RPC or in a script.',
      id: 'proto.alpha.contract.invalid_contract_notation',
    },
    {
      msg: 'Change is not enough to consume a roll.',
      id: 'proto.alpha.contract.manager.consume_roll_change',
    },
    {
      msg:
        'A revealed manager public key is inconsistent with the announced hash',
      id: 'proto.alpha.contract.manager.inconsistent_hash',
    },
    {
      msg:
        'A provided manager public key is different with the public key stored in the contract',
      id: 'proto.alpha.contract.manager.inconsistent_public_key',
    },
    {
      msg: 'Delegate has no roll.',
      id: 'proto.alpha.contract.manager.no_roll_for_delegate',
    },
    {
      msg:
        'A snapshot of the rolls distribution does not exist for this cycle.',
      id: 'proto.alpha.contract.manager.no_roll_snapshot_for_cycle',
    },
    {
      msg: 'A contract cannot be delegated to an unregistered delegate',
      id: 'proto.alpha.contract.manager.unregistered_delegate',
    },
    {
      msg:
        'A contract handle is not present in the context (either it never was or it has been destroyed)',
      id: 'proto.alpha.contract.non_existing_contract',
    },
    {
      msg: 'One tried to revealed twice a manager public key',
      id: 'proto.alpha.contract.previously_revealed_key',
    },
    {
      msg:
        'One tried to apply a manager operation without revealing the manager public key',
      id: 'proto.alpha.contract.unrevealed_key',
    },
    {
      msg: 'An operation tried to spend tokens from an unspendable contract',
      id: 'proto.alpha.contract.unspendable_contract',
    },
    {
      msg: 'Useless delegate reactivation',
      id: 'proto.alpha.delegate.already_active',
    },
    {
      msg: 'Cannot freeze deposit when the balance is too low',
      id: 'proto.alpha.delegate.balance_too_low_for_deposit',
    },
    {
      msg: 'Cannot register a delegate when its implicit account is empty',
      id: 'proto.alpha.delegate.empty_delegate_account',
    },
    {
      msg: 'Tried to unregister a delegate',
      id: 'proto.alpha.delegate.no_deletion',
    },
    {
      msg: 'Contract already delegated to the given delegate',
      id: 'proto.alpha.delegate.unchanged',
    },
    {
      msg: 'Proposal lists cannot be empty.',
      id: 'proto.alpha.empty_proposal',
    },
    {
      msg:
        'The sum of gas consumed by all the operations in the block exceeds the hard gas limit per block',
      id: 'proto.alpha.gas_exhausted.block',
    },
    {
      msg:
        'Gas limit was not high enough to deserialize the transaction parameters or origination script code or initial storage, making the operation impossible to parse within the provided gas bounds.',
      id: 'proto.alpha.gas_exhausted.init_deserialize',
    },
    {
      msg:
        'A script or one of its callee took more time than the operation said it would',
      id: 'proto.alpha.gas_exhausted.operation',
    },
    {
      msg: 'A transaction tried to exceed the hard limit on gas',
      id: 'proto.alpha.gas_limit_too_high',
    },
    {
      msg: 'No manager operations are allowed on an empty implicit contract.',
      id: 'proto.alpha.implicit.empty_implicit_contract',
    },
    {
      msg: 'Emptying an implicit delegated account is not allowed.',
      id: 'proto.alpha.implicit.empty_implicit_delegated_contract',
    },
    {
      msg:
        'The number of endorsements must be non-negative and at most the endosers_per_block constant.',
      id: 'proto.alpha.incorrect_number_of_endorsements',
    },
    {
      msg: 'Block priority must be non-negative.',
      id: 'proto.alpha.incorrect_priority',
    },
    {
      msg: 'An internal operation was emitted twice by a script',
      id: 'proto.alpha.internal_operation_replay',
    },
    {
      msg: 'A compile-time constant was invalid for its expected form.',
      id: 'proto.alpha.invalidSyntacticConstantError',
    },
    {
      msg: 'Negative multiple of periods are not allowed.',
      id: 'proto.alpha.invalid_arg',
    },
    {
      msg:
        'Could not deserialize some piece of data from its binary representation',
      id: 'proto.alpha.invalid_binary_format',
    },
    {
      msg: 'Fitness representation should be exactly 8 bytes long.',
      id: 'proto.alpha.invalid_fitness',
    },
    {
      msg: 'Ballot provided for a proposal that is not the current one.',
      id: 'proto.alpha.invalid_proposal',
    },
    {
      msg: 'Period is negative.',
      id: 'proto.alpha.malformed_period',
    },
    {
      msg:
        'Either no parameter was supplied to a contract with a non-unit parameter type, a non-unit parameter was passed to an account, or a parameter was supplied of the wrong type',
      id: 'proto.alpha.michelson_v1.bad_contract_parameter',
    },
    {
      msg: 'Unexpected stack at the end of a lambda or script.',
      id: 'proto.alpha.michelson_v1.bad_return',
    },
    {
      msg: 'The stack has an unexpected length or contents.',
      id: 'proto.alpha.michelson_v1.bad_stack',
    },
    {
      msg:
        'The type of a stack item is unexpected (this error is always accompanied by a more precise one).',
      id: 'proto.alpha.michelson_v1.bad_stack_item',
    },
    {
      msg: 'The error was too big to be serialized with the provided gas',
      id: 'proto.alpha.michelson_v1.cannot_serialize_error',
    },
    {
      msg:
        'Argument of FAILWITH was too big to be serialized with the provided gas',
      id: 'proto.alpha.michelson_v1.cannot_serialize_failure',
    },
    {
      msg:
        'Execution trace with stacks was to big to be serialized with the provided gas',
      id: 'proto.alpha.michelson_v1.cannot_serialize_log',
    },
    {
      msg:
        'The returned storage was too big to be serialized with the provided gas',
      id: 'proto.alpha.michelson_v1.cannot_serialize_storage',
    },
    {
      msg:
        'A non comparable type was used in a place where only comparable types are accepted.',
      id: 'proto.alpha.michelson_v1.comparable_type_expected',
    },
    {
      msg:
        'A deprecated instruction usage is disallowed in newly created contracts',
      id: 'proto.alpha.michelson_v1.deprecated_instruction',
    },
    {
      msg: 'Two entrypoints have the same name.',
      id: 'proto.alpha.michelson_v1.duplicate_entrypoint',
    },
    {
      msg: 'Map literals cannot contain duplicated keys',
      id: 'proto.alpha.michelson_v1.duplicate_map_keys',
    },
    {
      msg: 'When parsing script, a field was found more than once',
      id: 'proto.alpha.michelson_v1.duplicate_script_field',
    },
    {
      msg:
        'Set literals cannot contain duplicate elements, but a duplicae was found while parsing.',
      id: 'proto.alpha.michelson_v1.duplicate_set_values_in_literal',
    },
    {
      msg: 'An entrypoint name exceeds the maximum length of 31 characters.',
      id: 'proto.alpha.michelson_v1.entrypoint_name_too_long',
    },
    {
      msg: 'There is non trivial garbage code after a FAIL instruction.',
      id: 'proto.alpha.michelson_v1.fail_not_in_tail_position',
    },
    {
      msg:
        'The toplevel error thrown when trying to parse a type expression (always followed by more precise errors).',
      id: 'proto.alpha.michelson_v1.ill_formed_type',
    },
    {
      msg:
        'The toplevel error thrown when trying to typecheck a contract code against given input, output and storage types (always followed by more precise errors).',
      id: 'proto.alpha.michelson_v1.ill_typed_contract',
    },
    {
      msg:
        'The toplevel error thrown when trying to typecheck a data expression against a given type (always followed by more precise errors).',
      id: 'proto.alpha.michelson_v1.ill_typed_data',
    },
    {
      msg: 'The annotations on two types could not be merged',
      id: 'proto.alpha.michelson_v1.inconsistent_annotations',
    },
    {
      msg:
        'The specified field does not match the field annotation in the type',
      id: 'proto.alpha.michelson_v1.inconsistent_field_annotations',
    },
    {
      msg:
        'A stack was of an unexpected length (this error is always in the context of a located error).',
      id: 'proto.alpha.michelson_v1.inconsistent_stack_lengths',
    },
    {
      msg: 'The two types contain annotations that do not match',
      id: 'proto.alpha.michelson_v1.inconsistent_type_annotations',
    },
    {
      msg:
        'This is the basic type clash error, that appears in several places where the equality of two types have to be proven, it is always accompanied with another error that provides more context.',
      id: 'proto.alpha.michelson_v1.inconsistent_types',
    },
    {
      msg:
        'In a script or data expression, a primitive was applied to an unsupported number of arguments.',
      id: 'proto.alpha.michelson_v1.invalid_arity',
    },
    {
      msg:
        'A script or data expression references a big_map that does not exist or assumes a wrong type for an existing big_map.',
      id: 'proto.alpha.michelson_v1.invalid_big_map',
    },
    {
      msg: 'A data expression was invalid for its expected type.',
      id: 'proto.alpha.michelson_v1.invalid_constant',
    },
    {
      msg:
        'A script or data expression references a contract that does not exist or assumes a wrong type for an existing contract.',
      id: 'proto.alpha.michelson_v1.invalid_contract',
    },
    {
      msg:
        'In a script or data expression, an expression was of the wrong kind (for instance a string where only a primitive applications can appear).',
      id: 'proto.alpha.michelson_v1.invalid_expression_kind',
    },
    {
      msg:
        'The body of an ITER instruction must result in the same stack type as before the ITER.',
      id: 'proto.alpha.michelson_v1.invalid_iter_body',
    },
    {
      msg:
        'FAIL cannot be the only instruction in the body. The propper type of the return list cannot be inferred.',
      id: 'proto.alpha.michelson_v1.invalid_map_block_fail',
    },
    {
      msg: 'The body of a map block did not match the expected type',
      id: 'proto.alpha.michelson_v1.invalid_map_body',
    },
    {
      msg: 'In a script or data expression, a primitive was unknown.',
      id: 'proto.alpha.michelson_v1.invalid_primitive',
    },
    {
      msg:
        'In a script or data expression, a primitive name is unknown or has a wrong case.',
      id: 'proto.alpha.michelson_v1.invalid_primitive_name',
    },
    {
      msg:
        'In a script or data expression, a primitive name is neither uppercase, lowercase or capitalized.',
      id: 'proto.alpha.michelson_v1.invalid_primitive_name_case',
    },
    {
      msg:
        'In a script or data expression, a primitive was of the wrong namespace.',
      id: 'proto.alpha.michelson_v1.invalid_primitive_namespace',
    },
    {
      msg: 'When parsing script, a field was expected, but not provided',
      id: 'proto.alpha.michelson_v1.missing_script_field',
    },
    {
      msg: 'An entrypoint was not found when calling a contract.',
      id: 'proto.alpha.michelson_v1.no_such_entrypoint',
    },
    {
      msg: 'Toplevel error for all runtime script errors',
      id: 'proto.alpha.michelson_v1.runtime_error',
    },
    {
      msg: 'A FAIL instruction was reached due to the detection of an overflow',
      id: 'proto.alpha.michelson_v1.script_overflow',
    },
    {
      msg: 'A FAILWITH instruction was reached',
      id: 'proto.alpha.michelson_v1.script_rejected',
    },
    {
      msg: 'A SELF instruction was encountered in a lambda expression.',
      id: 'proto.alpha.michelson_v1.self_in_lambda',
    },
    {
      msg: 'An instruction generated a type larger than the limit.',
      id: 'proto.alpha.michelson_v1.type_too_large',
    },
    {
      msg:
        'A binary operation is called on operands of types over which it is not defined.',
      id: 'proto.alpha.michelson_v1.undefined_binop',
    },
    {
      msg:
        'A unary operation is called on an operand of type over which it is not defined.',
      id: 'proto.alpha.michelson_v1.undefined_unop',
    },
    {
      msg: 'A node in the syntax tree was impropperly annotated',
      id: 'proto.alpha.michelson_v1.unexpected_annotation',
    },
    {
      msg:
        'When parsing script, a big_map type was found in a position where it could end up stored inside a big_map, which is forbidden for now.',
      id: 'proto.alpha.michelson_v1.unexpected_bigmap',
    },
    {
      msg:
        'When parsing script, a contract type was found in the storage or parameter field.',
      id: 'proto.alpha.michelson_v1.unexpected_contract',
    },
    {
      msg:
        'When parsing script, an operation type was found in the storage or parameter field.',
      id: 'proto.alpha.michelson_v1.unexpected_operation',
    },
    {
      msg: 'Annotations of the same kind must be grouped',
      id: 'proto.alpha.michelson_v1.ungrouped_annotations',
    },
    {
      msg: 'In a script or data expression, a primitive was unknown.',
      id: 'proto.alpha.michelson_v1.unknown_primitive_name',
    },
    {
      msg:
        'At the join point at the end of two code branches the stacks have inconsistent lengths or contents.',
      id: 'proto.alpha.michelson_v1.unmatched_branches',
    },
    {
      msg: 'Map keys must be in strictly increasing order',
      id: 'proto.alpha.michelson_v1.unordered_map_literal',
    },
    {
      msg: 'Set values must be in strictly increasing order',
      id: 'proto.alpha.michelson_v1.unordered_set_literal',
    },
    {
      msg: 'An entrypoint in the contract is not reachable.',
      id: 'proto.alpha.michelson_v1.unreachable_entrypoint',
    },
    {
      msg: 'Duplicated revelation for a nonce.',
      id: 'proto.alpha.nonce.previously_revealed',
    },
    {
      msg: 'Nonce revelation happens before cycle end',
      id: 'proto.alpha.nonce.too_early_revelation',
    },
    {
      msg: 'Nonce revelation happens too late',
      id: 'proto.alpha.nonce.too_late_revelation',
    },
    {
      msg: 'The provided nonce is inconsistent with the committed nonce hash.',
      id: 'proto.alpha.nonce.unexpected',
    },
    {
      msg: 'The operation is ill-formed or for another protocol version',
      id: 'proto.alpha.operation.cannot_parse',
    },
    {
      msg: 'Two endorsements received from same delegate',
      id: 'proto.alpha.operation.duplicate_endorsement',
    },
    {
      msg:
        'The given key and secret do not correspond to any existing preallocated contract',
      id: 'proto.alpha.operation.invalid_activation',
    },
    {
      msg:
        'The level of an endorsement is inconsistent with the provided block hash.',
      id: 'proto.alpha.operation.invalid_endorsement_level',
    },
    {
      msg:
        'The operation signature is ill-formed or has been made with the wrong public key',
      id: 'proto.alpha.operation.invalid_signature',
    },
    {
      msg:
        'The operation is of a kind that must be signed, but the signature is missing',
      id: 'proto.alpha.operation.missing_signature',
    },
    {
      msg:
        'The block being validated does not include the required minimum number of endorsements for this priority.',
      id: 'proto.alpha.operation.not_enought_endorsements_for_priority',
    },
    {
      msg:
        'Trying to include an endorsement in a block that is not the successor of the endorsed one',
      id: 'proto.alpha.operation.wrong_endorsement_predecessor',
    },
    {
      msg:
        'Trying to onclude a proposal or ballot meant for another voting period',
      id: 'proto.alpha.operation.wrong_voting_period',
    },
    {
      msg: 'The requested seed is not available',
      id: 'proto.alpha.seed.unknown_seed',
    },
    {
      msg:
        'A script or one of its callee wrote more bytes than the operation said it would',
      id: 'proto.alpha.storage_exhausted.operation',
    },
    {
      msg: 'A transaction tried to exceed the hard limit on storage',
      id: 'proto.alpha.storage_limit_too_high',
    },
    {
      msg: 'An addition of two tez amounts overflowed',
      id: 'proto.alpha.tez.addition_overflow',
    },
    {
      msg: 'Multiplication of a tez amount by a non positive integer',
      id: 'proto.alpha.tez.invalid_divisor',
    },
    {
      msg: 'A multiplication of a tez amount by an integer overflowed',
      id: 'proto.alpha.tez.multiplication_overflow',
    },
    {
      msg: 'Multiplication of a tez amount by a negative integer',
      id: 'proto.alpha.tez.negative_multiplicator',
    },
    {
      msg: 'An subtraction of two tez amounts underflowed',
      id: 'proto.alpha.tez.subtraction_underflow',
    },
    {
      msg: 'Overflow when adding timestamps.',
      id: 'proto.alpha.timestamp_add',
    },
    {
      msg: 'Substracting timestamps resulted in negative period.',
      id: 'proto.alpha.timestamp_sub',
    },
    {
      msg:
        'A transaction exceeded the hard limit of internal operations it can emit',
      id: 'proto.alpha.too_many_internal_operations',
    },
    {
      msg: 'The delegate reached the maximum number of allowed proposals.',
      id: 'proto.alpha.too_many_proposals',
    },
    {
      msg:
        'The delegate provided for the ballot is not in the voting listings.',
      id: 'proto.alpha.unauthorized_ballot',
    },
    {
      msg:
        'The delegate provided for the proposal is not in the voting listings.',
      id: 'proto.alpha.unauthorized_proposal',
    },
    {
      msg:
        'An origination was attemped out of the scope of a manager operation',
      id: 'proto.alpha.undefined_operation_nonce',
    },
    {
      msg: 'Ballot recorded outside of a voting period.',
      id: 'proto.alpha.unexpected_ballot',
    },
    {
      msg: 'Level must be non-negative.',
      id: 'proto.alpha.unexpected_level',
    },
    {
      msg: 'Nonce length is incorrect.',
      id: 'proto.alpha.unexpected_nonce_length',
    },
    {
      msg: 'Proposal recorded outside of a proposal period.',
      id: 'proto.alpha.unexpected_proposal',
    },
    {
      msg: 'Block locator is invalid.',
      id: 'node.bootstrap_pipeline.invalid_locator',
    },
    {
      msg: 'Block locator is too short.',
      id: 'node.bootstrap_pipeline.too_short_locator',
    },
    {
      msg: 'IO error: connection with a peer is closed.',
      id: 'node.p2p_io_scheduler.connection_closed',
    },
    {
      msg: 'Fail to connect with a peer: a connection is already established.',
      id: 'node.p2p_pool.connected',
    },
    {
      msg: 'Connection was refused.',
      id: 'node.p2p_pool.connection_refused',
    },
    {
      msg: 'The peer identity you tried to connect is banned.',
      id: 'node.p2p_pool.peer_banned',
    },
    {
      msg: 'Fail to connect with a peer: a connection is already pending.',
      id: 'node.p2p_pool.pending_connection',
    },
    {
      msg: 'The address you tried to connect is banned.',
      id: 'node.p2p_pool.point_banned',
    },
    {
      msg: 'Node is in private mode.',
      id: 'node.p2p_pool.private_mode',
    },
    {
      msg: 'Connection to peer was rejected by us.',
      id: 'node.p2p_pool.rejected',
    },
    {
      msg: 'Too many connections.',
      id: 'node.p2p_pool.too_many_connections',
    },
    {
      msg: 'An error occurred while deciphering.',
      id: 'node.p2p_socket.decipher_error',
    },
    {
      msg: 'An error occurred while decoding.',
      id: 'node.p2p_socket.decoding_error',
    },
    {
      msg: 'An error occurred while encoding.',
      id: 'node.p2p_socket.encoding_error',
    },
    {
      msg: 'Rejected peer connection: invalid authentication.',
      id: 'node.p2p_socket.invalid_auth',
    },
    {
      msg: 'Size of chunks is not valid.',
      id: 'node.p2p_socket.invalid_chunks_size',
    },
    {
      msg: 'The size of the message to be written is invalid.',
      id: 'node.p2p_socket.invalid_message_size',
    },
    {
      msg: 'Remote peer is actually yourself.',
      id: 'node.p2p_socket.myself',
    },
    {
      msg: 'Remote peer cannot be authenticated: not enough proof of work.',
      id: 'node.p2p_socket.not_enough_proof_of_work',
    },
    {
      msg:
        'Rejected peer connection: The peer rejected the socket connection by Nack with a list of alternative peers.',
      id: 'node.p2p_socket.rejected_by_nack',
    },
    {
      msg:
        'Rejected peer connection: rejected socket connection as we have no common network protocol with the peer.',
      id: 'node.p2p_socket.rejected_no_common_protocol',
    },
    {
      msg: 'Rejected peer connection: rejected socket connection.',
      id: 'node.p2p_socket.rejected_socket_connection',
    },
    {
      msg: 'Rejecting peer connection with motive.',
      id: 'node.p2p_socket.rejecting_incoming',
    },
    {
      msg: 'Known invalid block found in the peer\'s chain',
      id: 'node.peer_validator.known_invalid',
    },
    {
      msg: 'Unknown ancestor block found in the peer\'s chain',
      id: 'node.peer_validator.unknown_ancestor',
    },
    {
      msg: 'The block was annotated with a time too far in the future.',
      id: 'node.prevalidation.future_block_header',
    },
    {
      msg: 'The operation size is bigger than allowed.',
      id: 'node.prevalidation.oversized_operation',
    },
    {
      msg:
        'Raised when an operation has not been parsed correctly during prevalidation.',
      id: 'node.prevalidation.parse_error',
    },
    {
      msg: 'The prevalidation context is full.',
      id: 'node.prevalidation.too_many_operations',
    },
    {
      msg: 'Invalid protocol.',
      id: 'node.protocol_validator.invalid_protocol',
    },
    {
      msg:
        'The data directory could not be read. This could be because it was generated with an old version of the tezos-node program. Deleting and regenerating this directory may fix the problem.',
      id: 'node.state.bad_data_dir',
    },
    {
      msg:
        'When commiting the context of a block, the announced context hash was not the one computed at commit time.',
      id: 'node.state.block.inconsistent_context_hash',
    },
    {
      msg: 'The invalid block to be unmarked was not actually invalid.',
      id: 'node.state.block_not_invalid',
    },
    {
      msg:
        'The chain identifier could not be found in the chain identifiers table.',
      id: 'node.state.unknown_chain',
    },
    {
      msg:
        'The block belongs to a branch that is not compatible with the current checkpoint.',
      id: 'node.validator.checkpoint_error',
    },
    {
      msg: 'Attempted validation of a block from an inactive chain.',
      id: 'node.validator.inactive_chain',
    },
    {
      msg: 'Incorrect history mode switch.',
      id: 'node_config_file.incorrect_history_mode_switch',
    },
    {
      msg: 'Missing key in store',
      id: 'raw_store.unknown',
    },
    {
      msg:
        'The provided list of operations is inconsistent with the block header.',
      id: 'validator.inconsistent_operations_hash',
    },
    {
      msg: 'Invalid block.',
      id: 'validator.invalid_block',
    },
    {
      msg: 'Missing test protocol when forking the test chain',
      id: 'validator.missing_test_protocol',
    },
    {
      msg: 'The protocol required for validating a block is missing.',
      id: 'validator.unavailable_protocol',
    },
    {
      msg: 'Failed to validate block using exteranl validation process.',
      id: 'validator.validation_process_failed',
    },
    {
      msg:
        'An operation on a worker could not complete before it was shut down.',
      id: 'worker.closed',
    },
    {
      msg:
        'While parsing a piece of Micheline source, an annotation exceeded the maximum length (255).',
      id: 'micheline.parse_error.annotation_exceeds_max_length',
    },
    {
      msg:
        'Tried to interpret an empty piece or Micheline source as a single expression.',
      id: 'micheline.parse_error.empty_expression',
    },
    {
      msg:
        'While parsing a piece of Micheline source, an extra semi colon or parenthesis was encountered.',
      id: 'micheline.parse_error.extra_token',
    },
    {
      msg:
        'While parsing a piece of Micheline source, a sequence of bytes that is not valid UTF-8 was encountered.',
      id: 'micheline.parse_error.invalid_utf8_sequence',
    },
    {
      msg:
        'While parsing a piece of Micheline source, an expression was not aligned with its siblings of the same mother application or sequence.',
      id: 'micheline.parse_error.misaligned_node',
    },
    {
      msg:
        'While parsing a piece of Micheline source, a number was not visually separated from its follower token, leading to misreadability.',
      id: 'micheline.parse_error.missing_break_after_number',
    },
    {
      msg:
        'While parsing a piece of Micheline source, the length of a byte sequence (0x...) was not a multiple of two, leaving a trailing half byte.',
      id: 'micheline.parse_error.odd_lengthed_bytes',
    },
    {
      msg:
        'While parsing a piece of Micheline source, a parenthesis or a brace was unclosed.',
      id: 'micheline.parse_error.unclosed_token',
    },
    {
      msg:
        'While parsing a piece of Micheline source, an unexpected escape sequence was encountered in a string.',
      id: 'micheline.parse_error.undefined_escape_sequence',
    },
    {
      msg:
        'While parsing a piece of Micheline source, an unexpected character was encountered.',
      id: 'micheline.parse_error.unexpected_character',
    },
    {
      msg:
        'While parsing a piece of Micheline source, an unexpected token was encountered.',
      id: 'micheline.parse_error.unexpected_token',
    },
    {
      msg:
        'While parsing a piece of Micheline source, a commentX was not terminated.',
      id: 'micheline.parse_error.unterminated_comment',
    },
    {
      msg:
        'While parsing a piece of Micheline source, an integer was not terminated.',
      id: 'micheline.parse_error.unterminated_integer',
    },
    {
      msg:
        'While parsing a piece of Micheline source, a string was not terminated.',
      id: 'micheline.parse_error.unterminated_string',
    },
    {
      msg: 'Wrong hash given',
      id: 'Bad_hash',
    },
    {
      msg: 'The context checkout failed using a given hash',
      id: 'Block_validator_process.failed_to_checkout_context',
    },
    {
      msg: 'Cannot reconstruct',
      id: 'CannotReconstruct',
    },
    {
      msg: 'Cannot find context corresponding to hash',
      id: 'Context_not_found',
    },
    {
      msg: 'The imported block is not the expected one.',
      id: 'InconsistentImportedBlock',
    },
    {
      msg: 'The operations given do not match their hashes.',
      id: 'InconsistentOperationHashes',
    },
    {
      msg: 'The data provided by the snapshot is inconsistent',
      id: 'Inconsistent_snapshot_data',
    },
    {
      msg: 'Error while opening snapshot file',
      id: 'Inconsistent_snapshot_file',
    },
    {
      msg: 'Invalid specification of block to import',
      id: 'InvalidBlockSpecification',
    },
    {
      msg: 'The version of the snapshot to import is not valid',
      id: 'Invalid_snapshot_version',
    },
    {
      msg: 'Mandatory data missing while reaching end of snapshot file.',
      id: 'Missing_snapshot_data',
    },
    {
      msg:
        'RPC lookup failed. Block has been pruned and requested data deleted.',
      id: 'RPC_context.Gone',
    },
    {
      msg:
        'RPC lookup failed. No RPC exists at the URL or the RPC tried to access non-existent data.',
      id: 'RPC_context.Not_found',
    },
    {
      msg: 'Internal error while restoring the context',
      id: 'Restore_context_failure',
    },
    {
      msg: 'The imported snapshot is malformed.',
      id: 'SnapshotImportFailure',
    },
    {
      msg: 'Failed to read file',
      id: 'System_read_error',
    },
    {
      msg: 'The validator failed because of a system error',
      id: 'Validator_process.system_error_while_validating',
    },
    {
      msg: 'Cannot write in file for context dump',
      id: 'Writing_error',
    },
    {
      msg: 'The block to export in the snapshot is not valid.',
      id: 'WrongBlockExport',
    },
    {
      msg: 'Wrong protocol hash',
      id: 'WrongProtocolHash',
    },
    {
      msg: 'Snapshot exports is not compatible with the current configuration.',
      id: 'WrongSnapshotExport',
    },
    {
      msg: 'A fatal assertion failed',
      id: 'assertion',
    },
    {
      msg: 'A promise was unexpectedly canceled',
      id: 'canceled',
    },
    {
      msg: 'A key has been provided with an invalid uri.',
      id: 'cli.key.invalid_uri',
    },
    {
      msg: 'The signer produced an invalid signature',
      id: 'cli.signature_mismatch',
    },
    {
      msg:
        'A key has been provided with an unregistered scheme (no corresponding plugin)',
      id: 'cli.unregistered_key_scheme',
    },
    {
      msg:
        'The byte sequence references a multisig counter that does not match the one currently stored in the given multisig contract',
      id: 'client.alpha.Bad deserialized counter',
    },
    {
      msg:
        'When trying to deserialise an action from a sequence of bytes, we got an expression that does not correspond to a known multisig action',
      id: 'client.alpha.actionDeserialisation',
    },
    {
      msg:
        'When trying to deserialise an action from a sequence of bytes, we got an action for another multisig contract',
      id: 'client.alpha.badDeserializedContract',
    },
    {
      msg: 'invalid duration in -endorsement-delay',
      id: 'client.alpha.badEndorsementDelayArg',
    },
    {
      msg: 'invalid priority in -max-priority',
      id: 'client.alpha.badMaxPriorityArg',
    },
    {
      msg: 'invalid duration in -max-waiting-time',
      id: 'client.alpha.badMaxWaitingTimeArg',
    },
    {
      msg: 'invalid fee threshold in -fee-threshold',
      id: 'client.alpha.badMinimalFeesArg',
    },
    {
      msg: 'invalid number of levels in -preserved-levels',
      id: 'client.alpha.badPreservedLevelsArg',
    },
    {
      msg: 'Invalid ꜩ notation in parameter.',
      id: 'client.alpha.badTezArg',
    },
    {
      msg:
        'When trying to deserialise an action from a sequence of bytes, we got an error',
      id: 'client.alpha.bytesDeserialisation',
    },
    {
      msg:
        'A multisig command has referenced a scriptless smart contract instead of a multisig smart contract.',
      id: 'client.alpha.contractHasNoScript',
    },
    {
      msg:
        'A multisig command has referenced a smart contract without storage instead of a multisig smart contract.',
      id: 'client.alpha.contractHasNoStorage',
    },
    {
      msg:
        'A multisig command has referenced a smart contract whose storage is of a different shape than the expected one.',
      id: 'client.alpha.contractHasUnexpectedStorage',
    },
    {
      msg:
        'Attempt to get the code of a contract failed because it has nocode. No scriptless contract should remain.',
      id: 'client.alpha.contractWithoutCode',
    },
    {
      msg:
        'A signature was given for a multisig contract that matched none of the public keys of the contract signers',
      id: 'client.alpha.invalidSignature',
    },
    {
      msg: 'A wrong number of arguments was provided to a macro',
      id: 'client.alpha.michelson.macros.bas_arity',
    },
    {
      msg: 'An macro expects a sequence, but a sequence was not provided',
      id: 'client.alpha.michelson.macros.sequence_expected',
    },
    {
      msg:
        'A macro had an annotation, but no annotation was permitted on this macro.',
      id: 'client.alpha.michelson.macros.unexpected_annotation',
    },
    {
      msg: 'A multisig threshold should be a positive number',
      id: 'client.alpha.nonPositiveThreshold',
    },
    {
      msg:
        'A multisig command has referenced a smart contract whose script is not one of the known multisig contract scripts.',
      id: 'client.alpha.notASupportedMultisigContract',
    },
    {
      msg:
        'To run an action on a multisig contract, you should provide at least as many signatures as indicated by the threshold stored in the multisig contract.',
      id: 'client.alpha.notEnoughSignatures',
    },
    {
      msg:
        'The given threshold is higher than the number of keys, this would lead to a frozen multisig contract',
      id: 'client.alpha.thresholdTooHigh',
    },
    {
      msg: 'Cannot recover from a corrupted context.',
      id: 'context.non_recoverable_context',
    },
    {
      msg: '<gf>context_dump.read.cannot_open',
    },
    {
      msg: '<gf>context_dump.read.suspicious',
    },
    {
      msg: '<gf>context_dump.write.cannot_open',
    },
    {
      msg: 'Exception safely wrapped in an error',
      id: 'failure',
    },
    {
      msg: 'Activation of an Internal Event SINK with an URI failed',
      id: 'internal-event-activation-error',
    },
    {
      msg: 'The raw context extraction depth argument must be positive.',
      id: 'raw_context.invalid_depth',
    },
    {
      msg: 'No protocol was registered with the requested hash.',
      id: 'registered_protocol.unregistered_protocol',
    },
    {
      msg: 'The fetch of a Operation_hash has been canceled',
      id: 'requester.Operation_hash.fetch_canceled',
    },
    {
      msg: 'The fetch of a Operation_hash has timed out',
      id: 'requester.Operation_hash.fetch_timeout',
    },
    {
      msg: 'Some Operation_hash is missing from the requester',
      id: 'requester.Operation_hash.missing',
    },
    {
      msg: 'The fetch of a Protocol_hash has been canceled',
      id: 'requester.Protocol_hash.fetch_canceled',
    },
    {
      msg: 'The fetch of a Protocol_hash has timed out',
      id: 'requester.Protocol_hash.fetch_timeout',
    },
    {
      msg: 'Some Protocol_hash is missing from the requester',
      id: 'requester.Protocol_hash.missing',
    },
    {
      msg: 'The fetch of a block_hash has been canceled',
      id: 'requester.block_hash.fetch_canceled',
    },
    {
      msg: 'The fetch of a block_hash has timed out',
      id: 'requester.block_hash.fetch_timeout',
    },
    {
      msg: 'Some block_hash is missing from the requester',
      id: 'requester.block_hash.missing',
    },
    {
      msg: 'The fetch of a operation_hashes has been canceled',
      id: 'requester.operation_hashes.fetch_canceled',
    },
    {
      msg: 'The fetch of a operation_hashes has timed out',
      id: 'requester.operation_hashes.fetch_timeout',
    },
    {
      msg: 'Some operation_hashes is missing from the requester',
      id: 'requester.operation_hashes.missing',
    },
    {
      msg: 'The fetch of a operations has been canceled',
      id: 'requester.operations.fetch_canceled',
    },
    {
      msg: 'The fetch of a operations has timed out',
      id: 'requester.operations.fetch_timeout',
    },
    {
      msg: 'Some operations is missing from the requester',
      id: 'requester.operations.missing',
    },
    {
      msg: 'Error while decoding a remote signer message',
      id: 'signer.decoding_error',
    },
    {
      msg: 'Error while encoding a remote signer message',
      id: 'signer.encoding_error',
    },
    {
      msg: 'Block not found',
      id: 'state.block.contents_not_found',
    },
    {
      msg: 'Block not found',
      id: 'state.block.not_found',
    },
    {
      msg: 'Unix System_info failure',
      id: 'unix.system_info',
    },
    {
      msg: 'An unhandled unix exception',
      id: 'unix_error',
    },
    {
      msg: 'Canceled',
      id: 'utils.Canceled',
    },
    {
      msg: 'Timeout',
      id: 'utils.Timeout',
    },
    {
      msg: 'Fee exceeded hard cap!',
      id: 'TooHighFee'
    }
  ];
  transform(errorId: string): any {
    errorId = errorId.replace('006-PsCARTHA', 'alpha');
    let errorMessage = '';
    const index = this.ERROR_LIST.findIndex((s) => s.id === errorId);
    console.log(index);
    if (index !== -1) {
      return this.ERROR_LIST[index].msg;
    } else {
      if (
        errorId.indexOf('branch refused (Error:') !== -1 &&
        errorId.indexOf('already used for contract') !== -1
      ) {
        errorMessage =
          'Counter error: Another operation in mempool is blocking your operation. Wait for it to be included in a block or pruned from mempool (up to 60 minutes).';
      } else {
        errorMessage = 'Unrecognized error: ' + errorId;
      }
    }
    return errorMessage;
  }
}
