// SPDX-License-Identifier: MIT

#[starknet::contract]
mod SimpleValidator {
    use smartr::component::{ValidatorComponent, IValidator};
    use openzeppelin::account::utils::{is_valid_stark_signature};
    use openzeppelin::introspection::src5::SRC5Component;
    use starknet::{get_caller_address, get_contract_address};
    use smartr::component::AccountComponent;
    use smartr::component::IVersion;
    use starknet::class_hash::ClassHash;
    use starknet::account::Call;

    component!(path: ValidatorComponent, storage: validator, event: ValidatorEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccountComponent, storage: account, event: AccountEvent);

    #[abi(embed_v0)]
    impl ValidatorImpl of IValidator<ContractState> {
        fn validate(self: @ContractState, grantor_class: ClassHash, calls: Array<Call>) -> felt252 {
            starknet::VALIDATED
        }
    }

    #[abi(embed_v0)]
    impl VersionImpl of IVersion<ContractState> {
        fn get_name(self: @ContractState) -> felt252 {
            'simple-validator'
        }
        fn get_version(self: @ContractState) -> felt252 {
            'v0.1.8'
        }
    }

    #[abi(embed_v0)]
    impl ConfigureImpl of IConfigure<ContractState> {
        fn call(self: @ContractState, call: Call) -> Array<felt252> {
            let mut output = ArrayTrait::<felt252>::new();
            let mut found = false;
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
            assert(false, 'Invalid selector');
        }
    }

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
