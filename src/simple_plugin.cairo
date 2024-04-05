use super::components::plugin::IPluginClass;

#[starknet::contract]
mod SimplePlugin {
    use starknet::account::Call;

    #[storage]
    struct Storage {}

    #[abi(embed_v0)]
    impl PluginClassImpl of super::IPluginClass<ContractState> {
        fn initialize(ref self: ContractState, calls: Array<Call>) {

        }

        fn is_valid_signature(self: @ContractState, hash: felt252, signature: Array<felt252>) -> bool {
            true
        }

        fn validate(self: @ContractState, calls: Array<Call>) {

        }
    }
}
