#!/usr/bin/env bash

# Example: ./run-tool.sh typedef arg1 arg2

tool=$1
args=${@:2}

npx ts-node --experimental-specifier-resolution=node --esm ./tools/$tool.ts $args
