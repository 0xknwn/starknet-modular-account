// SPDX-License-Identifier: MIT

#[starknet::contract]
mod CoreValidator {
    use smartr::module::ValidatorComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use smartr::account::AccountComponent;
    use smartr::module::IConfigure;
    use starknet::account::Call;

    component!(path: ValidatorComponent, storage: validator, event: ValidatorEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccountComponent, storage: account, event: AccountEvent);

    #[abi(embed_v0)]
    impl ValidatorImpl = ValidatorComponent::ValidatorImpl<ContractState>;
    #[abi(embed_v0)]
    impl PublicKeysImpl = AccountComponent::PublicKeysImpl<ContractState>;

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
            let keys = self.account.get_public_keys();
            let mut i = 0;
            while i < keys.len() {
              output.append(*keys.at(i));
              i += 1;
            }
          } 
          if !found {
            assert(false, 'Invalid selector');
          }
          output
        }

        fn execute(ref self: ContractState, call: Call) -> Array<felt252> {
            array![]
        }
    }

}
