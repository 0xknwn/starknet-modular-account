source ./.env.testnet

for c in $(find artifacts -iname '*.contract_class.json' -print); do
  name=$(echo $c | cut -d'/' -f2 | cut -d'.' -f1)
  echo $name
  starkli declare --watch --fee-token STRK \
    artifacts/${name}.contract_class.json \
      --casm-file artifacts/${name}.compiled_contract_class.json  
done 
