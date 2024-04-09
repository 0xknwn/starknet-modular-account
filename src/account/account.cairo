// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts for Cairo v0.10.0 (account/account.cairo)

/// # Account Component
///
/// The Account component enables contracts to behave as accounts.

use super::interface;

#[starknet::component]
pub mod AccountComponent {
    use super::interface;
    use smartr::store::Felt252ArrayStore;
    use smartr::module::validator::{IValidatorDispatcherTrait, IValidatorLibraryDispatcher};
    use openzeppelin::account::utils::{MIN_TRANSACTION_VERSION, QUERY_VERSION, QUERY_OFFSET};
    use openzeppelin::account::utils::{execute_calls, is_valid_stark_signature};
    use openzeppelin::introspection::src5::SRC5Component::InternalTrait as SRC5InternalTrait;
    use openzeppelin::introspection::src5::SRC5Component::SRC5;
    use openzeppelin::introspection::src5::SRC5Component;
    use starknet::account::Call;
    use starknet::get_caller_address;
    use starknet::get_contract_address;
    use starknet::get_tx_info;
    use core::num::traits::Zero;
    use starknet::{ClassHash, ContractAddress};
    use core::traits::Into;

    #[storage]
    struct Storage {
        // Account_public_key is maintained only to allow upgrading to the
        // Openzeppelin account. It should *NOT* be used for any other purpose.
        Account_public_key: felt252,
        Account_class_hash: ClassHash,
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

    pub mod Errors {
        pub const INVALID_CALLER: felt252 = 'Account: invalid caller';
        pub const INVALID_SIGNATURE: felt252 = 'Account: invalid signature';
        pub const REGISTERED_KEY: felt252 = 'Account: key already registered';
        pub const KEY_NOT_FOUND: felt252 = 'Account: key not found';
        pub const MISSING_KEYS: felt252 = 'Account: not enough keys';
        pub const INVALID_TX_VERSION: felt252 = 'Account: invalid tx version';
        pub const INVALID_THRESHOLD: felt252 = 'Account: invalid threshold';
        pub const UNSUPPORTED_THRESHOLD: felt252 = 'Account: unsupported threshold';
        pub const THRESHOLD_TOO_BIG: felt252 = 'Account: threshold too big';
        pub const UNAUTHORIZED: felt252 = 'Account: unauthorized';
        pub const MODULE_NOT_FOUND: felt252 = 'Module: module not found';
        pub const MODULE_NOT_INSTALLED: felt252 = 'Module: module not installed';
        pub const MODULE_ALREADY_INSTALLED: felt252 = 'Module: already installed';
    }

    #[embeddable_as(SRC6Impl)]
    impl SRC6<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +Drop<TContractState>
    > of interface::ISRC6<ComponentState<TContractState>> {
        /// Executes a list of calls from the account.
        ///
        /// Requirements:
        ///
        /// - The transaction version must be greater than or equal to `MIN_TRANSACTION_VERSION`.
        /// - If the transaction is a simulation (version than `QUERY_OFFSET`), it must be
        /// greater than or equal to `QUERY_OFFSET` + `MIN_TRANSACTION_VERSION`.
        fn __execute__(
            self: @ComponentState<TContractState>, mut calls: Array<Call>
        ) -> Array<Span<felt252>> {
            // Avoid calls from other contracts
            // https://github.com/OpenZeppelin/cairo-contracts/issues/344
            let sender = get_caller_address();
            assert(sender.is_zero(), Errors::INVALID_CALLER);

            // Check tx version
            let tx_info = get_tx_info().unbox();
            let tx_version: u256 = tx_info.version.into();
            // Check if tx is a query
            if (tx_version >= QUERY_OFFSET) {
                assert(
                    QUERY_OFFSET + MIN_TRANSACTION_VERSION <= tx_version, Errors::INVALID_TX_VERSION
                );
            } else {
                assert(MIN_TRANSACTION_VERSION <= tx_version, Errors::INVALID_TX_VERSION);
            }
            execute_calls(calls)
        }

        /// Verifies the validity of the signature for the current transaction.
        /// This function is used by the protocol to verify `invoke` transactions.
        fn __validate__(self: @ComponentState<TContractState>, mut calls: Array<Call>) -> felt252 {
            let selector = *calls.at(0).selector;
            if selector == selector!("__module__validate__") {
                let account = get_contract_address();
                assert(*calls.at(0).to == account, Errors::UNAUTHORIZED);
                let calldata = *calls.at(0).calldata;
                assert(calldata.len() > 0, Errors::MODULE_NOT_FOUND);
                let felt = *calldata.at(0);
                let class_hash: ClassHash = felt.try_into().unwrap();
                assert(self.Account_modules.read(class_hash), Errors::MODULE_NOT_INSTALLED);
                return IValidatorLibraryDispatcher { class_hash: class_hash }
                    .validate(class_hash, calls);
            }
            self.validate_transaction()
        }

        /// Verifies that the given signature is valid for the given hash.
        fn is_valid_signature(
            self: @ComponentState<TContractState>, hash: felt252, signature: Array<felt252>
        ) -> felt252 {
            _module_is_valid_signature(hash, signature)
        }
    }

    #[embeddable_as(DeclarerImpl)]
    impl Declarer<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +Drop<TContractState>
    > of interface::IDeclarer<ComponentState<TContractState>> {
        /// Verifies the validity of the signature for the current transaction.
        /// This function is used by the protocol to verify `declare` transactions.
        fn __validate_declare__(
            self: @ComponentState<TContractState>, class_hash: felt252
        ) -> felt252 {
            self.validate_transaction()
        }
    }

    #[embeddable_as(DeployableImpl)]
    pub impl Deployable<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +Drop<TContractState>
    > of interface::IDeployable<ComponentState<TContractState>> {
        /// Verifies the validity of the signature for the current transaction.
        /// This function is used by the protocol to verify `deploy_account` transactions.
        fn __validate_deploy__(
            self: @ComponentState<TContractState>,
            class_hash: felt252,
            contract_address_salt: felt252,
            public_key: felt252
        ) -> felt252 {
            self.validate_transaction()
        }
    }

    #[embeddable_as(PublicKeysImpl)]
    pub impl PublicKeys<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +Drop<TContractState>
    > of interface::IPublicKeys<ComponentState<TContractState>> {
        /// Add a key to the current public keys of the account.
        fn add_public_key(ref self: ComponentState<TContractState>, new_public_key: felt252) {
            self.assert_only_self();
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
            self.emit(OwnerAdded { new_owner_guid: new_public_key });
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
            self.assert_only_self();
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
            self.emit(OwnerRemoved { removed_owner_guid: old_public_key });
        }

        fn set_threshold(ref self: ComponentState<TContractState>, new_threshold: u8) {
            self.assert_only_self();
            let public_keys = self.Account_public_keys.read();
            let len = public_keys.len();
            let threshold: u32 = new_threshold.into();
            assert(threshold <= len, Errors::THRESHOLD_TOO_BIG);
            self.Account_threshold.write(new_threshold);
        }
    }

    /// Adds camelCase support for `ISRC6`.
    #[embeddable_as(SRC6CamelOnlyImpl)]
    impl SRC6CamelOnly<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +Drop<TContractState>
    > of interface::ISRC6CamelOnly<ComponentState<TContractState>> {
        fn isValidSignature(
            self: @ComponentState<TContractState>, hash: felt252, signature: Array<felt252>
        ) -> felt252 {
            SRC6::is_valid_signature(self, hash, signature)
        }
    }

    #[embeddable_as(ModuleImpl)]
    pub impl Module<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +Drop<TContractState>
    > of interface::IModule<ComponentState<TContractState>> {
        fn __module__validate__(ref self: ComponentState<TContractState>, class_hash: ClassHash) {
            self.assert_only_self();
        }

        fn add_module(
            ref self: ComponentState<TContractState>, class_hash: ClassHash, args: Array<felt252>
        ) {
            self.assert_only_self();
            let installed = self.Account_modules.read(class_hash);
            assert(!installed, Errors::MODULE_ALREADY_INSTALLED);
            self.Account_modules.write(class_hash, true);
            if args.len() > 0 {
                IValidatorLibraryDispatcher { class_hash: class_hash }.initialize(args)
            }
        }

        fn get_initialization(self: @ComponentState<TContractState>, key: felt252) -> felt252 {
            self.Account_modules_initialize.read(key)
        }

        fn remove_module(ref self: ComponentState<TContractState>, class_hash: ClassHash) {
            self.assert_only_self();
            let installed = self.Account_modules.read(class_hash);
            assert(installed, Errors::MODULE_NOT_INSTALLED);
            self.Account_modules.write(class_hash, false);
        }

        fn is_module(self: @ComponentState<TContractState>, class_hash: ClassHash) -> bool {
            self.Account_modules.read(class_hash)
        }

        fn read_on_module(
            self: @ComponentState<TContractState>, class_hash: ClassHash, calls: Array<Call>
        ) {}

        fn execute_on_module(
            ref self: ComponentState<TContractState>, class_hash: ClassHash, calls: Array<Call>
        ) {}
    }

    fn _module_is_valid_signature(hash: felt252, signature: Array<felt252>) -> felt252 {
        let class_hash = starknet::class_hash::class_hash_const::<
            0x58097be98f75ab77d9ce350b958fa303f38db3644443478ad33e25233cc5f1a
        >();
        IValidatorLibraryDispatcher { class_hash: class_hash }.is_valid_signature(hash, signature)
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
            src5_component.register_interface(interface::ISRC6_ID);
            self._init_public_key(public_key);
        }

        /// Validates that the caller is the account itself. Otherwise it reverts.
        fn assert_only_self(self: @ComponentState<TContractState>) {
            let caller = get_caller_address();
            let self = get_contract_address();
            assert(self == caller, Errors::UNAUTHORIZED);
        }

        /// Validates the signature for the current transaction.
        /// Returns the short string `VALID` if valid, otherwise it reverts.
        fn validate_transaction(self: @ComponentState<TContractState>) -> felt252 {
            let tx_info = get_tx_info().unbox();
            let tx_hash = tx_info.transaction_hash;
            let signature = tx_info.signature;
            let signature_len = signature.len();
            let mut i: usize = 0;
            let mut sig: Array<felt252> = ArrayTrait::<felt252>::new();
            while i < signature_len {
                sig.append(*signature.at(i));
                i += 1;
            };
            _module_is_valid_signature(tx_hash, sig)
        }

        /// Sets the public key without validating the caller.
        /// The usage of this method outside the `set_public_key` function is discouraged.
        ///
        /// Emits an `OwnerAdded` event.
        fn _init_public_key(ref self: ComponentState<TContractState>, new_public_key: felt252) {
            let mut new_public_keys = ArrayTrait::<felt252>::new();
            new_public_keys.append(new_public_key);
            self.Account_public_keys.write(new_public_keys);
            self.Account_threshold.write(1);
            self.emit(OwnerAdded { new_owner_guid: new_public_key });
        }
    }
}