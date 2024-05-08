// SPDX-License-Identifier: MIT

#[starknet::interface]
pub trait IPublicKeys<TState> {
    fn add_public_key(ref self: TState, new_public_key: felt252);
    fn get_public_keys(self: @TState) -> Array<felt252>;
    fn get_threshold(self: @TState) -> u8;
    fn remove_public_key(ref self: TState, old_public_key: felt252);
    fn set_threshold(ref self: TState, new_threshold: u8);
}

#[starknet::contract]
mod StarkValidator {
    use core::traits::Into;
    use openzeppelin::account::utils::is_valid_stark_signature;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::introspection::src5::SRC5Component::SRC5;
    use openzeppelin::introspection::src5::SRC5Component::InternalTrait as SRC5InternalTrait;
    use smartr::component::AccountComponent;
    use smartr::component::AccountComponent::InternalTrait as AccountInternalTrait;
    use smartr::component::ValidatorComponent;
    use smartr::component::{IValidator, ICoreValidator, IValidator_ID, IConfigure};
    use smartr::component::IVersion;
    use smartr::store::Felt252ArrayStore;
    use starknet::account::Call;
    use starknet::class_hash::ClassHash;
    use starknet::get_caller_address;
    use starknet::get_contract_address;
    use starknet::get_tx_info;
    use super::IPublicKeys;

    component!(path: ValidatorComponent, storage: validator, event: ValidatorEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccountComponent, storage: account, event: AccountEvent);

    #[constructor]
    fn constructor(ref self: ContractState) {
        assert(false, 'deployment not allowed')
    }

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
            'stark-validator'
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
            assert(public_key.len() == 1, 'Invalid public key');
            let public_key_felt = *public_key.at(0);
            self.Account_public_key.write(public_key_felt);
            self.Account_public_keys.write(array![public_key_felt]);
            self.Account_threshold.write(1);
        }
    }

    mod Errors {
        pub const REGISTERED_KEY: felt252 = 'Account: key already registered';
        pub const KEY_NOT_FOUND: felt252 = 'Account: key not found';
        pub const MISSING_KEYS: felt252 = 'Account: not enough keys';
        pub const THRESHOLD_TOO_BIG: felt252 = 'Account: threshold too big';
        pub const INVALID_SIGNATURE: felt252 = 'Account: invalid signature';
        pub const INVALID_THRESHOLD: felt252 = 'Account: invalid threshold';
        pub const UNAUTHORIZED: felt252 = 'Account: unauthorized';
    }

    #[storage]
    struct Storage {
        Account_public_key: felt252,
        Account_public_keys: Array<felt252>,
        Account_threshold: u8,
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
            if call.selector == selector!("get_public_keys") {
                found = true;
                let keys = self.get_public_keys();
                let mut i = 0;
                while i < keys.len() {
                    output.append(*keys.at(i));
                    i += 1;
                }
            }
            if call.selector == selector!("get_threshold") {
                found = true;
                let threshold = self.get_threshold();
                let threshold_felt: felt252 = threshold.into();
                output.append(threshold_felt);
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
            if call.selector == selector!("add_public_key") {
                found = true;
                if call.calldata.len() != 1 {
                    assert(false, 'Invalid payload');
                }
                let key = *call.calldata.at(0);
                self.add_public_key(key);
            }
            if call.selector == selector!("remove_public_key") {
                found = true;
                if call.calldata.len() != 1 {
                    assert(false, 'Invalid payload');
                }
                let key = *call.calldata.at(0);
                self.remove_public_key(key);
            }
            if call.selector == selector!("set_threshold") {
                found = true;
                if call.calldata.len() != 1 {
                    assert(false, 'Invalid payload');
                }
                let new_threshold_felt = *call.calldata.at(0);
                let new_threshold: u8 = new_threshold_felt.try_into().unwrap();
                self.set_threshold(new_threshold);
            }
            if !found {
                assert(false, 'Invalid selector');
            }
            output
        }
    }


    #[abi(embed_v0)]
    pub impl PublicKeys of IPublicKeys<ContractState> {
        /// Add a key to the current public keys of the account.
        fn add_public_key(ref self: ContractState, new_public_key: felt252) {
            let mut public_keys = self.Account_public_keys.read();
            let public_keys_snapshot = @public_keys;
            let mut i: usize = 0;
            let len = public_keys_snapshot.len();
            while i < len {
                let public_key = public_keys_snapshot.at(i);
                assert(*public_key != new_public_key, Errors::REGISTERED_KEY);
                i += 1;
            };
            public_keys.append(new_public_key);
            self.Account_public_keys.write(public_keys);
            self.account.notify_owner_addition(array![new_public_key]);
        }

        /// Returns the current public keys of the account.
        fn get_public_keys(self: @ContractState) -> Array<felt252> {
            self.Account_public_keys.read()
        }

        fn get_threshold(self: @ContractState) -> u8 {
            self.Account_threshold.read()
        }

        /// Remove a key from the current public keys of the account.
        fn remove_public_key(ref self: ContractState, old_public_key: felt252) {
            /// @todo: make sure the key to be removed is not used as part of
            // the signature otherwise the account could be locked.
            let mut public_keys = ArrayTrait::<felt252>::new();
            let mut is_found = false;
            let previous_public_keys = self.Account_public_keys.read();
            let len = previous_public_keys.len();
            let threshold: u32 = self.Account_threshold.read().into();
            assert(len > threshold, Errors::MISSING_KEYS);
            let mut i: u32 = 0;
            while i < len {
                let public_key = *previous_public_keys.at(i);
                if public_key == old_public_key {
                    is_found = true;
                } else {
                    public_keys.append(public_key);
                }
                i += 1;
            };
            assert(is_found, Errors::KEY_NOT_FOUND);
            self.Account_public_keys.write(public_keys);
            self.account.notify_owner_removal(array![old_public_key]);
        }

        fn set_threshold(ref self: ContractState, new_threshold: u8) {
            let public_keys = self.Account_public_keys.read();
            let len = public_keys.len();
            let threshold: u32 = new_threshold.into();
            assert(threshold <= len, Errors::THRESHOLD_TOO_BIG);
            self.Account_threshold.write(new_threshold);
        }
    }


    #[generate_trait]
    impl Internal of InternalTrait {
        /// Initializes the account by setting the initial public key
        /// and registering the ISRC6 interface Id.
        fn initializer(ref self: ContractState, public_key: felt252) {
            self.src5.register_interface(IValidator_ID);
            self.Account_public_key.write(public_key);
            self.Account_public_keys.write(array![public_key]);
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
            let threshold: u32 = self.Account_threshold.read().into();
            assert(threshold >= 1, Errors::INVALID_THRESHOLD);
            let signature_len = signature.len();
            assert(signature_len == 2 * threshold, Errors::INVALID_SIGNATURE);
            let public_keys: Array<felt252> = self.Account_public_keys.read();
            let public_keys_snapshot = @public_keys;
            let mut matching_signature = 0;
            let mut j: usize = 0;
            while j < (signature_len - 1) {
                let mut sig: Array<felt252> = ArrayTrait::<felt252>::new();
                sig.append(*signature.at(j));
                sig.append(*signature.at(j + 1));
                let mut i: usize = 0;
                let len = public_keys_snapshot.len();
                while i < len {
                    let public_key = *public_keys_snapshot.at(i);
                    if is_valid_stark_signature(hash, public_key, sig.span()) {
                        matching_signature += 1;
                        break;
                    }
                    i += 1;
                };
                j += 2;
            };
            assert(matching_signature >= threshold, Errors::INVALID_SIGNATURE);
            true
        }
    }
}
