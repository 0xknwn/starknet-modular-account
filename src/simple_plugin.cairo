use super::components::plugin::IPluginClass;

#[starknet::contract]
mod SimplePlugin {
    use starknet::account::Call;
    
    #[storage]
    struct Storage {
        Account_plugins_initialize: LegacyMap<felt252, felt252>
    }

    #[abi(embed_v0)]
    impl PluginClassImpl of super::IPluginClass<ContractState> {
        fn initialize(ref self: ContractState, args: Array<felt252>) {
            assert(args.len() >= 2, 'requires at least 2 args');
            let key = *args.at(0);
            let value = *args.at(1);
            self.Account_plugins_initialize.write(key, value);
        }

        fn is_valid_signature(self: @ContractState, hash: felt252, signature: Array<felt252>) -> bool {
            true
        }

        fn validate(self: @ContractState, calls: Array<Call>) {

        }
    }
}
