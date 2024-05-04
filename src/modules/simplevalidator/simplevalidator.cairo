// SPDX-License-Identifier: MIT

#[starknet::contract]
mod SimpleValidator {
    use smartr::component::{ValidatorComponent, IValidator};
    use openzeppelin::account::utils::{is_valid_stark_signature};
    use openzeppelin::introspection::src5::SRC5Component;
    use starknet::{get_caller_address, get_contract_address};
    use smartr::component::AccountComponent;
    use starknet::class_hash::ClassHash;
    use starknet::account::Call;

    component!(path: ValidatorComponent, storage: validator, event: ValidatorEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccountComponent, storage: account, event: AccountEvent);

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

        fn validate(self: @ContractState, grantor_class: ClassHash, calls: Array<Call>) -> felt252 {
            starknet::VALIDATED
        }
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
