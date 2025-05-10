#!/bin/bash

# Rename all TypeScript files to JavaScript
echo "Converting TypeScript files to JavaScript..."
find . -name "*.tsx" -not -path "./node_modules/*" -exec sh -c 'cp "$1" "${1%.tsx}.jsx"' _ {} \;
find . -name "*.ts" -not -path "./node_modules/*" -not -name "*.d.ts" -exec sh -c 'cp "$1" "${1%.ts}.js"' _ {} \;

# Run the build
echo "Running build..."
npm run build
