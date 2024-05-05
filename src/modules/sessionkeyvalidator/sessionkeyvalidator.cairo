// SPDX-License-Identifier: MIT

#[starknet::interface]
pub trait IDisableSessionKey<TState> {
    fn disable_session_key(ref self: TState, sessionkey: felt252);
    fn is_disabled_session_key(self: @TState, sessionkey: felt252) -> bool;
}

#[starknet::contract]
mod SessionKeyValidator {
    use core::pedersen::pedersen;
    use core::traits::Into;
    use openzeppelin::account::utils::{is_valid_stark_signature};
    use openzeppelin::account::utils::{MIN_TRANSACTION_VERSION, QUERY_VERSION, QUERY_OFFSET};
    use openzeppelin::introspection::src5::SRC5Component;
    use smartr::component::AccountComponent;
    use smartr::utils::hash_auth_message;
    use super::{IDisableSessionKeyDispatcherTrait, IDisableSessionKey};
    use smartr::component::IConfigure;
    use smartr::component::{
        ValidatorComponent, IValidator, ICoreValidator, ICoreValidatorDispatcherTrait,
        ICoreValidatorLibraryDispatcher,
    };
    use smartr::utils::merkle_tree::is_valid_root;
    use starknet::{get_caller_address, get_contract_address, get_tx_info, get_block_timestamp};
    use starknet::account::Call;
    use starknet::class_hash::ClassHash;
    use starknet::ContractAddress;

    component!(path: ValidatorComponent, storage: validator, event: ValidatorEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccountComponent, storage: account, event: AccountEvent);

    mod Errors {
        pub const INVALID_TX_VERSION: felt252 = 'Invalid transaction version';
        pub const INVALID_MODULE_VALIDATE: felt252 = 'Missing __module_validate__';
        pub const INVALID_MODULE_CALLDATA: felt252 = 'Invalid module calldata';
        pub const MODULE_NOT_INSTALLED: felt252 = 'Module not installed';
        pub const DISABLED_SESSION: felt252 = 'sessionkey has been disabled';
        pub const INVALID_SESSION_EXPIRATION: felt252 = 'expires should be set';
        pub const INVALID_SESSION_EXPIRED: felt252 = 'sessionkey has expired';
        pub const INVALID_SESSION_PROOF: felt252 = 'Invalid sessionkey proof';
        pub const INVALID_SESSION_PROOF_LEN: felt252 = 'Invalid sessionkey proof length';
        pub const INVALID_MODULE_SIGNATURE: felt252 = 'Invalid module signature';
        pub const INVALID_MODULE_VALIDATOR: felt252 = 'Invalid Core Validator';
    }

    #[abi(embed_v0)]
    impl DisableSessionKeyImpl of IDisableSessionKey<ContractState> {
        fn disable_session_key(ref self: ContractState, sessionkey: felt252) {
            self.Sessionkey_disabled.write(sessionkey, true);
        }

        fn is_disabled_session_key(self: @ContractState, sessionkey: felt252) -> bool {
            self.Sessionkey_disabled.read(sessionkey)
        }
    }

    #[abi(embed_v0)]
    impl ValidatorImpl of IValidator<ContractState> {
        fn validate(self: @ContractState, grantor_class: ClassHash, calls: Array<Call>) -> felt252 {
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
            let calls_len = calls.len();
            assert(calls_len > 1, Errors::INVALID_MODULE_VALIDATE);
            let account_address: ContractAddress = *calls.at(0).to;
            let selector = *calls.at(0).selector;
            assert(selector == selector!("__module_validate__"), Errors::INVALID_MODULE_VALIDATE);
            let authz: Span<felt252> = *calls.at(0).calldata;
            assert(authz.len() > 6, Errors::INVALID_MODULE_CALLDATA);
            let _calldata_length_felt = *authz.at(0);
            let validator_class_felt = *authz.at(1);
            let validator_class: ClassHash = validator_class_felt.try_into().unwrap();
            let grantor_class_felt = *authz.at(2);
            let grantor_class: ClassHash = grantor_class_felt.try_into().unwrap();

            // @todo: unblock the core validator check
            let core_validator: ClassHash = self.account.Account_core_validator.read();
            let core_validator_felt: felt252 = core_validator.try_into().unwrap();
            assert(grantor_class_felt == core_validator_felt, grantor_class_felt);

            let authz_key = *authz.at(3);
            let expires = *authz.at(4);
            let root = *authz.at(5);

            // Check the tx signature is valid with the authz key
            assert(
                is_valid_stark_signature(tx_hash, authz_key, tx_signature),
                Errors::INVALID_MODULE_SIGNATURE
            );

            // Parse the authz Signature
            let signature_len_felt = *authz.at(6);
            let signature_len: usize = signature_len_felt.try_into().unwrap();
            let authz_len = authz.len();
            let computed_len: usize = signature_len + 7;
            assert(computed_len <= authz_len, Errors::INVALID_MODULE_CALLDATA);
            let mut signature = ArrayTrait::<felt252>::new();
            let mut i: usize = 0;
            while i < signature_len {
                signature.append(*authz.at(i + 7));
                i += 1;
            };

            // checks the module is installed in the account
            let installed = self.account.Account_modules.read(validator_class);
            assert(installed, Errors::MODULE_NOT_INSTALLED);

            // checks expires is in the future
            let expired_u64 = expires.try_into().unwrap();
            let timestamp = get_block_timestamp();
            assert(expired_u64 > 0_u64, Errors::INVALID_SESSION_EXPIRATION);
            assert(expired_u64 > timestamp, Errors::INVALID_SESSION_EXPIRED);

            // checks, if root is set, calls merkle proofs match the root
            if root != 0 {
                let mut j = 1;
                let proof_len_felt = *authz.at(signature_len + 7);
                let proof_len: usize = proof_len_felt.try_into().unwrap();
                let mut proof_start = signature_len + 8;
                while j < calls_len {
                    assert(
                        proof_len < authz_len + 1 - proof_start, Errors::INVALID_SESSION_PROOF_LEN
                    );
                    let account_address: ContractAddress = *calls.at(j).to;
                    let account_address_felt: felt252 = account_address.try_into().unwrap();
                    let selector = *calls.at(j).selector;
                    let leaf = pedersen(account_address_felt, selector);
                    let mut proof: Array<felt252> = ArrayTrait::<felt252>::new();
                    let mut k = 0;
                    while k < proof_len {
                        proof.append(*authz.at(proof_start + k));
                        k += 1;
                    };
                    let is_proof_valid = is_valid_root(leaf, root, proof);
                    assert(is_proof_valid, Errors::INVALID_SESSION_PROOF);
                    proof_start += proof_len;
                    j += 1;
                };
            }

            // Check the authz signature is valid
            let auth_hash = hash_auth_message(
                account_address, validator_class, grantor_class, authz_key, expires, root, chain_id
            );

            // check the sessionkey has not been blocked
            let is_disabled = self.Sessionkey_disabled.read(auth_hash);
            assert(!is_disabled, Errors::DISABLED_SESSION);

            ICoreValidatorLibraryDispatcher { class_hash: grantor_class }
                .is_valid_signature(array![auth_hash], signature)
        }
    }

    #[storage]
    struct Storage {
        Sessionkey_disabled: LegacyMap<felt252, bool>,
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

    #[abi(embed_v0)]
    impl ConfigureImpl of IConfigure<ContractState> {
        fn call(self: @ContractState, call: Call) -> Array<felt252> {
            let mut output = ArrayTrait::<felt252>::new();
            let mut found = false;
            if call.selector == selector!("is_disabled_session_key") {
                found = true;
                if call.calldata.len() != 1 {
                    assert(false, 'Invalid payload');
                }
                let key = *call.calldata.at(0);
                let is_disabled = self.is_disabled_session_key(key);
                if is_disabled {
                    output.append(1);
                } else {
                    output.append(0);
                }
            }
            if !found {
                assert(false, 'Invalid selector');
            }
            output
        }

        fn execute(ref self: ContractState, call: Call) -> Array<felt252> {
            let mut output = ArrayTrait::<felt252>::new();
            let mut found = false;
            if call.selector == selector!("disable_session_key") {
                found = true;
                if call.calldata.len() != 1 {
                    assert(false, 'Invalid payload');
                }
                let key = *call.calldata.at(0);
                self.disable_session_key(key);
            }
            if !found {
                assert(false, 'Invalid selector');
            }
            output
        }
    }
}
