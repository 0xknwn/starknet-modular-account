// SPDX-License-Identifier: MIT

#[starknet::contract]
mod StarkValidator {
    use core::traits::Into;
    use smartr::component::ValidatorComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use smartr::component::AccountComponent;
    use smartr::component::IConfigure;
    use starknet::account::Call;

    component!(path: ValidatorComponent, storage: validator, event: ValidatorEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccountComponent, storage: account, event: AccountEvent);

    #[abi(embed_v0)]
    impl ValidatorImpl = ValidatorComponent::ValidatorImpl<ContractState>;
    #[abi(embed_v0)]
    impl CoreValidatorImpl = ValidatorComponent::CoreValidatorImpl<ContractState>;
    #[abi(embed_v0)]
    impl PublicKeysImpl = ValidatorComponent::PublicKeysImpl<ContractState>;

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


    #[abi(embed_v0)]
    impl ConfigureImpl of IConfigure<ContractState> {
        fn call(self: @ContractState, call: Call) -> Array<felt252> {
            let mut output = ArrayTrait::<felt252>::new();
            let mut found = false;
            if call.selector == selector!("get_public_keys") {
                found = true;
                let keys = self.validator.get_public_keys();
                let mut i = 0;
                while i < keys.len() {
                    output.append(*keys.at(i));
                    i += 1;
                }
            }
            if call.selector == selector!("get_threshold") {
                found = true;
                let threshold = self.validator.get_threshold();
                let threshold_felt: felt252 = threshold.into();
                output.append(threshold_felt);
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
                self.validator.add_public_key(key);
            }
            if call.selector == selector!("remove_public_key") {
                found = true;
                if call.calldata.len() != 1 {
                    assert(false, 'Invalid payload');
                }
                let key = *call.calldata.at(0);
                self.validator.remove_public_key(key);
            }
            if call.selector == selector!("set_threshold") {
                found = true;
                if call.calldata.len() != 1 {
                    assert(false, 'Invalid payload');
                }
                let new_threshold_felt = *call.calldata.at(0);
                let new_threshold: u8 = new_threshold_felt.try_into().unwrap();
                self.validator.set_threshold(new_threshold);
            }
            if !found {
                assert(false, 'Invalid selector');
            }
            output
        }
    }
}
