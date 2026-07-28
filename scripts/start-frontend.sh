#!/usr/bin/env bash

set -e

export HOME="/home/admin"
export NVM_DIR="/home/admin/.nvm"

# Load Node.js if it was installed through NVM.
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
fi

cd /home/admin/Personal_PI_Dashboard/frontend

exec npm run preview -- \
  --host 127.0.0.1 \
  --port 5173 \
  --strictPort
