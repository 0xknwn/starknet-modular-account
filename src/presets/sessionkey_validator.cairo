// SPDX-License-Identifier: MIT

#[starknet::contract]
mod SessionKeyValidator {
    use smartr::module::{ValidatorComponent, IValidator};
    use openzeppelin::account::utils::{is_valid_stark_signature};
    use openzeppelin::account::utils::{MIN_TRANSACTION_VERSION, QUERY_VERSION, QUERY_OFFSET};
    use openzeppelin::introspection::src5::SRC5Component;
    use starknet::{get_caller_address, get_contract_address};
    use smartr::account::AccountComponent;
    use smartr::account::{core_validator_felt, core_validator};
    use smartr::message::hash_auth_message;
    use starknet::class_hash::ClassHash;
    use starknet::account::Call;
    use starknet::get_tx_info;
    use core::traits::Into;
    use starknet::ContractAddress;
    use smartr::module::{IValidatorDispatcherTrait, IValidatorLibraryDispatcher};

    component!(path: ValidatorComponent, storage: validator, event: ValidatorEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccountComponent, storage: account, event: AccountEvent);

    mod Errors {
        pub const INVALID_TX_VERSION: felt252 = 'Invalid transaction version';
        pub const INVALID_MODULE_VALIDATE: felt252 = 'Missing __module_validate__';
        pub const INVALID_MODULE_CALLDATA: felt252 = 'Inconsistent module calldata';
        pub const INVALID_MODULE_SIGNATURE: felt252 = 'Invalid module signature';
        pub const INVALID_MODULE_VALIDATOR: felt252 = 'Invalid Core Validator';
    }

    #[abi(embed_v0)]
    impl ValidatorImpl of IValidator<ContractState> {
        fn is_valid_signature(
            self: @ContractState, hash: felt252, signature: Array<felt252>
        ) -> felt252 {
            if self.validator._is_valid_signature(hash, signature.span()) {
                starknet::VALIDATED
            } else {
                0
            }
        }

        fn validate(self: @ContractState, caller_class: ClassHash, calls: Array<Call>) -> felt252 {
            // Parse the transaction info
            let tx_info = get_tx_info().unbox();
            let tx_version: u256 = tx_info.version.into();
            if (tx_version >= QUERY_OFFSET) {
                assert(
                    QUERY_OFFSET + MIN_TRANSACTION_VERSION <= tx_version, Errors::INVALID_TX_VERSION
                );
            } else {
                assert(MIN_TRANSACTION_VERSION <= tx_version, Errors::INVALID_TX_VERSION);
            }
            let chain_id = tx_info.chain_id;
            let tx_hash = tx_info.transaction_hash;
            let tx_signature = tx_info.signature;

            // Parse the authz prefix
            assert(calls.len() == 1, Errors::INVALID_MODULE_VALIDATE);
            let account_address: ContractAddress = *calls.at(0).to;
            let selector = *calls.at(0).selector;
            assert(selector == selector!("__module_validate__"), Errors::INVALID_MODULE_VALIDATE);
            let authz: Span<felt252> = *calls.at(0).calldata;
            assert(authz.len() > 5, Errors::INVALID_MODULE_CALLDATA);
            let validator_class_felt = *authz.at(0);
            let validator_class: ClassHash = validator_class_felt.try_into().unwrap();
            // @todo: unblock the core validator check
            assert(validator_class_felt == core_validator_felt, Errors::INVALID_MODULE_VALIDATOR);
            let authz_key = *authz.at(1);
            let expires = *authz.at(2);
            let root = *authz.at(3);

            // Check the tx signature is valid with the authz key
            assert(is_valid_stark_signature(tx_hash, authz_key, tx_signature), Errors::INVALID_MODULE_SIGNATURE);

            // Parse the authz Signature
            let signature_len_felt = *authz.at(4);
            let signature_len: usize = signature_len_felt.try_into().unwrap();
            let authz_len = authz.len();
            let computed_len: usize = signature_len + 5;
            assert(authz_len == computed_len, Errors::INVALID_MODULE_CALLDATA);
            let mut signature = ArrayTrait::<felt252>::new();
            let mut i: usize = 0;
            while i < authz_len {
                signature.append(*authz.at(i + 5));
                i += 1;
            };

            // @todo: add other validity checks, including
            // - module is installed in the account
            // - expires is in the future
            // - calls are valids and matches the merkle proof

            // Check the authz signature is valid
            let _auth_hash = hash_auth_message(
                account_address, validator_class, authz_key, expires, root, chain_id
            );
            IValidatorLibraryDispatcher { class_hash: validator_class }.is_valid_signature(_auth_hash, signature)
        }

        fn initialize(ref self: ContractState, args: Array<felt252>) {}
    }

    impl ValidatorInternalImpl = ValidatorComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        validator: ValidatorComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        account: AccountComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ValidatorEvent: ValidatorComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        AccountEvent: AccountComponent::Event,
    }
}
