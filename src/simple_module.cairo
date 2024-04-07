use super::components::module::IModuleClass;

#[starknet::contract]
mod SimpleModule {
    use starknet::account::Call;
    
    #[storage]
    struct Storage {
        Account_modules_initialize: LegacyMap<felt252, felt252>
    }

    #[abi(embed_v0)]
    impl ModuleClassImpl of super::IModuleClass<ContractState> {
        fn initialize(ref self: ContractState, args: Array<felt252>) {
            assert(args.len() >= 2, 'requires at least 2 args');
            let key = *args.at(0);
            let value = *args.at(1);
            self.Account_modules_initialize.write(key, value);
        }

        fn is_valid_signature(self: @ContractState, hash: felt252, signature: Array<felt252>) -> bool {
            true
        }

        fn validate(self: @ContractState, calls: Array<Call>) -> felt252 {
            starknet::VALIDATED
        }
    }
}
