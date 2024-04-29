// SPDX-License-Identifier: MIT

use starknet::class_hash::ClassHash;
use starknet::account::Call;

// use `src5_rs` to generate the interface id
pub const IValidator_ID: felt252 =
    0x12872aa2454ea533052814f27445df0e498eeccaf2035b018153efff642d34d;

#[starknet::interface]
pub trait ICoreValidator<TState> {
    fn initialize(ref self: TState, public_key: felt252);
}

#[starknet::interface]
pub trait IValidator<TState> {
    fn is_valid_signature(self: @TState, hash: felt252, signature: Array<felt252>) -> felt252;
    fn validate(self: @TState, grantor_class: ClassHash, calls: Array<Call>) -> felt252;
}

#[starknet::interface]
pub trait IConfigure<TState> {
    fn call(self: @TState, call: Call) -> Array<felt252>;
    fn execute(ref self: TState, call: Call) -> Array<felt252>;
}

#[starknet::interface]
pub trait IPublicKeys<TState> {
    fn add_public_key(ref self: TState, new_public_key: felt252);
    fn get_public_keys(self: @TState) -> Array<felt252>;
    fn get_threshold(self: @TState) -> u8;
    fn remove_public_key(ref self: TState, old_public_key: felt252);
    fn set_threshold(ref self: TState, new_threshold: u8);
}

#[starknet::component]
pub mod ValidatorComponent {
    use openzeppelin::account::utils::is_valid_stark_signature;
    use openzeppelin::introspection::src5::SRC5Component::InternalTrait as SRC5InternalTrait;
    use openzeppelin::introspection::src5::SRC5Component::SRC5;
    use openzeppelin::introspection::src5::SRC5Component;
    use starknet::get_caller_address;
    use starknet::get_contract_address;
    use super::{IValidator, ICoreValidator, IValidator_ID, IConfigure};
    use starknet::class_hash::ClassHash;
    use starknet::account::Call;
    use smartr::store::Felt252ArrayStore;
    use smartr::account::AccountComponent;
    use smartr::account::AccountComponent::InternalTrait as AccountInternalTrait;
    use super::IPublicKeys;

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
        Account_modules: LegacyMap<ClassHash, bool>,
        Account_modules_initialize: LegacyMap<felt252, felt252>
    }

    #[event]
    #[derive(Drop, PartialEq, starknet::Event)]
    pub enum Event {}

    #[embeddable_as(CoreValidatorImpl)]
    pub impl CoreValidator<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +AccountComponent::HasComponent<TContractState>,
        +Drop<TContractState>
    > of ICoreValidator<ComponentState<TContractState>> {
        fn initialize(ref self: ComponentState<TContractState>, public_key: felt252) {
            self.Account_public_key.write(public_key);
            self.Account_public_keys.write(array![public_key]);
            self.Account_threshold.write(1);
        }
    }

    #[embeddable_as(ValidatorImpl)]
    pub impl Validator<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +AccountComponent::HasComponent<TContractState>,
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
            self: @ComponentState<TContractState>, grantor_class: ClassHash, calls: Array<Call>
        ) -> felt252 {
            starknet::VALIDATED
        }
    }

    #[embeddable_as(ConfigureImpl)]
    pub impl Configure<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +AccountComponent::HasComponent<TContractState>,
        +Drop<TContractState>
    > of IConfigure<ComponentState<TContractState>> {
        fn call(self: @ComponentState<TContractState>, call: Call) -> Array<felt252> {
            array![]
        }
        fn execute(ref self: ComponentState<TContractState>, call: Call) -> Array<felt252> {
            array![]
        }
    }

    #[embeddable_as(PublicKeysImpl)]
    pub impl PublicKeys<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        impl AccountInternalImpl: AccountComponent::HasComponent<TContractState>,
        +Drop<TContractState>
    > of IPublicKeys<ComponentState<TContractState>> {
        /// Add a key to the current public keys of the account.
        fn add_public_key(ref self: ComponentState<TContractState>, new_public_key: felt252) {
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
            let mut account_component = get_dep_component_mut!(ref self, AccountInternalImpl);
            account_component.notify_owner_addition(new_public_key);
        }

        /// Returns the current public keys of the account.
        fn get_public_keys(self: @ComponentState<TContractState>) -> Array<felt252> {
            self.Account_public_keys.read()
        }

        fn get_threshold(self: @ComponentState<TContractState>) -> u8 {
            self.Account_threshold.read()
        }

        /// Remove a key from the current public keys of the account.
        fn remove_public_key(ref self: ComponentState<TContractState>, old_public_key: felt252) {
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
            let mut account_component = get_dep_component_mut!(ref self, AccountInternalImpl);
            account_component.notify_owner_removal(old_public_key);
        }

        fn set_threshold(ref self: ComponentState<TContractState>, new_threshold: u8) {
            let public_keys = self.Account_public_keys.read();
            let len = public_keys.len();
            let threshold: u32 = new_threshold.into();
            assert(threshold <= len, Errors::THRESHOLD_TOO_BIG);
            self.Account_threshold.write(new_threshold);
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState,
        +HasComponent<TContractState>,
        impl SRC5: SRC5Component::HasComponent<TContractState>,
        impl AccountInternalImpl: AccountComponent::HasComponent<TContractState>,
        +Drop<TContractState>
    > of InternalTrait<TContractState> {
        /// Initializes the account by setting the initial public key
        /// and registering the ISRC6 interface Id.
        fn initializer(ref self: ComponentState<TContractState>, public_key: felt252) {
            let mut src5_component = get_dep_component_mut!(ref self, SRC5);
            src5_component.register_interface(IValidator_ID);
            self.Account_public_key.write(public_key);
            self.Account_public_keys.write(array![public_key]);
        }

        /// Validates that the caller is the account itself. Otherwise it reverts.
        fn assert_only_self(self: @ComponentState<TContractState>) {
            let caller = get_caller_address();
            let self = get_contract_address();
            assert(self == caller, Errors::UNAUTHORIZED);
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
