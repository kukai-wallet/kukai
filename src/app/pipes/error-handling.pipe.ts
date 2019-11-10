import { Pipe, PipeTransform } from '@angular/core';

/*
    Informs users on most common errors
    RPC errors doc: http://tezos.gitlab.io/mainnet/api/errors.html
*/

@Pipe({
    name: 'errorHandling'
})
export class ErrorHandlingPipe implements PipeTransform {

    transform(errorId: string, args?: any): any {
        let errorMessage = '';
        switch (errorId) {
            case 'proto.005-PsBabyM1.InconsistentTypesTypeError': {
                // tslint:disable-next-line:max-line-length
                errorMessage = 'This is the basic type clash error, that appears in several places where the equality of two types have to be proven, it is always accompanied with another error that provides more context.';
                break;
            }
            case 'proto.005-PsBabyM1.badContractParameter': {
                // tslint:disable-next-line:max-line-length
                errorMessage = 'Either no parameter was supplied to a contract, a parameter was passed to an account, or a parameter was supplied of the wrong type';
                break;
            }
            case 'proto.005-PsBabyM1.badReturnTypeError': {
                errorMessage = 'Unexpected stack at the end of a lambda or script.';
                break;
            }
            case 'proto.005-PsBabyM1.badStackItemTypeError': {
                errorMessage = 'The type of a stack item is unexpected (this error is always accompanied by a more precise one).';
                break;
            }
            case 'proto.005-PsBabyM1.badStackTypeError': {
                errorMessage = 'The stack has an unexpected length or contents.';
                break;
            }
            case 'proto.005-PsBabyM1.baking.cannot_freeze_baking_deposit': {
                errorMessage = 'Impossible to debit the required tokens on the baker\'s contract';
                break;
            }
            case 'proto.005-PsBabyM1.baking.cannot_freeze_endorsement_deposit': {
                errorMessage = 'Impossible to debit the required tokens on the endorser\'s contract';
                break;
            }
            case 'proto.005-PsBabyM1.baking.inconsisten_endorsement': {
                errorMessage = 'The operation tries to endorse slots with distinct delegates';
                break;
            }
            case 'proto.005-PsBabyM1.baking.insufficient_proof_of_work': {
                errorMessage = 'The block\'s proof-of-work stamp is insufficient';
                break;
            }
            case 'proto.005-PsBabyM1.baking.invalid_block_signature': {
                errorMessage = 'A block was not signed with the expected private key.';
                break;
            }
            case 'proto.005-PsBabyM1.baking.invalid_fitness_gap': {
                errorMessage = 'The gap of fitness is out of bounds';
                break;
            }
            case 'proto.005-PsBabyM1.baking.invalid_signature': {
                errorMessage = 'The block\'s signature is invalid';
                break;
            }
            case 'proto.005-PsBabyM1.baking.invalid_slot': {
                errorMessage = 'The baking slot is out of bounds';
                break;
            }
            case 'proto.005-PsBabyM1.baking.timestamp_too_early': {
                errorMessage = 'The block timestamp is before the first slot for this baker at this level';
                break;
            }
            case 'proto.005-PsBabyM1.block.inconsistent_double_baking_evidence': {
                errorMessage = 'A double-baking evidence is inconsistent (two distinct delegates)';
                break;
            }
            case 'proto.005-PsBabyM1.block.inconsistent_double_endorsement_evidence': {
                errorMessage = 'A double-endorsement evidence is inconsistent (two distinct delegates)';
                break;
            }
            case 'proto.005-PsBabyM1.block.invalid_commitment': {
                errorMessage = 'The block header has invalid commitment.';
                break;
            }
            case 'proto.005-PsBabyM1.block.invalid_double_baking_evidence': {
                errorMessage = 'A double-baking evidence is inconsistent (two distinct level)';
                break;
            }
            case 'proto.005-PsBabyM1.block.invalid_double_endorsement_evidence': {
                errorMessage = 'A double-endorsement evidence is malformed';
                break;
            }
            case 'proto.005-PsBabyM1.block.multiple_revelation': {
                errorMessage = 'A manager operation should not contain more than one revelation';
                break;
            }
            case 'proto.005-PsBabyM1.block.outdated_double_baking_evidence': {
                errorMessage = 'A double-baking evidence is outdated.';
                break;
            }
            case 'proto.005-PsBabyM1.block.outdated_double_endorsement_evidence': {
                errorMessage = 'A double-endorsement evidence is outdated.';
                break;
            }
            case 'proto.005-PsBabyM1.block.too_early_double_baking_evidence': {
                errorMessage = 'A double-baking evidence is in the future';
                break;
            }
            case 'proto.005-PsBabyM1.block.too_early_double_endorsement_evidence': {
                errorMessage = 'A double-endorsement evidence is in the future';
                break;
            }
            case 'proto.005-PsBabyM1.block.unrequired_double_baking_evidence': {
                errorMessage = 'A double-baking evidence is unrequired';
                break;
            }
            case 'proto.005-PsBabyM1.block.unrequired_double_endorsement_evidence': {
                errorMessage = 'A double-endorsement evidence is unrequired';
                break;
            }
            case 'proto.005-PsBabyM1.comparableTypeExpectedTypeError': {
                errorMessage = 'A non comparable type was used in a place where only comparable types are accepted.';
                break;
            }
            case 'proto.005-PsBabyM1.context.failed_to_decode_parameter': {
                errorMessage = 'Unexpected JSON object.';
                break;
            }
            case 'proto.005-PsBabyM1.context.failed_to_parse_parameter': {
                errorMessage = 'The protocol parameters are not valid JSON.';
                break;
            }
            case 'proto.005-PsBabyM1.context.storage_error': {
                errorMessage = 'An error that should never happen unless something has been deleted or corrupted in the database.';
                break;
            }
            case 'proto.005-PsBabyM1.contract.balance_too_low': {
                errorMessage = 'An operation tried to spend more tokens than the contract has. Make sure you have enough tez available on your tz1 address to pay the transaction fees.';
                break;
            }
            case 'proto.005-PsBabyM1.contract.cannot_pay_storage_fee': {
                errorMessage = 'The storage fee is higher than the contract balance';
                break;
            }
            case 'proto.005-PsBabyM1.contract.counter_in_the_future': {
                errorMessage = 'An operation assumed a contract counter in the future';
                break;
            }
            case 'proto.005-PsBabyM1.contract.counter_in_the_past': {
                errorMessage = 'An operation assumed a contract counter in the past';
                break;
            }
            case 'proto.005-PsBabyM1.contract.empty_transaction': {
                errorMessage = 'Forbidden to credit 0&#42793; to a contract without code.';
                break;
            }
            case 'proto.005-PsBabyM1.contract.failure': {
                errorMessage = 'Unexpected contract storage error';
                break;
            }
            case 'proto.005-PsBabyM1.contract.invalid_contract_notation': {
                errorMessage = 'A malformed contract notation was given to an RPC or in a script.';
                break;
            }
            case 'proto.005-PsBabyM1.contract.manager.inconsistent_hash': {
                errorMessage = 'A revealed manager public key is inconsistent with the announced hash';
                break;
            }
            case 'proto.005-PsBabyM1.contract.manager.inconsistent_public_key': {
                errorMessage = 'A provided manager public key is different with the public key stored in the contract';
                break;
            }
            case 'proto.005-PsBabyM1.contract.manager.unregistered_delegate': {
                errorMessage = 'A contract cannot be delegated to an unregistered delegate';
                break;
            }
            case 'proto.005-PsBabyM1.contract.non_existing_contract': {
                errorMessage = 'A contract handle is not present in the context (either it never was or it has been destroyed)';
                break;
            }
            case 'proto.005-PsBabyM1.contract.previously_revealed_key': {
                errorMessage = 'One tried to revealed twice a manager public key';
                break;
            }
            case 'proto.005-PsBabyM1.contract.undelegatable_contract': {
                errorMessage = 'Tried to delegate an implicit contract or a non delegatable originated contract';
                break;
            }
            case 'proto.005-PsBabyM1.contract.unrevealed_key': {
                errorMessage = 'One tried to apply a manager operation without revealing the manager public key';
                break;
            }
            case 'proto.005-PsBabyM1.contract.unspendable_contract': {
                errorMessage = 'An operation tried to spend tokens from an unspendable contract';
                break;
            }
            case 'proto.005-PsBabyM1.delegate.already_active': {
                errorMessage = 'Useless delegate reactivation';
                break;
            }
            case 'proto.005-PsBabyM1.delegate.empty_delegate_account': {
                errorMessage = 'Cannot register a delegate when its implicit account is empty';
                break;
            }
            case 'proto.005-PsBabyM1.delegate.no_deletion': {
                errorMessage = 'Tried to unregister a delegate';
                break;
            }
            case 'proto.005-PsBabyM1.delegate.unchanged': {
                errorMessage = 'Contract already delegated to the given delegate';
                break;
            }
            case 'proto.005-PsBabyM1.duplicateMapKeys': {
                errorMessage = 'Map literals cannot contain duplicated keys';
                break;
            }
            case 'proto.005-PsBabyM1.duplicateScriptField': {
                errorMessage = 'When parsing script, a field was found more than once';
                break;
            }
            case 'proto.005-PsBabyM1.duplicateSetValuesInLiteral': {
                errorMessage = 'Set literals cannot contain duplicate elements, but a duplicae was found while parsing.';
                break;
            }
            case 'proto.005-PsBabyM1.failNotInTailPositionTypeError': {
                errorMessage = 'There is non trivial garbage code after a FAIL instruction.';
                break;
            }
            case 'proto.005-PsBabyM1.gas_exhausted.block': {
                errorMessage = 'The sum of gas consumed by all the operations in the block exceeds the hard gas limit per block';
                break;
            }
            case 'proto.005-PsBabyM1.gas_exhausted.operation': {
                errorMessage = 'A script or one of its callee took more time than the operation said it would';
                break;
            }
            case 'proto.005-PsBabyM1.gas_limit_too_high': {
                errorMessage = 'A transaction tried to exceed the hard limit on gas';
                break;
            }
            case 'proto.005-PsBabyM1.illFormedTypeTypeError': {
                errorMessage = 'The toplevel error thrown when trying to parse a type expression (always followed by more precise errors).';
                break;
            }
            case 'proto.005-PsBabyM1.illTypedContractTypeError': {
                // tslint:disable-next-line:max-line-length
                errorMessage = 'The toplevel error thrown when trying to typecheck a contract code against given input, output and storage types (always followed by more precise errors).';
                break;
            }
            case 'proto.005-PsBabyM1.illTypedDataTypeError': {
                // tslint:disable-next-line:max-line-length
                errorMessage = 'The toplevel error thrown when trying to typecheck a data expression against a given type (always followed by more precise errors).';
                break;
            }
            case 'proto.005-PsBabyM1.implicit.empty_implicit_contract': {
                errorMessage = 'No manager operations are allowed on an empty implicit contract.';
                break;
            }
            case 'proto.005-PsBabyM1.inconsistentAnnotations': {
                errorMessage = 'The annotations on two types could not be merged';
                break;
            }
            case 'proto.005-PsBabyM1.inconsistentStackLengthsTypeError': {
                errorMessage = 'A stack was of an unexpected length (this error is always in the context of a located error).';
                break;
            }
            case 'proto.005-PsBabyM1.inconsistentTypeAnnotations': {
                errorMessage = 'The two types contain annotations that do not match';
                break;
            }
            case 'proto.005-PsBabyM1.internal_operation_replay': {
                errorMessage = 'An internal operation was emitted twice by a script';
                break;
            }
            case 'proto.005-PsBabyM1.invalidArityTypeError': {
                errorMessage = 'In a script or data expression, a primitive was applied to an unsupported number of arguments.';
                break;
            }
            case 'proto.005-PsBabyM1.invalidConstantTypeError': {
                errorMessage = 'A data expression was invalid for its expected type.';
                break;
            }
            case 'proto.005-PsBabyM1.invalidContractTypeError': {
                // tslint:disable-next-line:max-line-length
                errorMessage = 'A script or data expression references a contract that does not exist or assumes a wrong type for an existing contract.';
                break;
            }
            case 'proto.005-PsBabyM1.invalidExpressionKindTypeError': {
                // tslint:disable-next-line:max-line-length
                errorMessage = 'In a script or data expression, an expression was of the wrong kind (for instance a string where only a primitive applications can appear).';
                break;
            }
            case 'proto.005-PsBabyM1.invalidIterBody': {
                errorMessage = 'The body of an ITER instruction must result in the same stack type as before the ITER.';
                break;
            }
            case 'proto.005-PsBabyM1.invalidMapBlockFail': {
                errorMessage = 'FAIL cannot be the only instruction in the body. The propper type of the return list cannot be inferred.';
                break;
            }
            case 'proto.005-PsBabyM1.invalidMapBody': {
                errorMessage = 'The body of a map block did not match the expected type';
                break;
            }
            case 'proto.005-PsBabyM1.invalidPrimitiveNameCaseTypeError': {
                errorMessage = 'In a script or data expression, a primitive name is neither uppercase, lowercase or capitalized.';
                break;
            }
            case 'proto.005-PsBabyM1.invalidPrimitiveNameTypeErro': {
                errorMessage = 'In a script or data expression, a primitive name is unknown or has a wrong case.';
                break;
            }
            case 'proto.005-PsBabyM1.invalidPrimitiveNamespaceTypeError': {
                errorMessage = 'In a script or data expression, a primitive was of the wrong namespace.';
                break;
            }
            case 'proto.005-PsBabyM1.invalidPrimitiveTypeError': {
                errorMessage = 'In a script or data expression, a primitive was unknown.';
                break;
            }
            case 'proto.005-PsBabyM1.invalid_binary_format': {
                errorMessage = 'Could not deserialize some piece of data from its binary representation';
                break;
            }
            case 'proto.005-PsBabyM1.missingScriptField': {
                errorMessage = 'When parsing script, a field was expected, but not provided';
                break;
            }
            case 'proto.005-PsBabyM1.nonce.previously_revealed': {
                errorMessage = 'Duplicated revelation for a nonce.';
                break;
            }
            case 'proto.005-PsBabyM1.nonce.too_early_revelation': {
                errorMessage = 'Nonce revelation happens before cycle end';
                break;
            }
            case 'proto.005-PsBabyM1.nonce.too_late_revelation': {
                errorMessage = 'Nonce revelation happens too late';
                break;
            }
            case 'proto.005-PsBabyM1.nonce.unexpected': {
                errorMessage = 'The provided nonce is inconsistent with the commit nonce hash.';
                break;
            }
            case 'proto.005-PsBabyM1.operation.cannot_parse': {
                errorMessage = 'The operation is ill-formed or for another protocol version';
                break;
            }
            case 'proto.005-PsBabyM1.operation.duplicate_endorsement': {
                errorMessage = 'Two endorsements received for the same slot';
                break;
            }
            case 'proto.005-PsBabyM1.operation.invalid_activation': {
                errorMessage = 'The given key has already been activated or the given key does not correspond to any preallocated contract';
                break;
            }
            case 'proto.005-PsBabyM1.operation.invalid_endorsement_level': {
                errorMessage = 'The level of an endorsement is inconsistent with the provided block hash.';
                break;
            }
            case 'proto.005-PsBabyM1.operation.invalid_signature': {
                errorMessage = 'The operation signature is ill-formed or has been made with the wrong public key';
                break;
            }
            case 'proto.005-PsBabyM1.operation.missing_signature': {
                errorMessage = 'The operation is of a kind that must be signed, but the signature is missing';
                break;
            }
            case 'proto.005-PsBabyM1.operation.wrong_activation_secret': {
                errorMessage = 'The submitted activation key does not match the registered key.';
                break;
            }
            case 'proto.005-PsBabyM1.operation.wrong_endorsement_predecessor': {
                errorMessage = 'Trying to include an endorsement in a block that is not the successor of the endorsed one';
                break;
            }
            case 'proto.005-PsBabyM1.operation.wrong_voting_period': {
                errorMessage = 'Trying to onclude a proposal or ballot meant for another voting period';
                break;
            }
            case 'proto.005-PsBabyM1.scriptOverflowRuntimeError': {
                errorMessage = 'A FAIL instruction was reached due to the detection of an overflow';
                break;
            }
            case 'proto.005-PsBabyM1.scriptRejectedRuntimeError': {
                errorMessage = 'A FAIL instruction was reached';
                break;
            }
            case 'proto.005-PsBabyM1.scriptRuntimeError': {
                errorMessage = 'Toplevel error for all runtime script errors';
                break;
            }
            case 'proto.005-PsBabyM1.seed.unknown_seed': {
                errorMessage = 'The requested seed is not available';
                break;
            }
            case 'proto.005-PsBabyM1.selfInLambda': {
                errorMessage = 'A SELF instruction was encountered in a lambda expression.';
                break;
            }
            case 'proto.005-PsBabyM1.storage_exhausted.block': {
                errorMessage = 'The sum of storage consumed by all the operations in the block exceeds the hard storage limit per block';
                break;
            }
            case 'proto.005-PsBabyM1.storage_exhausted.operation': {
                errorMessage = 'A script or one of its callee wrote more bytes than the operation said it would';
                break;
            }
            case 'proto.005-PsBabyM1.storage_limit_too_high': {
                errorMessage = 'A transaction tried to exceed the hard limit on storage';
                break;
            }
            case 'proto.005-PsBabyM1.tez.addition_overflow': {
                errorMessage = 'An addition of two tez amounts overflowed';
                break;
            }
            case 'proto.005-PsBabyM1.tez.invalid_divisor': {
                errorMessage = 'Multiplication of a tez amount by a non positive integer';
                break;
            }
            case 'proto.005-PsBabyM1.tez.multiplication_overflow': {
                errorMessage = 'A multiplication of a tez amount by an integer overflowed';
                break;
            }
            case 'proto.005-PsBabyM1.tez.negative_multiplicator': {
                errorMessage = 'Multiplication of a tez amount by a negative integer';
                break;
            }
            case 'proto.005-PsBabyM1.tez.subtraction_underflow': {
                errorMessage = 'An subtraction of two tez amounts underflowed';
                break;
            }
            case 'proto.005-PsBabyM1.too_many_internal_operations': {
                errorMessage = 'A transaction exceeded the hard limit of internal operations it can emit';
                break;
            }
            case 'proto.005-PsBabyM1.typeTooLarge': {
                errorMessage = 'An instruction generated a type larger than the limit.';
                break;
            }
            case 'proto.005-PsBabyM1.undefinedBinopTypeError': {
                errorMessage = 'A binary operation is called on operands of types over which it is not defined.';
                break;
            }
            case 'proto.005-PsBabyM1.undefinedUnopTypeError': {
                errorMessage = 'A unary operation is called on an operand of type over which it is not defined.';
                break;
            }
            case 'proto.005-PsBabyM1.undefined_operation_nonce': {
                errorMessage = 'An origination was attemped out of the scope of a manager operation';
                break;
            }
            case 'proto.005-PsBabyM1.unexpectedAnnotation': {
                errorMessage = 'A node in the syntax tree was impropperly annotated';
                break;
            }
            case 'proto.005-PsBabyM1.unexpectedBigMap': {
                // tslint:disable-next-line:max-line-length
                errorMessage = 'When parsing script, a big_map type was found somewhere else than in the left component of the toplevel storage pair.';
                break;
            }
            case 'proto.005-PsBabyM1.unexpectedOperation': {
                errorMessage = 'When parsing script, a operation type was found in the storage or parameter field.';
                break;
            }
            case 'proto.005-PsBabyM1.unknownPrimitiveNameTypeError': {
                errorMessage = 'In a script or data expression, a primitive was unknown.';
                break;
            }
            case 'proto.005-PsBabyM1.unmatchedBranchesTypeError': {
                errorMessage = 'At the join point at the end of two code branches the stacks have inconsistent lengths or contents.';
                break;
            }
            case 'proto.005-PsBabyM1.unorderedMapLiteral': {
                errorMessage = 'Map keys must be in strictly increasing order';
                break;
            }
            case 'proto.005-PsBabyM1.unorderedSetLiteral': {
                errorMessage = 'Set values must be in strictly increasing order';
                break;
            }
            case 'distributed_db.Block_hash.fetch_canceled': {
                errorMessage = 'The fetch of a Block_hash has been canceled';
                break;
            }
            case 'distributed_db.Block_hash.fetch_timeout': {
                errorMessage = 'The fetch of a Block_hash has timed out';
                break;
            }
            case 'distributed_db.Block_hash.missing': {
                errorMessage = 'Some Block_hash is missing from the distributed db';
                break;
            }
            case 'distributed_db.Operation_hash.fetch_canceled': {
                errorMessage = 'The fetch of a Operation_hash has been canceled';
                break;
            }
            case 'distributed_db.Operation_hash.fetch_timeout': {
                errorMessage = 'The fetch of a Operation_hash has timed out';
                break;
            }
            case 'distributed_db.Operation_hash.missing': {
                errorMessage = 'Some Operation_hash is missing from the distributed db';
                break;
            }
            case 'distributed_db.Protocol_hash.fetch_canceled': {
                errorMessage = 'The fetch of a Protocol_hash has been canceled';
                break;
            }
            case 'distributed_db.Protocol_hash.fetch_timeout': {
                errorMessage = 'The fetch of a Protocol_hash has timed out';
                break;
            }
            case 'distributed_db.Protocol_hash.missing': {
                errorMessage = 'Some Protocol_hash is missing from the distributed db';
                break;
            }
            case 'distributed_db.operation_hashes.fetch_canceled': {
                errorMessage = 'The fetch of a operation_hashes has been canceled';
                break;
            }
            case 'distributed_db.operation_hashes.fetch_timeout': {
                errorMessage = 'The fetch of a operation_hashes has timed out';
                break;
            }
            case 'distributed_db.operation_hashes.missing': {
                errorMessage = 'Some operation_hashes is missing from the distributed db';
                break;
            }
            case 'distributed_db.operations.fetch_canceled': {
                errorMessage = 'The fetch of a operations has been canceled';
                break;
            }
            case 'distributed_db.operations.fetch_timeout': {
                errorMessage = 'The fetch of a operations has timed out';
                break;
            }
            case 'distributed_db.operations.missing': {
                errorMessage = 'Some operations is missing from the distributed db';
                break;
            }
            case 'node.bootstrap_pipeline.invalid_locator': {
                errorMessage = 'Block locator is invalid.';
                break;
            }
            case 'node.p2p_io_scheduler.connection_closed': {
                errorMessage = 'IO error: connection with a peer is closed.';
                break;
            }
            case 'node.p2p_pool.closed_network': {
                errorMessage = 'Network is closed.';
                break;
            }
            case 'node.p2p_pool.connected': {
                errorMessage = 'Fail to connect with a peer: a connection is already established.';
                break;
            }
            case 'node.p2p_pool.connection_refused': {
                errorMessage = 'Connection was refused.';
                break;
            }
            case 'node.p2p_pool.peer_banned': {
                errorMessage = 'The peer identity you tried to connect is banned.';
                break;
            }
            case 'node.p2p_pool.pending_connection': {
                errorMessage = 'Fail to connect with a peer: a connection is already pending.';
                break;
            }
            case 'node.p2p_pool.point_banned': {
                errorMessage = 'The addr you tried to connect is banned.';
                break;
            }
            case 'node.p2p_pool.rejected': {
                errorMessage = 'Connection to peer was rejected.';
                break;
            }
            case 'node.p2p_pool.too_many_connections': {
                errorMessage = 'Too many connections.';
                break;
            }
            case 'node.p2p_socket.decipher_error': {
                errorMessage = 'An error occurred while deciphering.';
                break;
            }
            case 'node.p2p_socket.decoding_error': {
                errorMessage = 'An error occurred while decoding.';
                break;
            }
            case 'node.p2p_socket.encoding_error': {
                errorMessage = 'An error occurred while encoding.';
                break;
            }
            case 'node.p2p_socket.invalid_auth': {
                errorMessage = 'Rejected peer connection: invalid authentication.';
                break;
            }
            case 'node.p2p_socket.invalid_chunks_size': {
                errorMessage = 'Size of chunks is not valid.';
                break;
            }
            case 'node.p2p_socket.invalid_message_size': {
                errorMessage = 'The size of the message to be written is invalid.';
                break;
            }
            case 'node.p2p_socket.myself': {
                errorMessage = 'Remote peer is actually yourself.';
                break;
            }
            case 'node.p2p_socket.not_enough_proof_of_work': {
                errorMessage = 'Remote peer cannot be authenticated: not enough proof of work.';
                break;
            }
            case 'node.p2p_socket.rejected_socket_connection': {
                errorMessage = 'Rejected peer connection: rejected socket connection.';
                break;
            }
            case 'node.peer_validator.known_invalid': {
                errorMessage = 'Known invalid block found in the peer\'s chain';
                break;
            }
            case 'node.peer_validator.unknown_ancestor': {
                errorMessage = 'Unknown ancestor block found in the peer\'s chain';
                break;
            }
            case 'node.prevalidation.oversized_operation': {
                errorMessage = 'The operation size is bigger than allowed.';
                break;
            }
            case 'node.prevalidation.parse_error': {
                errorMessage = 'Raised when an operation has not been parsed correctly during prevalidation.';
                break;
            }
            case 'node.prevalidation.too_many_operations': {
                errorMessage = 'The prevalidation context is full.';
                break;
            }
            case 'node.protocol_validator.invalid_protocol': {
                errorMessage = 'Invalid protocol.';
                break;
            }
            case 'node.state.bad_data_dir': {
                // tslint:disable-next-line:max-line-length
                errorMessage = 'The data directory could not be read. This could be because it was generated with an old version of the tezos-node program. Deleting and regenerating this directory may fix the problem.';
                break;
            }
            case 'node.state.block.inconsistent_context_hash': {
                errorMessage = 'When commiting the context of a block, the announced context hash was not the one computed at commit time.';
                break;
            }
            case 'node.state.block_not_invalid': {
                errorMessage = 'The invalid block to be unmarked was not actually invalid.';
                break;
            }
            case 'node.state.unknown_chain': {
                errorMessage = 'The chain identifier could not be found in the chain identifiers table.';
                break;
            }
            case 'node.validator.inactive_chain': {
                errorMessage = 'Attempted validation of a block from an inactive chain.';
                break;
            }
            case 'raw_store.unknown': {
                errorMessage = 'Missing key in store';
                break;
            }
            case 'validator.inconsistent_operations_hash': {
                errorMessage = 'The provided list of operations is inconsistent with the block header.';
                break;
            }
            case 'validator.invalid_block': {
                errorMessage = 'Invalid block.';
                break;
            }
            case 'validator.unavailable_protocol': {
                errorMessage = 'The protocol required for validating a block is missing.';
                break;
            }
            case 'worker.prevalidator.closed': {
                errorMessage = 'An operation on a prevalidator worker could not complete before it was shut down.';
                break;
            }
            case 'worker.validator.block.closed': {
                errorMessage = 'An operation on a validator.block worker could not complete before it was shut down.';
                break;
            }
            case 'worker.validator.chain.closed': {
                errorMessage = 'An operation on a validator.chain worker could not complete before it was shut down.';
                break;
            }
            case 'worker.validator.peer.closed': {
                errorMessage = 'An operation on a validator.peer worker could not complete before it was shut down.';
                break;
            }
            case 'micheline.parse_error.annotation_exceeds_max_length': {
                errorMessage = 'While parsing a piece of Micheline source, an annotation exceeded the maximum length (255).';
                break;
            }
            case 'micheline.parse_error.empty_expression': {
                errorMessage = 'Tried to interpret an empty piece or Micheline source as a single expression.';
                break;
            }
            case 'micheline.parse_error.extra_token': {
                errorMessage = 'While parsing a piece of Micheline source, an extra semi colon or parenthesis was encountered.';
                break;
            }
            case 'micheline.parse_error.invalid_utf8_sequence': {
                errorMessage = 'While parsing a piece of Micheline source, a sequence of bytes that is not valid UTF-8 was encountered.';
                break;
            }
            case 'micheline.parse_error.misaligned_node': {
                // tslint:disable-next-line:max-line-length
                errorMessage = 'While parsing a piece of Micheline source, an expression was not aligned with its siblings of the same mother application or sequence.';
                break;
            }
            case 'micheline.parse_error.missing_break_after_number': {
                // tslint:disable-next-line:max-line-length
                errorMessage = 'While parsing a piece of Micheline source, a number was not visually separated from its follower token, leading to misreadability.';
                break;
            }
            case 'micheline.parse_error.unclosed_token': {
                errorMessage = 'While parsing a piece of Micheline source, a parenthesis or a brace was unclosed.';
                break;
            }
            case 'micheline.parse_error.undefined_escape_sequence': {
                errorMessage = 'While parsing a piece of Micheline source, an unexpected escape sequence was encountered in a string.';
                break;
            }
            case 'micheline.parse_error.unexpected_character': {
                errorMessage = 'While parsing a piece of Micheline source, an unexpected character was encountered.';
                break;
            }
            case 'micheline.parse_error.unexpected_token': {
                errorMessage = 'While parsing a piece of Micheline source, an unexpected token was encountered.';
                break;
            }
            case 'micheline.parse_error.unterminated_comment': {
                errorMessage = 'While parsing a piece of Micheline source, a commentX was not terminated.';
                break;
            }
            case 'micheline.parse_error.unterminated_integer': {
                errorMessage = 'While parsing a piece of Micheline source, an integer was not terminated.';
                break;
            }
            case 'micheline.parse_error.unterminated_string': {
                errorMessage = 'While parsing a piece of Micheline source, a string was not terminated.';
                break;
            }
            case 'michelson.macros.bas_arity': {
                errorMessage = 'A wrong number of arguments was provided to a macro';
                break;
            }
            case 'michelson.macros.sequence_expected': {
                errorMessage = 'An macro expects a sequence, but a sequence was not provided';
                break;
            }
            case 'michelson.macros.unexpected_annotation': {
                errorMessage = 'A macro had an annotation, but no annotation was permitted on this macro.';
                break;
            }
            case 'badEndorsementDelayArg': {
                errorMessage = 'invalid priority in -endorsement-delay';
                break;
            }
            case 'badMaxPriorityArg': {
                errorMessage = 'invalid priority in -max-priority';
                break;
            }
            case 'badTezArg': {
                errorMessage = 'Invalid &#42793; notation in parameter.';
                break;
            }
            case 'cli.key.invalid_uri': {
                errorMessage = 'A key has been provided with an invalid uri.';
                break;
            }
            case 'cli.signature_mismatch': {
                errorMessage = 'The signer produced an invalid signature';
                break;
            }
            case 'cli.unregistered_key_scheme': {
                errorMessage = 'A key has been provided with an unregistered scheme (no corresponding plugin)';
                break;
            }
            case 'invalid_remote_signer': {
                errorMessage = 'The provided remote signer is invalid.';
                break;
            }
            case 'signer.decoding_error': {
                errorMessage = 'Error while decoding a request to the remote signer';
                break;
            }
            case 'signer.encoding_error': {
                errorMessage = 'Error while encoding a request to the remote signer';
                break;
            }
            case 'unix_error': {
                errorMessage = 'An unhandled unix exception';
                break;
            }
            case 'utils.Timeout': {
                errorMessage = 'Timeout';
                break;
            }
            default: {
                errorMessage = 'Id not known: ' + errorId;
                break;
            }
        }

        return errorMessage;
    }

}
