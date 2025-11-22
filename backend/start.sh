#!/bin/bash

# Unset proxy environment variables for Groq SDK compatibility
unset HTTP_PROXY
unset HTTPS_PROXY
unset http_proxy
unset https_proxy
unset no_proxy
unset NO_PROXY

echo "Starting backend without proxy settings..."
python3 app.py
