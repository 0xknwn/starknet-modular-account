#!/bin/bash

set -e

npx tsc --build
node dist/03-setup.js
