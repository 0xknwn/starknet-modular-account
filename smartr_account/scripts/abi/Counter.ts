export const ABI = [
  {
    "type": "impl",
    "name": "CounterImpl",
    "interface_name": "smartr::counter::ICounter"
  },
  {
    "type": "interface",
    "name": "smartr::counter::ICounter",
    "items": [
      {
        "type": "function",
        "name": "increment",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u64"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "reset",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "constructor",
    "name": "constructor",
    "inputs": [
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "type": "event",
    "name": "smartr::counter::Counter::Event",
    "kind": "enum",
    "variants": []
  }
] as const;
