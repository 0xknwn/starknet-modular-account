// SPDX-License-Identifier: MIT

use starknet::class_hash::ClassHash;
use starknet::account::Call;
use super::store;

// use `src5_rs` to generate the interface id
pub const IValidator_ID: felt252 =
    0x12872aa2454ea533052814f27445df0e498eeccaf2035b018153efff642d34d;

#[starknet::interface]
pub trait IValidator<TState> {
    fn is_valid_signature(self: @TState, hash: felt252, signature: Array<felt252>) -> felt252;
    fn validate(self: @TState, caller_class: ClassHash, calls: Array<Call>) -> felt252;
    fn initialize(ref self: TState, args: Array<felt252>);
}

#[starknet::component]
pub mod ValidatorComponent {
    use openzeppelin::account::utils::is_valid_stark_signature;
    use openzeppelin::introspection::src5::SRC5Component::InternalTrait as SRC5InternalTrait;
    use openzeppelin::introspection::src5::SRC5Component::SRC5;
    use openzeppelin::introspection::src5::SRC5Component;
    use starknet::get_caller_address;
    use starknet::get_contract_address;
    use super::{IValidator, IValidator_ID};
    use starknet::class_hash::ClassHash;
    use starknet::account::Call;
    use super::store::Felt252ArrayStore;

    mod Errors {
        pub const INVALID_SIGNATURE: felt252 = 'Account: invalid signature';
        pub const INVALID_THRESHOLD: felt252 = 'Account: invalid threshold';
        pub const UNAUTHORIZED: felt252 = 'Account: unauthorized';
    }

    #[storage]
    struct Storage {
        Account_public_key: felt252,
        Account_public_keys: Array<felt252>,
        Account_threshold: u8,
        Account_modules: LegacyMap<ClassHash, bool>,
        Account_modules_initialize: LegacyMap<felt252, felt252>
    }

    #[event]
    #[derive(Drop, PartialEq, starknet::Event)]
    pub enum Event {
        OwnerAdded: OwnerAdded,
        OwnerRemoved: OwnerRemoved
    }

    #[derive(Drop, PartialEq, starknet::Event)]
    pub struct OwnerAdded {
        #[key]
        new_owner_guid: felt252
    }

    #[derive(Drop, PartialEq, starknet::Event)]
    pub struct OwnerRemoved {
        #[key]
        removed_owner_guid: felt252
    }

    #[embeddable_as(ValidatorImpl)]
    pub impl Validator<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +Drop<TContractState>
    > of IValidator<ComponentState<TContractState>> {
        /// Verifies that the given signature is valid for the given hash.
        fn is_valid_signature(
            self: @ComponentState<TContractState>, hash: felt252, signature: Array<felt252>
        ) -> felt252 {
            if self._is_valid_signature(hash, signature.span()) {
                starknet::VALIDATED
            } else {
                0
            }
        }

        fn validate(
            self: @ComponentState<TContractState>, caller_class: ClassHash, calls: Array<Call>
        ) -> felt252 {
            starknet::VALIDATED
        }

        fn initialize(ref self: ComponentState<TContractState>, args: Array<felt252>) {
            self.Account_modules_initialize.write(0x7, 0x8);
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        impl SRC5: SRC5Component::HasComponent<TContractState>,
        +Drop<TContractState>
    > of InternalTrait<TContractState> {
        /// Initializes the account by setting the initial public key
        /// and registering the ISRC6 interface Id.
        fn initializer(ref self: ComponentState<TContractState>, public_key: felt252) {
            let mut src5_component = get_dep_component_mut!(ref self, SRC5);
            src5_component.register_interface(IValidator_ID);
            self._set_public_key(public_key);
        }

        /// Validates that the caller is the account itself. Otherwise it reverts.
        fn assert_only_self(self: @ComponentState<TContractState>) {
            let caller = get_caller_address();
            let self = get_contract_address();
            assert(self == caller, Errors::UNAUTHORIZED);
        }

        /// Sets the public key without validating the caller.
        /// The usage of this method outside the `set_public_key` function is discouraged.
        ///
        /// Emits an `OwnerAdded` event.
        fn _set_public_key(ref self: ComponentState<TContractState>, new_public_key: felt252) {
            self.Account_public_key.write(new_public_key);
            self.emit(OwnerAdded { new_owner_guid: new_public_key });
        }

        /// Returns whether the given signature is valid for the given hash
        /// using the account's current public key.
        fn _is_valid_signature(
            self: @ComponentState<TContractState>, hash: felt252, signature: Span<felt252>
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
