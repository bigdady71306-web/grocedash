#!/bin/bash
# GroceDash Auto Test Runner
# Usage:
#   ./run-tests.sh                         # public tests only (login skipped)
#   ./run-tests.sh --password "MyPass123"  # full suite with auth
echo "Running GroceDash tests..."
node /Users/jarvis/.openclaw/workspace/grocedash/test/autotest.js "$@"
