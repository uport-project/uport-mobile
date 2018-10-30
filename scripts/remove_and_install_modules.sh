#!/bin/bash

echo "removing node_modules..."
rm -rf node_modules
echo "Cleaning yarn cache"
yarn cache clean
echo "installing dependencies..."
yarn
