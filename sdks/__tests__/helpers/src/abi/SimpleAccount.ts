export const ABI = [
  {
    "type": "impl",
    "name": "DeployableImpl",
    "interface_name": "smartr::helpers::simple_account::IDeployable"
  },
  {
    "type": "interface",
    "name": "smartr::helpers::simple_account::IDeployable",
    "items": [
      {
        "type": "function",
        "name": "__validate_deploy__",
        "inputs": [
          {
            "name": "class_hash",
            "type": "core::felt252"
          },
          {
            "name": "contract_address_salt",
            "type": "core::felt252"
          },
          {
            "name": "public_key",
            "type": "core::felt252"
          },
          {
            "name": "more",
            "type": "core::felt252"
          }
        ],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "impl",
    "name": "UpgradeableImpl",
    "interface_name": "openzeppelin::upgrades::interface::IUpgradeable"
  },
  {
    "type": "interface",
    "name": "openzeppelin::upgrades::interface::IUpgradeable",
    "items": [
      {
        "type": "function",
        "name": "upgrade",
        "inputs": [
          {
            "name": "new_class_hash",
            "type": "core::starknet::class_hash::ClassHash"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "SRC6Impl",
    "interface_name": "openzeppelin::account::interface::ISRC6"
  },
  {
    "type": "struct",
    "name": "core::array::Span::<core::felt252>",
    "members": [
      {
        "name": "snapshot",
        "type": "@core::array::Array::<core::felt252>"
      }
    ]
  },
  {
    "type": "struct",
    "name": "core::starknet::account::Call",
    "members": [
      {
        "name": "to",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "selector",
        "type": "core::felt252"
      },
      {
        "name": "calldata",
        "type": "core::array::Span::<core::felt252>"
      }
    ]
  },
  {
    "type": "interface",
    "name": "openzeppelin::account::interface::ISRC6",
    "items": [
      {
        "type": "function",
        "name": "__execute__",
        "inputs": [
          {
            "name": "calls",
            "type": "core::array::Array::<core::starknet::account::Call>"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<core::array::Span::<core::felt252>>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "__validate__",
        "inputs": [
          {
            "name": "calls",
            "type": "core::array::Array::<core::starknet::account::Call>"
          }
        ],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "is_valid_signature",
        "inputs": [
          {
            "name": "hash",
            "type": "core::felt252"
          },
          {
            "name": "signature",
            "type": "core::array::Array::<core::felt252>"
          }
        ],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "impl",
    "name": "DeclarerImpl",
    "interface_name": "openzeppelin::account::interface::IDeclarer"
  },
  {
    "type": "interface",
    "name": "openzeppelin::account::interface::IDeclarer",
    "items": [
      {
        "type": "function",
        "name": "__validate_declare__",
        "inputs": [
          {
            "name": "class_hash",
            "type": "core::felt252"
          }
        ],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "impl",
    "name": "PublicKeyImpl",
    "interface_name": "openzeppelin::account::interface::IPublicKey"
  },
  {
    "type": "interface",
    "name": "openzeppelin::account::interface::IPublicKey",
    "items": [
      {
        "type": "function",
        "name": "get_public_key",
        "inputs": [],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "set_public_key",
        "inputs": [
          {
            "name": "new_public_key",
            "type": "core::felt252"
          }
        ],
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
        "name": "public_key",
        "type": "core::felt252"
      },
      {
        "name": "more",
        "type": "core::felt252"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin::account::account::AccountComponent::OwnerAdded",
    "kind": "struct",
    "members": [
      {
        "name": "new_owner_guid",
        "type": "core::felt252",
        "kind": "key"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin::account::account::AccountComponent::OwnerRemoved",
    "kind": "struct",
    "members": [
      {
        "name": "removed_owner_guid",
        "type": "core::felt252",
        "kind": "key"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin::account::account::AccountComponent::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "OwnerAdded",
        "type": "openzeppelin::account::account::AccountComponent::OwnerAdded",
        "kind": "nested"
      },
      {
        "name": "OwnerRemoved",
        "type": "openzeppelin::account::account::AccountComponent::OwnerRemoved",
        "kind": "nested"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin::introspection::src5::SRC5Component::Event",
    "kind": "enum",
    "variants": []
  },
  {
    "type": "event",
    "name": "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Upgraded",
    "kind": "struct",
    "members": [
      {
        "name": "class_hash",
        "type": "core::starknet::class_hash::ClassHash",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "Upgraded",
        "type": "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Upgraded",
        "kind": "nested"
      }
    ]
  },
  {
    "type": "event",
    "name": "smartr::helpers::simple_account::SimpleAccount::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "AccountEvent",
        "type": "openzeppelin::account::account::AccountComponent::Event",
        "kind": "flat"
      },
      {
        "name": "SRC5Event",
        "type": "openzeppelin::introspection::src5::SRC5Component::Event",
        "kind": "flat"
      },
      {
        "name": "UpgradeableEvent",
        "type": "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Event",
        "kind": "flat"
      }
    ]
  }
] as const;
