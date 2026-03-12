#!/bin/bash

set -e

echo "Logging into NPM..."
npm login

echo "Publishing to NPM..."
npm publish
