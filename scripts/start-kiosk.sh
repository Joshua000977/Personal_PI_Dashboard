#!/usr/bin/env bash

set -u

DASHBOARD_URL="http://127.0.0.1:5173"
LOG_DIRECTORY="/home/admin/.local/state"
LOG_FILE="$LOG_DIRECTORY/pi-dashboard-kiosk.log"

mkdir -p "$LOG_DIRECTORY"

# Write Chromium and startup messages into a log file.
exec >> "$LOG_FILE" 2>&1

echo "Starting Personal Pi Dashboard kiosk..."

# Do not open Chromium until the frontend actually responds.
until /usr/bin/curl -fsS "$DASHBOARD_URL" > /dev/null; do
  echo "Waiting for frontend..."
  sleep 2
done

echo "Frontend is ready. Starting Chromium."

exec /usr/bin/chromium \
  --password-store=basic \
  --user-data-dir=/home/admin/.config/pi-dashboard-chromium \
  --force-device-scale-factor=1.75 \
  --kiosk \
  --start-maximized \
  --no-first-run \
  --noerrdialogs \
  --disable-session-crashed-bubble \
  "$DASHBOARD_URL"
