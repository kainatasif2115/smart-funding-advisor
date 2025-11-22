#!/bin/bash

echo "=========================================="
echo "Starting Backend with AI (Proxy Fix)"
echo "=========================================="
echo ""

# Completely remove proxy variables
export HTTP_PROXY=
export HTTPS_PROXY=
export http_proxy=
export https_proxy=
export NO_PROXY=
export no_proxy=

unset HTTP_PROXY
unset HTTPS_PROXY
unset http_proxy
unset https_proxy
unset NO_PROXY
unset no_proxy

echo "✓ Proxy variables cleared"
echo ""
echo "Starting Python app with AI enabled..."
echo ""

exec python3 app.py
