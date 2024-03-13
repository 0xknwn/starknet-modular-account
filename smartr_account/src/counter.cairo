#[starknet::interface]
trait ICounter<TContractState> {
    fn increment(ref self: TContractState);
    fn get(self: @TContractState) -> u64;
    fn reset(ref self: TContractState);
}

#[starknet::contract]
mod Counter {
    use starknet::{ContractAddress, get_caller_address};

    #[storage]
    struct Storage {
        contract_owner: ContractAddress,
        counter: u64,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.contract_owner.write(owner);
        self.counter.write(0);
    }

    #[abi(embed_v0)]
    impl CounterImpl of super::ICounter<ContractState> {
        // Increases the balance by the given amount.
        fn increment(ref self: ContractState) {
            self.counter.write(self.counter.read() + 1);
        }

        // Gets the balance.
        fn get(self: @ContractState) -> u64 {
            self.counter.read()
        }

        // Resets the balance to 0.
        fn reset(ref self: ContractState) {
            let caller = get_caller_address();
            assert(caller == self.contract_owner.read(), 'reset() requires owner');
            self.counter.write(0);
        }
    }
}


use snforge_std::errors::{SyscallResultStringErrorTrait, PanicDataOrString};

#[cfg(test)]
mod tests {
    use snforge_std::cheatcodes::contract_class::ContractClassTrait;
    use snforge_std::{declare};
    use super::{ICounterDispatcher, ICounterDispatcherTrait};
    use snforge_std::{start_prank, CheatTarget};
    use starknet::{ContractAddress};

    #[test]
    fn test_counter_increment() {
        let contract = declare("Counter");
        let owner: felt252 = 1;
        let contract_address = contract.deploy(@array![owner]).unwrap();
        let dispatcher = ICounterDispatcher { contract_address };
        dispatcher.increment();
        let counter = dispatcher.get();
        assert_eq!(counter, 1, "counter should be 1");
    }

    #[test]
    fn test_success_reset() {
        let contract = declare("Counter");
        let owner: felt252 = 1;
        let contract_address = contract.deploy(@array![owner]).unwrap();
        let dispatcher = ICounterDispatcher { contract_address };
        dispatcher.increment();
        let counter = dispatcher.get();
        assert_eq!(counter, 1, "counter should be 1");
        let caller_address: ContractAddress = 1.try_into().unwrap();
        start_prank(CheatTarget::One(contract_address), caller_address);
        dispatcher.reset();
        let counter = dispatcher.get();
        assert_eq!(counter, 0, "counter should be 0");
    }

    #[test]
    #[should_panic(expected: ('reset() requires owner',))]
    fn test_fail_reset() {
        let contract = declare("Counter");
        let owner: felt252 = 1;
        let contract_address = contract.deploy(@array![owner]).unwrap();
        let dispatcher = ICounterDispatcher { contract_address };
        let caller_address: ContractAddress = 2.try_into().unwrap();
        start_prank(CheatTarget::One(contract_address), caller_address);
        dispatcher.reset();
    }
}
