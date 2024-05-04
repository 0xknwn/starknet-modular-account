# The SessionKey Validator Module

The SessionKey Validator Module is an implementation of a Validator Module for
the Starknet Modular Account. It must be used as a secondary Validator for the
Account and requires a Core Validator module to authorize the sessionkey. This
document explains the features, the configuration and some of the Internals
of this module.

- [The SessionKey Validator Module](#the-sessionkey-validator-module)
  - [Enabling and Disabling the Module](#enabling-and-disabling-the-module)
  - [Validation](#validation)
  - [Module Configuration](#module-configuration)
    - [Requesting and Granting a Session Key Grant](#requesting-and-granting-a-session-key-grant)
    - [Using Policies](#using-policies)
    - [Merkle Root and Merkle Proof](#merkle-root-and-merkle-proof)
  - [Integration in the SDK](#integration-in-the-sdk)

## Enabling and Disabling the Module

## Validation

- How the hash is generated?
- How the signature is checked
- What else is being checked

## Module Configuration

- Offline Signature
- How to block a session key

### Requesting and Granting a Session Key Grant

### Using Policies

### Merkle Root and Merkle Proof

## Integration in the SDK

- Sign a Key
- Decorate the Transaction
- Manage Policies and provide proofs
!
