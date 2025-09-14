#!/bin/bash

# Firefox build wrapper script using Node.js 10.24.1
# This avoids primordials issues with Gulp 3.9.1 and newer Node versions

export PATH="/home/andrei/.ndenv/versions/10.24.1/bin:$PATH"

echo "Using Node.js version: $(node --version)"
echo "Using npm version: $(npm --version)"

# Verify we're using the right Node version before proceeding
NODE_VERSION=$(node --version)
if [[ ! "$NODE_VERSION" =~ ^v10\. ]]; then
  echo "Error: Expected Node.js v10.x.x but got $NODE_VERSION"
  echo "Make sure Node.js 10.24.1 is installed with: ndenv install 10.24.1"
  exit 1
fi

echo "Building Firefox extension with Node 10..."
npm run build:firefox