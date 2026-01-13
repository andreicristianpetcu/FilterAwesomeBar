#!/bin/bash

# Node.js wrapper script that forces Node 10.24.1 for all node commands
# This ensures compatibility with Gulp 3.9.1 and avoids primordials issues

# Set the Node version we want to use
NODE_VERSION="10.24.1"
NODE_PATH="/home/andrei/.ndenv/versions/${NODE_VERSION}/bin"

# Check if the required Node version is installed
if [ ! -d "/home/andrei/.ndenv/versions/${NODE_VERSION}" ]; then
    echo "Error: Node.js ${NODE_VERSION} is not installed"
    echo "Please install it with: ndenv install ${NODE_VERSION}"
    exit 1
fi

# Export the correct PATH with our Node version first
export PATH="${NODE_PATH}:$PATH"

# Remove any NDENV_VERSION that might override our PATH
unset NDENV_VERSION

# Execute the command passed to this script
exec "$@"