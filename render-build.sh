#!/bin/bash
set -e

echo "Installing all dependencies (including devDependencies for build)..."
npm ci

echo "Building TypeScript..."
npm run build

echo "Removing devDependencies to reduce production size..."
npm prune --production

echo "Build complete!"
