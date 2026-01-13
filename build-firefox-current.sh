#!/bin/bash

# Firefox build script using current Node.js version
# Now that we have Gulp 4, it should work with Node 22

echo "Using Node.js version: $(node --version)"
echo "Using npm version: $(npm --version)"

echo "Building Firefox extension..."
npm run build:firefox