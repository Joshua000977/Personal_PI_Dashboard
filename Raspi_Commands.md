# Raspberry Pi Command Reference

A practical command cheat sheet for Raspberry Pi OS, Linux, Git, Python, FastAPI, React, Vite, systemd, Chromium kiosk mode, and the **Personal Pi Dashboard** project.

This file is intended to be safe to commit to GitHub.

## Placeholder convention

Replace placeholders such as these with values from your own Raspberry Pi:

```text
<USER>          Linux username
<PROJECT_DIR>   Project directory
<SERVICE_NAME>  systemd service name
<PORT>          Network port
<IP_ADDRESS>    Local network address
```

Prefer `$HOME` and `~` where possible so commands do not contain a personal username.

Example project path:

```bash
~/Personal_PI_Dashboard
```

Do not commit passwords, access tokens, SSH private keys, API keys, private `.env` files, or authentication cookies.

---

# 1. Terminal basics

## Show the current directory

```bash
pwd
```

## Go to the home directory

```bash
cd ~
```

## Go into a folder

```bash
cd folder_name
```

Example:

```bash
cd ~/Personal_PI_Dashboard
```

## Go one directory upward

```bash
cd ..
```

## Go two directories upward

```bash
cd ../..
```

## List files

```bash
ls
```

## Detailed file list

```bash
ls -l
```

## Include hidden files

```bash
ls -la
```

## Show a directory tree

Install `tree`:

```bash
sudo apt update
sudo apt install tree
```

Use it:

```bash
tree
```

Limit the depth:

```bash
tree -L 3
```

## Clear the terminal

```bash
clear
```

Keyboard shortcut:

```text
Ctrl + L
```

## Stop a running terminal program

```text
Ctrl + C
```

## Suspend a terminal program

```text
Ctrl + Z
```

## Paste into a Linux terminal

```text
Ctrl + Shift + V
```

This is useful when connected through RealVNC.

---

# 2. Files and folders

## Create a directory

```bash
mkdir folder_name
```

## Create nested directories

```bash
mkdir -p path/to/folder
```

## Create an empty file

```bash
touch filename.txt
```

## Copy a file

```bash
cp source.txt destination.txt
```

## Copy a folder recursively

```bash
cp -r source_folder destination_folder
```

## Move or rename a file

```bash
mv old_name.txt new_name.txt
```

## Move a file into another folder

```bash
mv filename.txt destination_folder/
```

## Delete a file

```bash
rm filename.txt
```

## Delete an empty folder

```bash
rmdir folder_name
```

## Delete a folder recursively

Use carefully:

```bash
rm -r folder_name
```

Force recursive deletion:

```bash
rm -rf folder_name
```

Never run `rm -rf` on a path unless the path has been checked carefully.

## Display a text file

```bash
cat filename.txt
```

## Read a long file page by page

```bash
less filename.txt
```

Exit `less`:

```text
q
```

## Show the beginning of a file

```bash
head filename.txt
```

## Show the last lines of a file

```bash
tail filename.txt
```

## Follow a changing log file

```bash
tail -f filename.log
```

---

# 3. Editing files with Nano

## Open or create a file

```bash
nano filename
```

## Save in Nano

```text
Ctrl + O
Enter
```

## Exit Nano

```text
Ctrl + X
```

## Search inside Nano

```text
Ctrl + W
```

## Cut a line

```text
Ctrl + K
```

## Paste a cut line

```text
Ctrl + U
```

---

# 4. Permissions and ownership

## Make a script executable

```bash
chmod +x script.sh
```

## Show file permissions

```bash
ls -l
```

## Give the owner read, write, and execute permissions

```bash
chmod 700 script.sh
```

## Give everyone execute permission

```bash
chmod 755 script.sh
```

## Change file owner

```bash
sudo chown <USER>:<USER> filename
```

## Change folder ownership recursively

```bash
sudo chown -R <USER>:<USER> folder_name
```

## Check the current username

```bash
whoami
```

## Check user and group IDs

```bash
id
```

---

# 5. Raspberry Pi OS package management

## Refresh the package list

```bash
sudo apt update
```

## Install available upgrades

```bash
sudo apt upgrade
```

## Full distribution upgrade

```bash
sudo apt full-upgrade
```

## Install a package

```bash
sudo apt install package_name
```

Example:

```bash
sudo apt install git curl htop
```

## Remove a package

```bash
sudo apt remove package_name
```

## Remove a package and its configuration

```bash
sudo apt purge package_name
```

## Remove unused dependencies

```bash
sudo apt autoremove
```

## Search for a package

```bash
apt search package_name
```

## Show package information

```bash
apt show package_name
```

---

# 6. System information

## Raspberry Pi model

```bash
cat /sys/firmware/devicetree/base/model
```

## Operating system information

```bash
cat /etc/os-release
```

## Kernel version

```bash
uname -r
```

## Full kernel and architecture information

```bash
uname -a
```

## CPU architecture

```bash
uname -m
```

## CPU information

```bash
lscpu
```

## Memory information

```bash
free -h
```

## Storage usage

```bash
df -h
```

## Folder size

```bash
du -sh folder_name
```

## Size of folders in the current directory

```bash
du -sh ./* | sort -h
```

## Uptime

```bash
uptime
```

## Boot time

```bash
who -b
```

## Current date and time

```bash
date
```

## Hostname

```bash
hostname
```

## Local IP addresses

```bash
hostname -I
```

---

# 7. Raspberry Pi temperature and throttling

## CPU temperature

```bash
vcgencmd measure_temp
```

## Throttling and undervoltage status

```bash
vcgencmd get_throttled
```

A completely clean result is:

```text
throttled=0x0
```

## ARM clock frequency

```bash
vcgencmd measure_clock arm
```

## Core voltage

```bash
vcgencmd measure_volts core
```

## Continuously watch the temperature

```bash
watch -n 2 vcgencmd measure_temp
```

Exit `watch`:

```text
Ctrl + C
```

## Monitor temperature through the Linux thermal file

```bash
cat /sys/class/thermal/thermal_zone0/temp
```

The value is normally in thousandths of a degree Celsius.

Example:

```text
65000 = 65.0 °C
```

---

# 8. Processes and performance

## Show running processes

```bash
ps aux
```

## Find a process

```bash
ps aux | grep process_name
```

## Interactive process monitor

```bash
top
```

## Better interactive process monitor

Install:

```bash
sudo apt install htop
```

Run:

```bash
htop
```

## Find a process ID by name

```bash
pgrep process_name
```

## Show matching process commands

```bash
pgrep -af process_name
```

## Stop a process by PID

```bash
kill <PID>
```

## Force-stop a process

```bash
kill -9 <PID>
```

## Stop processes by name

```bash
pkill process_name
```

## Stop a process using its full command line

```bash
pkill -f command_text
```

Examples:

```bash
pkill -f uvicorn
pkill -f vite
pkill chromium
```

---

# 9. Networking

## Show network interfaces

```bash
ip address
```

Short form:

```bash
ip a
```

## Show routing information

```bash
ip route
```

## Test internet or network connectivity

```bash
ping -c 4 example.com
```

## Test a local device

```bash
ping -c 4 <IP_ADDRESS>
```

## Show listening TCP ports

```bash
sudo ss -ltnp
```

## Check specific ports

```bash
sudo ss -ltnp | grep -E ':(5173|8000)'
```

## Test a web endpoint

```bash
curl http://127.0.0.1:<PORT>
```

## Request only HTTP headers

```bash
curl -I http://127.0.0.1:<PORT>
```

## Format JSON output

```bash
curl -s http://127.0.0.1:<PORT>/api/example | python3 -m json.tool
```

## Download a file

```bash
curl -O https://example.com/file.zip
```

## Show Wi-Fi status

```bash
nmcli device status
```

## Show available Wi-Fi networks

```bash
nmcli device wifi list
```

---

# 10. SSH and remote access

## Connect to the Raspberry Pi

```bash
ssh <USER>@<IP_ADDRESS>
```

## Copy a file to the Pi with SCP

```bash
scp local_file <USER>@<IP_ADDRESS>:~/destination/
```

## Copy a folder recursively

```bash
scp -r local_folder <USER>@<IP_ADDRESS>:~/destination/
```

## Copy a file from the Pi to the current computer

```bash
scp <USER>@<IP_ADDRESS>:~/remote_file .
```

## Generate an SSH key

```bash
ssh-keygen -t ed25519
```

Never commit these files:

```text
~/.ssh/id_ed25519
~/.ssh/id_rsa
```

Public keys such as `.pub` files are not secret, but private key files must remain private.

---

# 11. Git and GitHub

## Check Git installation

```bash
git --version
```

## Clone a repository

```bash
git clone https://github.com/OWNER/REPOSITORY.git
```

## Clone into a custom folder

```bash
git clone https://github.com/OWNER/REPOSITORY.git custom_folder
```

## Enter the repository

```bash
cd repository_name
```

## Check repository status

```bash
git status
```

## Show changed lines

```bash
git diff
```

## Add one file

```bash
git add filename
```

## Add all changes

```bash
git add .
```

## Commit changes

```bash
git commit -m "Describe the changes"
```

## Push changes

```bash
git push
```

## Pull the latest changes

```bash
git pull
```

## Show commit history

```bash
git log --oneline
```

## Show branches

```bash
git branch
```

## Create and switch to a branch

```bash
git switch -c branch_name
```

## Switch branches

```bash
git switch branch_name
```

## Configure Git name

Use a public-safe name that you are comfortable showing in commit history:

```bash
git config --global user.name "Your Name"
```

## Configure Git email

Use a GitHub no-reply email if you do not want to expose a personal email address:

```bash
git config --global user.email "YOUR_GITHUB_NOREPLY_EMAIL"
```

## Remove an already tracked generated folder

Example:

```bash
git rm -r --cached backend/__pycache__
```

## Useful `.gitignore` entries

```gitignore
# Python
__pycache__/
*.py[cod]
venv/
.venv/

# Node.js
node_modules/
dist/
dist-ssr/

# Environment and secrets
.env
.env.*
!.env.example

# Logs
*.log
logs/

# Editors
.vscode/*
!.vscode/extensions.json
.idea/
```

Never commit:

```text
.env
API keys
access tokens
passwords
private SSH keys
private certificates
browser profiles
authentication cookies
```

---

# 12. Python and virtual environments

## Check Python

```bash
python3 --version
```

## Check pip

```bash
python3 -m pip --version
```

## Install virtual environment support

```bash
sudo apt install python3-venv python3-pip
```

## Create a virtual environment

```bash
python3 -m venv venv
```

Alternative name:

```bash
python3 -m venv .venv
```

## Activate the virtual environment

```bash
source venv/bin/activate
```

Or:

```bash
source .venv/bin/activate
```

## Leave the virtual environment

```bash
deactivate
```

## Install a Python package

```bash
pip install package_name
```

## Install FastAPI, Uvicorn, and psutil

```bash
pip install fastapi uvicorn psutil
```

## Save dependencies

```bash
pip freeze > requirements.txt
```

## Install dependencies from a file

```bash
pip install -r requirements.txt
```

## Show installed packages

```bash
pip list
```

---

# 13. FastAPI backend

## Enter the backend directory

```bash
cd ~/Personal_PI_Dashboard/backend
```

## Activate the virtual environment

```bash
source venv/bin/activate
```

## Start FastAPI in development mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Explanation:

```text
main        Python file: main.py
app         FastAPI object inside main.py
0.0.0.0     Accept connections from other devices
8000        Backend port
--reload    Restart automatically after code changes
```

## Start without automatic reload

```bash
uvicorn main:app --host 127.0.0.1 --port 8000
```

Use this style for an automatic system service.

## Backend root URL

```text
http://127.0.0.1:8000
```

## FastAPI documentation

```text
http://127.0.0.1:8000/docs
```

## Personal Pi Dashboard endpoints

```text
http://127.0.0.1:8000/api/system
http://127.0.0.1:8000/api/system/details
```

## Test the API

```bash
curl -s http://127.0.0.1:8000/api/system | python3 -m json.tool
```

---

# 14. Node.js, npm, React, and Vite

## Check Node.js

```bash
node --version
```

## Check npm

```bash
npm --version
```

## Enter the frontend directory

```bash
cd ~/Personal_PI_Dashboard/frontend
```

## Install dependencies

```bash
npm install
```

## Start the Vite development server

```bash
npm run dev
```

## Build the optimized frontend

```bash
npm run build
```

The built files are normally created in:

```text
frontend/dist/
```

## Preview the built frontend

```bash
npm run preview -- --host 127.0.0.1 --port 5173 --strictPort
```

## Check dependencies

```bash
npm list
```

## Audit packages

```bash
npm audit
```

Do not blindly use:

```bash
npm audit fix --force
```

It may install breaking dependency versions.

## Install React Router

```bash
npm install react-router-dom
```

## Install an exact package version

```bash
npm install package_name@VERSION --save-exact
```

---

# 15. Personal Pi Dashboard development mode

Open two terminals.

## Terminal 1: backend

```bash
cd ~/Personal_PI_Dashboard/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Terminal 2: frontend

```bash
cd ~/Personal_PI_Dashboard/frontend
npm run dev
```

## Open the dashboard

```text
http://127.0.0.1:5173
```

## Stop development mode

Press in both terminals:

```text
Ctrl + C
```

Then leave the virtual environment:

```bash
deactivate
```

---

# 16. Build and reload workflow

After changing React or CSS for the automatically started version:

```bash
cd ~/Personal_PI_Dashboard/frontend
npm run build
sudo systemctl restart personal-pi-frontend.service
```

Reload Chromium:

```text
Ctrl + R
```

Hard reload without cached files:

```text
Ctrl + Shift + R
```

Restart only Chromium:

```bash
pkill chromium
~/Personal_PI_Dashboard/scripts/start-kiosk.sh &
```

A full Raspberry Pi reboot is not required for normal frontend changes.

---

# 17. systemd service management

## Reload service definitions

Run after creating or editing service files:

```bash
sudo systemctl daemon-reload
```

## Enable a service at boot

```bash
sudo systemctl enable <SERVICE_NAME>.service
```

## Enable and start immediately

```bash
sudo systemctl enable --now <SERVICE_NAME>.service
```

## Start a service

```bash
sudo systemctl start <SERVICE_NAME>.service
```

## Stop a service

```bash
sudo systemctl stop <SERVICE_NAME>.service
```

## Restart a service

```bash
sudo systemctl restart <SERVICE_NAME>.service
```

## Disable automatic startup

```bash
sudo systemctl disable <SERVICE_NAME>.service
```

## Show service status

```bash
systemctl status <SERVICE_NAME>.service --no-pager
```

## Show recent service logs

```bash
journalctl -u <SERVICE_NAME>.service -n 50 --no-pager
```

## Follow service logs live

```bash
journalctl -u <SERVICE_NAME>.service -f
```

## Show failed services

```bash
systemctl --failed
```

## Dashboard service examples

```bash
sudo systemctl start personal-pi-backend.service
sudo systemctl stop personal-pi-backend.service
sudo systemctl restart personal-pi-backend.service
```

```bash
sudo systemctl start personal-pi-frontend.service
sudo systemctl stop personal-pi-frontend.service
sudo systemctl restart personal-pi-frontend.service
```

---

# 18. Generic backend systemd service template

Create a service file:

```bash
sudo nano /etc/systemd/system/personal-pi-backend.service
```

Template:

```ini
[Unit]
Description=Personal Pi Dashboard FastAPI Backend
After=network.target

[Service]
Type=simple
User=<USER>
WorkingDirectory=/home/<USER>/Personal_PI_Dashboard/backend
ExecStart=/home/<USER>/Personal_PI_Dashboard/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=on-failure
RestartSec=3
Environment=PYTHONUNBUFFERED=1
Environment=HOME=/home/<USER>

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now personal-pi-backend.service
```

Do not use `--reload` inside the automatic backend service.

---

# 19. Generic frontend startup script

Create the scripts folder:

```bash
mkdir -p ~/Personal_PI_Dashboard/scripts
```

Create the script:

```bash
nano ~/Personal_PI_Dashboard/scripts/start-frontend.sh
```

Template:

```bash
#!/usr/bin/env bash

set -e

export HOME="/home/<USER>"
export NVM_DIR="/home/<USER>/.nvm"

if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
fi

cd /home/<USER>/Personal_PI_Dashboard/frontend

exec npm run preview -- \
  --host 127.0.0.1 \
  --port 5173 \
  --strictPort
```

Make it executable:

```bash
chmod +x ~/Personal_PI_Dashboard/scripts/start-frontend.sh
```

---

# 20. Generic frontend systemd service template

Create:

```bash
sudo nano /etc/systemd/system/personal-pi-frontend.service
```

Template:

```ini
[Unit]
Description=Personal Pi Dashboard React Frontend
After=network.target personal-pi-backend.service
Wants=personal-pi-backend.service

[Service]
Type=simple
User=<USER>
WorkingDirectory=/home/<USER>/Personal_PI_Dashboard/frontend
ExecStart=/home/<USER>/Personal_PI_Dashboard/scripts/start-frontend.sh
Restart=on-failure
RestartSec=3
Environment=HOME=/home/<USER>

[Install]
WantedBy=multi-user.target
```

Enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now personal-pi-frontend.service
```

---

# 21. Chromium and kiosk mode

## Close Chromium

```bash
pkill chromium
```

## Open the dashboard normally

Run from a terminal on the graphical Raspberry Pi desktop:

```bash
chromium http://127.0.0.1:5173
```

## Fullscreen application mode

```bash
chromium \
  --password-store=basic \
  --user-data-dir="$HOME/.config/pi-dashboard-chromium" \
  --app=http://127.0.0.1:5173 \
  --start-fullscreen \
  --start-maximized \
  --no-first-run \
  --noerrdialogs
```

## Kiosk mode

```bash
chromium \
  --ozone-platform=wayland \
  --password-store=basic \
  --user-data-dir="$HOME/.config/pi-dashboard-chromium" \
  --force-device-scale-factor=1.75 \
  --kiosk \
  --start-maximized \
  --no-first-run \
  --noerrdialogs \
  --disable-session-crashed-bubble \
  http://127.0.0.1:5173
```

`--password-store=basic` avoids the desktop keyring password dialog for the dedicated kiosk profile.

Do not save sensitive website passwords in this profile.

## Exit kiosk mode

```text
Alt + F4
```

## Start the existing kiosk script

```bash
~/Personal_PI_Dashboard/scripts/start-kiosk.sh &
```

## Start it independently from the current terminal

```bash
nohup ~/Personal_PI_Dashboard/scripts/start-kiosk.sh >/dev/null 2>&1 &
```

## Check Chromium processes

```bash
pgrep -a chromium
```

---

# 22. Generic kiosk startup script

Create:

```bash
nano ~/Personal_PI_Dashboard/scripts/start-kiosk.sh
```

Git-safe template:

```bash
#!/usr/bin/env bash

DASHBOARD_URL="http://127.0.0.1:5173"
LOG_DIRECTORY="$HOME/.local/state"
LOG_FILE="$LOG_DIRECTORY/pi-dashboard-kiosk.log"

mkdir -p "$LOG_DIRECTORY"

exec >> "$LOG_FILE" 2>&1

echo "Starting Personal Pi Dashboard kiosk..."

until /usr/bin/curl -fsS "$DASHBOARD_URL" > /dev/null; do
  echo "Waiting for frontend..."
  sleep 2
done

echo "Frontend is ready. Starting Chromium."

export XDG_RUNTIME_DIR="/run/user/$(id -u)"
export WAYLAND_DISPLAY="${WAYLAND_DISPLAY:-wayland-0}"
export XDG_SESSION_TYPE="wayland"

exec /usr/bin/chromium \
  --ozone-platform=wayland \
  --password-store=basic \
  --user-data-dir="$HOME/.config/pi-dashboard-chromium" \
  --force-device-scale-factor=1.75 \
  --kiosk \
  --start-maximized \
  --no-first-run \
  --noerrdialogs \
  --disable-session-crashed-bubble \
  "$DASHBOARD_URL"
```

Make it executable:

```bash
chmod +x ~/Personal_PI_Dashboard/scripts/start-kiosk.sh
```

## Kiosk log

```bash
cat ~/.local/state/pi-dashboard-kiosk.log
```

## Clear the kiosk log

```bash
> ~/.local/state/pi-dashboard-kiosk.log
```

## Follow the kiosk log

```bash
tail -f ~/.local/state/pi-dashboard-kiosk.log
```

---

# 23. Labwc desktop autostart

Current Raspberry Pi OS desktop versions may use Labwc.

## Create the configuration folder

```bash
mkdir -p ~/.config/labwc
```

## Edit the autostart file

```bash
nano ~/.config/labwc/autostart
```

Add:

```bash
/home/<USER>/Personal_PI_Dashboard/scripts/start-kiosk.sh &
```

The absolute path is required because desktop autostart should not depend on the current working directory.

## Enable desktop automatic login

```bash
sudo raspi-config nonint do_boot_behaviour B4
```

---

# 24. Display and browser debugging

## Check shell display variables

```bash
echo "$DISPLAY"
echo "$WAYLAND_DISPLAY"
echo "$XDG_SESSION_TYPE"
echo "$XDG_RUNTIME_DIR"
```

## Typical Wayland values

```text
WAYLAND_DISPLAY=wayland-0
XDG_SESSION_TYPE=wayland
XDG_RUNTIME_DIR=/run/user/<UID>
```

## Chromium error: Missing X server or `$DISPLAY`

This normally means Chromium tried to use X11 from a terminal without a graphical X11 session.

Use the Wayland option from a Raspberry Pi desktop session:

```bash
chromium --ozone-platform=wayland http://127.0.0.1:5173
```

## Check the Chromium executable

```bash
which chromium
which chromium-browser
```

## Browser viewport debugging

Temporary React display:

```jsx
<p>
  Viewport: {window.innerWidth} × {window.innerHeight}
</p>
```

Remove it after determining the effective viewport.

## Typical scale-factor example

A physical display may report a `1920 × 1080` browser viewport even when it is only 7 inches.

A scale factor of `1.75` produces an effective layout close to:

```text
1097 × 617
```

Chromium option:

```text
--force-device-scale-factor=1.75
```

---

# 25. Touchscreen debugging

## Install libinput tools

```bash
sudo apt update
sudo apt install libinput-tools
```

## List input devices

```bash
sudo libinput list-devices
```

## Search for touchscreen information

```bash
sudo libinput list-devices | grep -i -A 15 -B 3 touch
```

A touchscreen should normally include:

```text
Capabilities: touch
```

## Test normal scrolling

Use:

```text
Mouse wheel
Arrow keys
Page Up
Page Down
```

If these work but finger scrolling does not, the HTML scrolling container works and the problem is specific to touch input handling.

---

# 26. Safe shutdown and reboot

## Reboot

```bash
sudo reboot
```

## Shut down safely

```bash
sudo shutdown -h now
```

Alternative:

```bash
sudo poweroff
```

## Shut down after a delay

```bash
sudo shutdown -h +5
```

Cancel a scheduled shutdown:

```bash
sudo shutdown -c
```

Always shut down the Pi safely before removing power.

---

# 27. Logs and troubleshooting

## View the system journal

```bash
journalctl
```

## Show messages from the current boot

```bash
journalctl -b
```

## Show recent errors

```bash
journalctl -p err -b
```

## Show the latest kernel messages

```bash
dmesg | tail -n 50
```

## Follow kernel messages

```bash
sudo dmesg -w
```

## Check failed services

```bash
systemctl --failed
```

## Check backend status

```bash
systemctl status personal-pi-backend.service --no-pager
```

## Check frontend status

```bash
systemctl status personal-pi-frontend.service --no-pager
```

## Backend logs

```bash
journalctl -u personal-pi-backend.service -n 50 --no-pager
```

## Frontend logs

```bash
journalctl -u personal-pi-frontend.service -n 50 --no-pager
```

## Check whether the dashboard ports are occupied

```bash
sudo ss -ltnp | grep -E ':(5173|8000)'
```

---

# 28. Recommended project workflow

## Begin a development session

Stop automatic services and Chromium:

```bash
sudo systemctl stop personal-pi-backend.service
sudo systemctl stop personal-pi-frontend.service
pkill chromium
```

Start backend development mode:

```bash
cd ~/Personal_PI_Dashboard/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Start frontend development mode in another terminal:

```bash
cd ~/Personal_PI_Dashboard/frontend
npm run dev
```

## Finish a development session

Stop both development servers:

```text
Ctrl + C
```

Build the frontend:

```bash
cd ~/Personal_PI_Dashboard/frontend
npm run build
```

Restart automatic services:

```bash
sudo systemctl restart personal-pi-backend.service
sudo systemctl restart personal-pi-frontend.service
```

Restart Chromium:

```bash
pkill chromium
~/Personal_PI_Dashboard/scripts/start-kiosk.sh &
```

Commit changes:

```bash
cd ~/Personal_PI_Dashboard
git status
git add .
git commit -m "Describe the changes"
git push
```

---

# 29. Security checklist before pushing to GitHub

Check for secrets:

```bash
git diff --cached
```

Search common secret keywords:

```bash
grep -RniE "password|secret|token|api[_-]?key|private[_-]?key" .
```

Exclude generated and dependency folders when necessary:

```bash
grep -RniE \
  --exclude-dir=node_modules \
  --exclude-dir=venv \
  --exclude-dir=.venv \
  --exclude-dir=.git \
  "password|secret|token|api[_-]?key|private[_-]?key" .
```

Files that normally must not be committed:

```text
.env
.env.local
private SSH keys
API keys
access tokens
password databases
browser user-data folders
authentication cookies
personal certificates
database backups containing private data
```

Provide a safe example environment file instead:

```text
.env.example
```

Example:

```dotenv
API_URL=http://127.0.0.1:8000
EXAMPLE_API_KEY=replace_me
```

---

# 30. Quick command summary

## Start development backend

```bash
cd ~/Personal_PI_Dashboard/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Start development frontend

```bash
cd ~/Personal_PI_Dashboard/frontend
npm run dev
```

## Build frontend

```bash
cd ~/Personal_PI_Dashboard/frontend
npm run build
```

## Restart automatic frontend

```bash
sudo systemctl restart personal-pi-frontend.service
```

## Restart automatic backend

```bash
sudo systemctl restart personal-pi-backend.service
```

## Restart kiosk

```bash
pkill chromium
~/Personal_PI_Dashboard/scripts/start-kiosk.sh &
```

## Check API

```bash
curl -s http://127.0.0.1:8000/api/system | python3 -m json.tool
```

## Check ports

```bash
sudo ss -ltnp | grep -E ':(5173|8000)'
```

## Check temperature

```bash
vcgencmd measure_temp
```

## Check throttling

```bash
vcgencmd get_throttled
```

## Safe shutdown

```bash
sudo shutdown -h now
```
