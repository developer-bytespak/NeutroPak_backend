#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npm run build

echo "Running Prisma migrations..."
npx prisma migrate deploy --skip-generate

echo "Build complete!"
