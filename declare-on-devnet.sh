export STARKNET_RPC=http://localhost:5050
export STARKNET_KEYSTORE=$(pwd)/devnet/devnet-keystore
export STARKNET_KEYSTORE_PASSWORD=password
export STARKNET_ACCOUNT=$(pwd)/devnet/devnet-account0.json

for c in $(find artifacts -iname '*.contract_class.json' -print); do
  name=$(echo $c | cut -d'/' -f2 | cut -d'.' -f1)
  echo $name
  starkli declare --watch --fee-token STRK \
    artifacts/${name}.contract_class.json \
      --casm-file artifacts/${name}.compiled_contract_class.json  
done 
