// SPDX-License-Identifier: MIT

#[starknet::contract]
mod SimpleValidator {
    use openzeppelin::account::AccountComponent;
    use openzeppelin::account::AccountComponent::Errors;
    use openzeppelin::account::utils::{is_valid_stark_signature};
    use starknet::{get_caller_address, get_contract_address};

    component!(path: AccountComponent, storage: account, event: AccountEvent);

    #[abi(per_item)]
    #[generate_trait]
    impl ValidatorImpl of ValidatorTrait {
        #[external(v0)]
        fn is_valid_signature(
            self: @ContractState, hash: felt252, signature: Array<felt252>
        ) -> felt252 {
            if self._is_valid_signature(hash, signature.span()) {
                starknet::VALIDATED
            } else {
                0
            }
        }

        #[external(v0)]
        fn initializer(ref self: ContractState, public_key: felt252) {
            self._init_public_key(public_key);
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _is_valid_signature(
            self: @ContractState, hash: felt252, signature: Span<felt252>
        ) -> bool {
            let public_key = self.account.Account_public_key.read();
            is_valid_stark_signature(hash, public_key, signature)
        }

        fn _init_public_key(ref self: ContractState, public_key: felt252) {
            self.account.Account_public_key.write(public_key);
        }

        fn assert_only_self(self: @ContractState) {
            let caller = get_caller_address();
            let self = get_contract_address();
            assert(self == caller, Errors::UNAUTHORIZED);
        }
    }

    #[storage]
    struct Storage {
        #[substorage(v0)]
        account: AccountComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AccountEvent: AccountComponent::Event,
    }
}
