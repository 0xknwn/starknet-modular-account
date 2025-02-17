export STARKNET_RPC=http://localhost:5050
export STARKNET_KEYSTORE=$(pwd)/devnet/devnet-keystore
export STARKNET_KEYSTORE_PASSWORD=password
export STARKNET_ACCOUNT=$(pwd)/devnet/devnet-account0.json

for c in $(find target/dev -iname '*.contract_class.json' -print | grep -v unittest); do
  name=$(echo $c | cut -d'/' -f3 | cut -d'.' -f1)
  echo $name
  starkli declare --watch --fee-token STRK \
    target/dev/${name}.contract_class.json \
      --casm-file target/dev/${name}.compiled_contract_class.json  
done 
