#!/bin/bash

set -e

npx tsc --build
node dist/06-setup.js
node dist/06-declare-class.js
node dist/06-add-module.js
node dist/06-sessionkey-transaction.js
node dist/06-block-sessionkey.js
node dist/06-remove-module.js
