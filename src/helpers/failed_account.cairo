// SPDX-License-Identifier: MIT

#[starknet::contract(account)]
mod FailedAccount {
    use core::num::traits::Zero;
    use core::traits::Into;
    use openzeppelin::account::AccountComponent;
    use openzeppelin::account::AccountComponent::Errors;
    use openzeppelin::account::interface::ISRC6;
    use openzeppelin::account::utils::{execute_calls, is_valid_stark_signature};
    use openzeppelin::account::utils::{MIN_TRANSACTION_VERSION, QUERY_VERSION, QUERY_OFFSET};
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::upgrades::interface::IUpgradeable;
    use openzeppelin::upgrades::UpgradeableComponent;
    use starknet::{get_caller_address, get_tx_info};
    use starknet::account::Call;
    use starknet::ClassHash;

    component!(path: AccountComponent, storage: account, event: AccountEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    #[abi(embed_v0)]
    impl SRC6Impl of ISRC6<ContractState> {
        fn __execute__(self: @ContractState, mut calls: Array<Call>) -> Array<Span<felt252>> {
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

            // force the transaction failure before execution (not in estimate)
            let signature_len = tx_info.signature.len();
            let nonce = tx_info.nonce;
            let num_nonce: u64 = nonce.try_into().unwrap();
            if signature_len > 0 {
                assert(num_nonce < 2, 'nonce is too high');
            }

            execute_calls(calls)
        }

        /// Verifies the validity of the signature for the current transaction.
        /// This function is used by the protocol to verify `invoke` transactions.
        fn __validate__(self: @ContractState, mut calls: Array<Call>) -> felt252 {
            self.account.validate_transaction()
        }

        /// Verifies that the given signature is valid for the given hash.
        fn is_valid_signature(
            self: @ContractState, hash: felt252, signature: Array<felt252>
        ) -> felt252 {
            if self.account._is_valid_signature(hash, signature.span()) {
                starknet::VALIDATED
            } else {
                0
            }
        }
    }

    #[abi(embed_v0)]
    impl DeclarerImpl = AccountComponent::DeclarerImpl<ContractState>;
    #[abi(embed_v0)]
    impl DeployableImpl = AccountComponent::DeployableImpl<ContractState>;
    #[abi(embed_v0)]
    impl PublicKeyImpl = AccountComponent::PublicKeyImpl<ContractState>;
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;

    impl SRC5InternalImpl = SRC5Component::InternalImpl<ContractState>;
    impl AccountInternalImpl = AccountComponent::InternalImpl<ContractState>;
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        account: AccountComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AccountEvent: AccountComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, public_key: felt252) {
        self.account.initializer(public_key);
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.account.assert_only_self();
            self.upgradeable._upgrade(new_class_hash);
        }
    }
}
