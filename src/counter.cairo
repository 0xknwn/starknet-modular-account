#[starknet::interface]
trait ICounter<TContractState> {
    fn increment(ref self: TContractState);
    fn increment_by(ref self: TContractState, value: u64);
    fn get(self: @TContractState) -> u64;
    fn reset(ref self: TContractState);
}

#[starknet::contract]
mod Counter {
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::upgrades::UpgradeableComponent;
    use openzeppelin::upgrades::interface::IUpgradeable;

    use starknet::{ClassHash, ContractAddress};

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;

    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;
    impl UpgradableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        counter: u64,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.ownable.initializer(owner);
    }

    #[abi(embed_v0)]
    impl CounterImpl of super::ICounter<ContractState> {
        fn increment(ref self: ContractState) {
            self.counter.write(self.counter.read() + 1);
        }

        fn increment_by(ref self: ContractState, value: u64) {
            self.counter.write(self.counter.read() + value);
        }

        fn get(self: @ContractState) -> u64 {
            self.counter.read()
        }

        fn reset(ref self: ContractState) {
            self.ownable.assert_only_owner();
            self.counter.write(0);
        }
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.ownable.assert_only_owner();
            self.upgradeable._upgrade(new_class_hash);
        }
    }
}

use snforge_std::errors::{SyscallResultStringErrorTrait, PanicDataOrString};
#[cfg(test)]
mod tests {
    use snforge_std::cheatcodes::contract_class::ContractClassTrait;
    use snforge_std::{declare};
    use super::{ICounterDispatcher, ICounterDispatcherTrait};
    use openzeppelin::access::ownable::interface::{IOwnable, IOwnableCamelOnly};
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
    #[should_panic(expected: ('Caller is not the owner',))]
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