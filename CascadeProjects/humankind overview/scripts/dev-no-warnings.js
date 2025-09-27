#!/usr/bin/env node

// Suppress punycode deprecation warnings by overriding process.emitWarning
const originalEmitWarning = process.emitWarning;
process.emitWarning = function(warning, name, code, ...args) {
  if (code === 'DEP0040') {
    // Suppress punycode deprecation warnings (DEP0040)
    return;
  }
  originalEmitWarning.call(process, warning, name, code, ...args);
};

// Import and run Next.js dev server
const { spawn } = require('child_process');
const path = require('path');

// Use npx to run next, which handles the binary path correctly on Windows
const child = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: '--no-deprecation'
  },
  shell: true
});

child.on('close', (code) => {
  process.exit(code);
});

child.on('error', (err) => {
  console.error('Failed to start Next.js dev server:', err);
  process.exit(1);
});
