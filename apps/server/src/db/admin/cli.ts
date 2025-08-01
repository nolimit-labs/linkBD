#!/usr/bin/env node

// This file now redirects to the modular CLI structure
import { runCLI } from './cli/index.js';

runCLI()
  .catch((error) => {
    console.error(`CLI failed: ${error.message}`);
    process.exit(1);
  });