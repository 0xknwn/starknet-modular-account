/// # Account Component
///
/// The Account component enables contracts to behave as accounts.

use openzeppelin::account::utils::secp256k1::Secp256k1PointSerde;
use starknet::ContractAddress;
use starknet::account::Call;
use starknet::ClassHash;

pub const ISRC6_ID: felt252 = 0x2ceccef7f994940b3962a6c67e0ba4fcd37df7d131417c604f91e03caecc1cd;

//
// Account
//

#[starknet::interface]
pub trait ISRC6<TState> {
    fn __execute__(self: @TState, calls: Array<Call>) -> Array<Span<felt252>>;
    fn __validate__(self: @TState, calls: Array<Call>) -> felt252;
    fn is_valid_signature(self: @TState, hash: Array<felt252>, signature: Array<felt252>) -> felt252;
}

#[starknet::interface]
pub trait IDeclarer<TState> {
    fn __validate_declare__(self: @TState, class_hash: felt252) -> felt252;
}

#[starknet::interface]
pub trait IDeployable<TState> {
    fn __validate_deploy__(
        self: @TState,
        class_hash: felt252,
        contract_address_salt: felt252,
        core_validator: felt252,
        public_key: felt252
    ) -> felt252;
}

#[starknet::interface]
pub trait IModule<TState> {
    // @todo: discuss this function and how fragile it is
    fn __module_validate__(self: @TState, calldata: Array<felt252>);
    fn add_module(ref self: TState, class_hash: ClassHash);
    fn remove_module(ref self: TState, class_hash: ClassHash);
    fn update_core_module(ref self: TState, class_hash: ClassHash);
    fn get_core_module(self: @TState) -> ClassHash;
    fn is_module(self: @TState, class_hash: ClassHash) -> bool;
    fn call_on_module(self: @TState, class_hash: ClassHash, call: Call) -> Array<felt252>;
    fn execute_on_module(ref self: TState, class_hash: ClassHash, call: Call) -> Array<felt252>;
}

#[starknet::component]
pub mod AccountComponent {
    use smartr::store::Felt252ArrayStore;
    use smartr::component::{
        ICoreValidatorDispatcherTrait, ICoreValidatorLibraryDispatcher, IValidatorDispatcherTrait,
        IValidatorLibraryDispatcher
    };
    use smartr::component::{IConfigureDispatcherTrait, IConfigureLibraryDispatcher};
    use openzeppelin::account::utils::{MIN_TRANSACTION_VERSION, QUERY_VERSION, QUERY_OFFSET};
    use openzeppelin::account::utils::execute_calls;
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
        Account_core_validator: ClassHash,
        Account_modules: LegacyMap<ClassHash, bool>,
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
        pub const MODULE_IS_COREVALIDATOR: felt252 = 'Module: is core validator';
    }

    #[embeddable_as(SRC6Impl)]
    impl SRC6<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +Drop<TContractState>
    > of super::ISRC6<ComponentState<TContractState>> {
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
            let core_validator = self.Account_core_validator.read();
            if selector == selector!("__module_validate__") {
                let account = get_contract_address();
                assert(*calls.at(0).to == account, Errors::UNAUTHORIZED);
                let calldata = *calls.at(0).calldata;
                assert(calldata.len() > 1, Errors::MODULE_NOT_FOUND);
                let felt = *calldata.at(1);
                let class_hash: ClassHash = felt.try_into().unwrap();
                assert(self.Account_modules.read(class_hash), Errors::MODULE_NOT_INSTALLED);
                return IValidatorLibraryDispatcher { class_hash: class_hash }
                    .validate(core_validator, calls);
            }
            IValidatorLibraryDispatcher { class_hash: core_validator }
                .validate(core_validator, calls)
        }

        /// Verifies that the given signature is valid for the given hash.
        fn is_valid_signature(
            self: @ComponentState<TContractState>, hash: Array<felt252>, signature: Array<felt252>
        ) -> felt252 {
            let core_validator = self.Account_core_validator.read();
            ICoreValidatorLibraryDispatcher { class_hash: core_validator }
                .is_valid_signature(hash, signature)
        }
    }

    #[embeddable_as(DeclarerImpl)]
    impl Declarer<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +Drop<TContractState>
    > of super::IDeclarer<ComponentState<TContractState>> {
        /// Verifies the validity of the signature for the current transaction.
        /// This function is used by the protocol to verify `declare` transactions.
        fn __validate_declare__(
            self: @ComponentState<TContractState>, class_hash: felt252
        ) -> felt252 {
            // @todo: we should be able to rebuild the call with the class hash
            // and replace the call to validate_transaction() that is currently
            // based on the signature check, i.e. does not recompute the hash
            // to a call to the core validator with a recompted hash.
            self.validate_transaction()
        }
    }

    #[embeddable_as(DeployableImpl)]
    pub impl Deployable<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +Drop<TContractState>
    > of super::IDeployable<ComponentState<TContractState>> {
        /// Verifies the validity of the signature for the current transaction.
        /// This function is used by the protocol to verify `deploy_account` transactions.
        fn __validate_deploy__(
            self: @ComponentState<TContractState>,
            class_hash: felt252,
            contract_address_salt: felt252,
            core_validator: felt252,
            public_key: felt252
        ) -> felt252 {
            // @todo: we should be able to rebuild the call with the class hash
            // and replace the call to validate_transaction() that is currently
            // based on the signature check, i.e. does not recompute the hash
            // to a call to the core validator with a recompted hash.
            self.validate_transaction()
        }
    }

    #[embeddable_as(ModuleImpl)]
    pub impl Module<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +Drop<TContractState>
    > of super::IModule<ComponentState<TContractState>> {
        fn __module_validate__(self: @ComponentState<TContractState>, calldata: Array<felt252>) {
            self.assert_only_self();
        }

        fn add_module(ref self: ComponentState<TContractState>, class_hash: ClassHash) {
            self.assert_only_self();
            let installed = self.Account_modules.read(class_hash);
            assert(!installed, Errors::MODULE_ALREADY_INSTALLED);
            self.Account_modules.write(class_hash, true);
        }

        fn remove_module(ref self: ComponentState<TContractState>, class_hash: ClassHash) {
            self.assert_only_self();
            self.assert_not_corevalidator(class_hash);
            let installed = self.Account_modules.read(class_hash);
            assert(installed, Errors::MODULE_NOT_INSTALLED);
            self.Account_modules.write(class_hash, false);
        }

        fn is_module(self: @ComponentState<TContractState>, class_hash: ClassHash) -> bool {
            self.Account_modules.read(class_hash)
        }

        fn update_core_module(ref self: ComponentState<TContractState>, class_hash: ClassHash) {
            self.assert_only_self();
            self.assert_not_corevalidator(class_hash);
            // Note 1: leaves the current core module installed as a secondary validator.
            // Note 2: the core module should be installed as a secondary validator before
            // updating it as the core validator.
            let installed = self.Account_modules.read(class_hash);
            assert(installed, Errors::MODULE_NOT_INSTALLED);
            self.Account_core_validator.write(class_hash);
        }

        fn get_core_module(self: @ComponentState<TContractState>) -> ClassHash {
            self.Account_core_validator.read()
        }

        fn call_on_module(
            self: @ComponentState<TContractState>, class_hash: ClassHash, call: Call
        ) -> Array<felt252> {
            let is_module = self.is_module(class_hash);
            assert(is_module, Errors::MODULE_NOT_INSTALLED);
            IConfigureLibraryDispatcher { class_hash }.call(call)
        }

        fn execute_on_module(
            ref self: ComponentState<TContractState>, class_hash: ClassHash, call: Call
        ) -> Array<felt252> {
            self.assert_only_self();
            let is_module = self.is_module(class_hash);
            assert(is_module, Errors::MODULE_NOT_INSTALLED);
            IConfigureLibraryDispatcher { class_hash }.execute(call)
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
        fn initializer(
            ref self: ComponentState<TContractState>, core_validator: felt252, public_key: felt252
        ) {
            let mut src5_component = get_dep_component_mut!(ref self, SRC5);
            src5_component.register_interface(super::ISRC6_ID);
            assert(core_validator != 0, Errors::INVALID_SIGNATURE);
            let core_validator_address: ClassHash = core_validator.try_into().unwrap();
            self.Account_core_validator.write(core_validator_address);
            self.Account_modules.write(core_validator_address, true);
            let core = ICoreValidatorLibraryDispatcher { class_hash: core_validator_address };
            core.initialize(public_key);
        }

        /// Validates that the caller is the account itself. Otherwise it reverts.
        fn assert_only_self(self: @ComponentState<TContractState>) {
            let caller = get_caller_address();
            let self = get_contract_address();
            assert(self == caller, Errors::UNAUTHORIZED);
        }

        /// Validates that the class hash is not the core validator.
        fn assert_not_corevalidator(self: @ComponentState<TContractState>, class_hash: ClassHash) {
            let corevalidatorHash = self.Account_core_validator.read();
            assert(corevalidatorHash != class_hash, Errors::MODULE_IS_COREVALIDATOR);
        }

        /// Validates the signature for the current transaction.
        /// Returns the short string `VALID` if valid, otherwise it reverts.
        fn validate_transaction(self: @ComponentState<TContractState>) -> felt252 {
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
            let core_validator = self.Account_core_validator.read();
            ICoreValidatorLibraryDispatcher { class_hash: core_validator }
                .is_valid_signature(tx_hash, sig)
        }

        fn notify_owner_addition(
            ref self: ComponentState<TContractState>, owner_public_key: felt252
        ) {
            self.assert_only_self();
            self.emit(OwnerAdded { new_owner_guid: owner_public_key });
        }

        fn notify_owner_removal(
            ref self: ComponentState<TContractState>, owner_public_key: felt252
        ) {
            self.assert_only_self();
            self.emit(OwnerRemoved { removed_owner_guid: owner_public_key });
        }
    }
}
