#!/bin/bash

# Firefox build wrapper script using Node.js 10.24.1
# This ensures compatibility with Gulp 3.9.1 and old dependencies

set -e  # Exit on any error

echo "=== Firefox Extension Build Script ==="
echo ""

# Show versions we'll be using
echo "Checking Node.js compatibility..."
NODE_VERSION=$(./node-wrapper.sh node --version)
NPM_VERSION=$(./node-wrapper.sh npm --version)

echo "Using Node.js: $NODE_VERSION"
echo "Using npm: $NPM_VERSION"
echo ""

# Verify we're using Node 10.x
if [[ ! "$NODE_VERSION" =~ ^v10\. ]]; then
  echo "❌ Error: Expected Node.js v10.x but got $NODE_VERSION"
  echo "   Make sure Node.js 10.24.1 is installed with: ndenv install 10.24.1"
  exit 1
fi

echo "✅ Node.js version compatibility confirmed"
echo ""

# Clean install dependencies with Node 10
echo "🧹 Cleaning old dependencies..."
rm -rf node_modules package-lock.json

echo "📦 Installing dependencies with Node 10.24.1..."
./npm-old.sh install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Dependency installation failed"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

echo "🔨 Building Firefox extension..."
./npm-old.sh run build:firefox

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Firefox extension built successfully!"
    echo "📁 Output: dist/firefox/"

    if [ -d "dist/firefox" ]; then
        echo "📊 Build contents:"
        ls -la dist/firefox/
    fi
else
    echo "❌ Firefox extension build failed"
    exit 1
fi