// SPDX-License-Identifier: MIT

use openzeppelin::account::utils::secp256k1::Secp256k1PointSerde;
use openzeppelin::account::interface::EthPublicKey;

#[starknet::interface]
pub trait IPublicKey<TState> {
    fn set_public_key(ref self: TState, new_public_key: EthPublicKey);
    fn get_public_key(self: @TState) -> EthPublicKey;
}

#[starknet::contract]
mod EthValidator {
    use core::traits::Into;
    use openzeppelin::account::utils::{execute_calls, is_valid_eth_signature};
    use openzeppelin::account::utils::secp256k1::Secp256k1PointSerde;
    use openzeppelin::account::utils::secp256k1::Secp256k1PointStorePacking;
    use openzeppelin::account::interface::EthPublicKey;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::introspection::src5::SRC5Component::SRC5;
    use openzeppelin::introspection::src5::SRC5Component::InternalTrait as SRC5InternalTrait;
    use smartr::component::AccountComponent;
    use smartr::component::AccountComponent::InternalTrait as AccountInternalTrait;
    use smartr::component::ValidatorComponent;
    use smartr::component::{IValidator, ICoreValidator, IValidator_ID, IConfigure};
    use smartr::component::IVersion;
    use starknet::account::Call;
    use starknet::class_hash::ClassHash;
    use starknet::get_caller_address;
    use starknet::get_contract_address;
    use starknet::get_tx_info;
    use super::IPublicKey;

    component!(path: ValidatorComponent, storage: validator, event: ValidatorEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccountComponent, storage: account, event: AccountEvent);

    #[abi(embed_v0)]
    pub impl ValidatorImpl of IValidator<ContractState> {
        fn validate(self: @ContractState, grantor_class: ClassHash, calls: Array<Call>) -> felt252 {
            let tx_info = get_tx_info().unbox();
            let tx_hash = array![tx_info.transaction_hash];
            let signature = tx_info.signature;
            let signature_len = signature.len();
            let mut i: usize = 0;
            let mut sig: Array<felt252> = ArrayTrait::<felt252>::new();
            while i < signature_len {
                sig.append(*signature.at(i));
                i += 1;
            };
            self.is_valid_signature(tx_hash, sig)
        }
    }

    #[abi(embed_v0)]
    impl VersionImpl of IVersion<ContractState> {
        fn get_name(self: @ContractState) -> felt252 {
            'eth-validator'
        }
        fn get_version(self: @ContractState) -> felt252 {
            'v0.1.8'
        }
    }

    #[abi(embed_v0)]
    pub impl CoreValidator of ICoreValidator<ContractState> {
        /// Verifies that the given signature is valid for the given hash.
        fn is_valid_signature(
            self: @ContractState, hash: Array<felt252>, signature: Array<felt252>
        ) -> felt252 {
            if hash.len() != 1 {
                return 0;
            }
            let hash_value = *hash.at(0);
            if self._is_valid_signature(hash_value, signature.span()) {
                starknet::VALIDATED
            } else {
                0
            }
        }

        fn initialize(ref self: ContractState, public_key: Array<felt252>) {
            let mut value = public_key.span();
            let eth_public_key = Serde::<EthPublicKey>::deserialize(ref value);
            match eth_public_key {
                Option::Some(key) => {
                    self.EthAccount_public_key.write(key);
                    self.account.notify_owner_addition(public_key);
                },
                 Option::None => {
                    assert(false, 'Invalid public key');
                },
            }
        }
    }

    mod Errors {
        pub const INVALID_SIGNATURE: felt252 = 'Account: invalid signature';
        pub const UNAUTHORIZED: felt252 = 'Account: unauthorized';
    }

    #[storage]
    struct Storage {
        EthAccount_public_key: EthPublicKey,
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
    pub impl ConfigureImpl of IConfigure<ContractState> {
        fn call(self: @ContractState, call: Call) -> Array<felt252> {
            let mut output = ArrayTrait::<felt252>::new();
            let mut found = false;
            if call.selector == selector!("get_public_key") {
                found = true;
                let keys = self.get_public_key();
                keys.serialize(ref output);
            }
            if call.selector == selector!("get_version") {
                found = true;
                let out = self.get_version();
                output.append(out);
            }
            if call.selector == selector!("get_name") {
                found = true;
                let out = self.get_name();
                output.append(out);
            }
            if !found {
                assert(false, 'Invalid selector');
            }
            output
        }

        fn execute(ref self: ContractState, call: Call) -> Array<felt252> {
            let mut output = ArrayTrait::<felt252>::new();
            let mut found = false;
            if call.selector == selector!("set_public_key") {
                found = true;
                if call.calldata.len() != 4 {
                    assert(false, 'Invalid payload');
                }
                // let me: Array<felt252> = call.calldata;
                let mut value = call.calldata;
                let eth_public_key = Serde::<EthPublicKey>::deserialize(ref value);
                match eth_public_key {
                    Option::Some(key) => {
                        self.set_public_key(key);
                    },
                    Option::None => {
                        assert(false, 'Invalid public key');
                    },
                }
            }
            if !found {
                assert(false, 'Invalid selector');
            }
            output
        }
    }


    #[abi(embed_v0)]
    pub impl PublicKey of IPublicKey<ContractState> {
        /// Add a key to the current public keys of the account.
        fn set_public_key(ref self: ContractState, new_public_key: EthPublicKey) {
            self.EthAccount_public_key.write(new_public_key);
            let mut public_key_felt = ArrayTrait::<felt252>::new();
            new_public_key.serialize(ref public_key_felt);
            self.account.notify_owner_addition(public_key_felt);
        }

        /// Returns the current public keys of the account.
        fn get_public_key(self: @ContractState) -> EthPublicKey {
            self.EthAccount_public_key.read()
        }
    }


    #[generate_trait]
    impl Internal of InternalTrait {
        /// Initializes the account by setting the initial public key
        /// and registering the ISRC6 interface Id.
        fn initializer(ref self: ContractState, public_key: felt252) {
            self.src5.register_interface(IValidator_ID);
        }

        /// Validates that the caller is the account itself. Otherwise it reverts.
        fn assert_only_self(self: @ContractState) {
            let caller = get_caller_address();
            let self = get_contract_address();
            assert(self == caller, Errors::UNAUTHORIZED);
        }

        /// Returns whether the given signature is valid for the given hash
        /// using the account's current public key.
        fn _is_valid_signature(
            self: @ContractState, hash: felt252, signature: Span<felt252>
        ) -> bool {
            let public_key: EthPublicKey = self.EthAccount_public_key.read();
            is_valid_eth_signature(hash, public_key, signature)
        }
    }
}
