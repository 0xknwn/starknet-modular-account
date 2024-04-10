// SPDX-License-Identifier: MIT

#[starknet::contract]
mod DefaultValidator {
    use smartr::module::validator::ValidatorComponent;
    use openzeppelin::account::utils::{is_valid_stark_signature};
    use openzeppelin::introspection::src5::SRC5Component;
    use starknet::{get_caller_address, get_contract_address};
    use smartr::account::AccountComponent;

    component!(path: ValidatorComponent, storage: validator, event: ValidatorEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccountComponent, storage: account, event: AccountEvent);

    #[abi(embed_v0)]
    impl ValidatorImpl = ValidatorComponent::ValidatorImpl<ContractState>;

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
