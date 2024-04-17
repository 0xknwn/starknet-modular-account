use starknet::ContractAddress;

#[starknet::interface]
trait ISwapRouter<TContractState> {
    fn swap(ref self: TContractState);
    fn faucet(ref self: TContractState, to: ContractAddress, amount: u128);
    fn set_tokens(
        ref self: TContractState, tokenAAddress: ContractAddress, tokenBAddress: ContractAddress
    );
}

#[starknet::contract]
mod SwapRouter {
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::security::pausable::PausableComponent;
    use openzeppelin::upgrades::UpgradeableComponent;
    use openzeppelin::upgrades::interface::IUpgradeable;
    use core::traits::Into;

    use starknet::{ClassHash, ContractAddress};

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    component!(path: PausableComponent, storage: pausable, event: PausableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    #[abi(embed_v0)]
    impl PausableImpl = PausableComponent::PausableImpl<ContractState>;

    impl PausableInternalImpl = PausableComponent::InternalImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;
    impl UpgradableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        tokenAAddress: ContractAddress,
        tokenBAddress: ContractAddress,
        #[substorage(v0)]
        pausable: PausableComponent::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        PausableEvent: PausableComponent::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.ownable.initializer(owner);
        self.pausable._pause();
    }

    #[abi(embed_v0)]
    impl SwapRouterImpl of super::ISwapRouter<ContractState> {
        fn swap(ref self: ContractState) {
            self.pausable.assert_not_paused();
            assert(false, 'Not Implemented');
        }

        fn faucet(ref self: ContractState, to: ContractAddress, amount: u128) {
            self.pausable.assert_not_paused();
            let tokenA: felt252 = self.tokenAAddress.read().into();
            assert(tokenA != 0, 'Token A address not set');
            let tokenB: felt252 = self.tokenBAddress.read().into();
            assert(tokenB != 0, 'Token B address not set');
            assert(amount < (2 * 1000000000000000000), 'Amount too high')
        }

        fn set_tokens(
            ref self: ContractState, tokenAAddress: ContractAddress, tokenBAddress: ContractAddress
        ) {
            self.ownable.assert_only_owner();
            let tokenA: felt252 = self.tokenAAddress.read().into();
            assert(tokenA != 0, 'Token A address not set');
            let tokenB: felt252 = self.tokenBAddress.read().into();
            assert(tokenB != 0, 'Token B address not set');
            self.tokenAAddress.write(tokenAAddress);
            self.tokenBAddress.write(tokenBAddress);
            self.pausable._unpause();
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
mod tests {}
