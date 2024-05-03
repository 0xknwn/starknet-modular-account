#!/bin/bash

set -e

npx tsc --build
node dist/02-setup.js
node dist/02-execute-tx.js
