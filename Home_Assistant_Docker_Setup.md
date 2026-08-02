# Home Assistant Container Setup

This document explains how Home Assistant is installed with Docker beside the **Personal Raspberry Pi Dashboard**.

It is written for the current development system:

```text
Device: Raspberry Pi 4
Operating system: Debian 13 (Trixie), ARM64 / aarch64
Dashboard frontend: React + Vite, port 5173
Dashboard backend: FastAPI, port 8000
Home Assistant: Docker container, port 8123
```

---

## 1. Architecture

The Raspberry Pi runs the normal desktop operating system. Docker runs Home Assistant as an isolated container beside the dashboard.

```text
Raspberry Pi OS / Debian
│
├── Personal Pi Dashboard
│   ├── React frontend       http://<PI-IP>:5173
│   └── FastAPI backend      http://<PI-IP>:8000
│
└── Docker Engine
    └── Home Assistant       http://<PI-IP>:8123
```

Home Assistant will later act as the central connection to devices and services:

```text
Personal Pi Dashboard
        ↓
FastAPI backend
        ↓
Home Assistant REST API
        ↓
WLED, lights, sensors, printer data, etc.
```

The React frontend must **not** receive the Home Assistant access token. Only the FastAPI backend should communicate directly with the Home Assistant API.

---

## 2. Why Home Assistant Container is used

Home Assistant Container is appropriate because the Raspberry Pi already runs:

- Raspberry Pi OS / Debian Desktop
- the React dashboard
- the FastAPI backend
- development tools such as VS Code

Installing Home Assistant OS would replace the current operating system. A Docker container allows all existing software to continue running.

### Limitation

Home Assistant Container does not include the Supervisor or the Home Assistant app/add-on system. Additional services such as MQTT must be installed and maintained separately, usually as their own Docker containers.

---

## 3. Recommended directory layout

Keep Home Assistant runtime data separate from the Git repository:

```text
/home/admin/
├── Personal_PI_Dashboard/       # Git repository
│   ├── backend/
│   ├── frontend/
│   └── docs/
│       └── HOME_ASSISTANT_DOCKER_SETUP.md
│
└── homeassistant/               # Private runtime directory
    ├── compose.yaml
    └── config/
```

Why keep it separate?

- `config/` may contain credentials, tokens, device information, location data, databases, and user authentication data.
- It changes constantly while Home Assistant runs.
- It should not be committed to GitHub.
- Separating it reduces the chance of accidentally publishing private data.

---

## 4. Verify the system

Run:

```bash
uname -m
grep -E '^(PRETTY_NAME|VERSION_CODENAME)=' /etc/os-release
```

Expected for this Raspberry Pi:

```text
aarch64
PRETTY_NAME="Debian GNU/Linux 13 (trixie)"
VERSION_CODENAME=trixie
```

Check Docker:

```bash
docker --version
docker compose version
docker run hello-world
```

The commands should work without `sudo` on the current setup.

---

## 5. Docker installation reference

Docker is already installed on this Raspberry Pi. These commands document the installation so it can be reproduced later.

### 5.1 Install required packages

```bash
sudo apt update
sudo apt install -y ca-certificates curl
```

### 5.2 Add Docker's official signing key

```bash
sudo install -m 0755 -d /etc/apt/keyrings

sudo curl -fsSL https://download.docker.com/linux/debian/gpg \
  -o /etc/apt/keyrings/docker.asc

sudo chmod a+r /etc/apt/keyrings/docker.asc
```

### 5.3 Add Docker's official Debian repository

```bash
sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
```

Then refresh the package list:

```bash
sudo apt update
```

### 5.4 Install Docker Engine and Compose

```bash
sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin
```

### 5.5 Verify Docker

```bash
sudo systemctl status docker --no-pager
sudo docker run hello-world
```

---

## 6. Running Docker without `sudo`

The current `admin` user was added to the `docker` group:

```bash
sudo usermod -aG docker "$USER"
```

After logging out and back in, or rebooting, verify:

```bash
docker run hello-world
```

### Security warning: the `docker` group

Membership in the `docker` group effectively grants **root-level control of the Raspberry Pi**. A user who can control Docker can mount host directories, modify files, and start privileged containers.

Therefore:

- only trusted administrator accounts should belong to the `docker` group;
- do not add normal or guest accounts;
- do not expose the Docker socket to other containers;
- do not make the Docker daemon remotely accessible over an unprotected TCP port.

Check group members:

```bash
getent group docker
```

Remove a user when access is no longer required:

```bash
sudo gpasswd -d <USERNAME> docker
```

> [!WARNING]
> Never expose the Docker daemon on TCP port `2375` without strong authentication and TLS. Remote Docker access can give an attacker control of the entire host.

---

## 7. Docker autostart

On Debian, Docker normally starts automatically at boot. Verify it:

```bash
systemctl is-enabled docker
systemctl is-active docker
```

Expected:

```text
enabled
active
```

If necessary:

```bash
sudo systemctl enable --now docker.service
sudo systemctl enable --now containerd.service
```

Home Assistant also needs its own restart policy. The Compose file uses:

```yaml
restart: unless-stopped
```

This means:

- Home Assistant restarts after a Raspberry Pi reboot.
- Home Assistant restarts if the container crashes.
- It stays stopped if it was deliberately stopped by the administrator.

---

## 8. Create the Home Assistant directory

```bash
mkdir -p ~/homeassistant/config
cd ~/homeassistant
```

Set private permissions on the directory:

```bash
chmod 700 ~/homeassistant
chmod 700 ~/homeassistant/config
```

Home Assistant may later adjust ownership or permissions for files it creates. Do not use `chmod 777` as a quick fix.

---

## 9. Create `compose.yaml`

Create the file:

```bash
nano ~/homeassistant/compose.yaml
```

Use:

```yaml
services:
  homeassistant:
    container_name: homeassistant
    image: ghcr.io/home-assistant/home-assistant:stable

    volumes:
      - ./config:/config
      - /etc/localtime:/etc/localtime:ro
      - /run/dbus:/run/dbus:ro

    environment:
      TZ: Europe/Vienna

    restart: unless-stopped
    privileged: true
    network_mode: host

    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

Validate the file before starting anything:

```bash
cd ~/homeassistant
docker compose config
```

If no error is shown, start Home Assistant:

```bash
docker compose up -d
```

Check its status:

```bash
docker compose ps
```

View startup logs:

```bash
docker compose logs -f homeassistant
```

Press `Ctrl+C` to leave the log view. This does not stop the container.

---

## 10. Explanation of the Compose file

### Official Home Assistant image

```yaml
image: ghcr.io/home-assistant/home-assistant:stable
```

This uses the stable official Home Assistant container image.

### Persistent configuration

```yaml
- ./config:/config
```

The container's `/config` directory is stored in:

```text
~/homeassistant/config
```

Container updates and replacements therefore do not delete the Home Assistant configuration.

### Local time

```yaml
- /etc/localtime:/etc/localtime:ro
```

The `:ro` suffix means read-only.

```yaml
TZ: Europe/Vienna
```

This sets the correct timezone for Austria.

### D-Bus access

```yaml
- /run/dbus:/run/dbus:ro
```

D-Bus access is useful for integrations such as Bluetooth. It gives the container additional visibility into host services.

If Bluetooth is definitely not needed, this mount can later be removed and the setup retested.

### Host networking

```yaml
network_mode: host
```

Home Assistant directly uses the Raspberry Pi's network. This improves local-device discovery but also means Home Assistant listens directly on the host network, normally on port `8123`.

No `ports:` section is needed when host networking is used.

### Privileged mode

```yaml
privileged: true
```

The official Home Assistant Container example uses privileged mode for broad hardware and system compatibility.

However, privileged mode gives the container extensive access to the host. A security problem inside a privileged container can have a larger impact than inside a restricted container.

For the first setup, follow the official configuration. After the required integrations are known, optional hardening can be tested by removing `privileged: true` and mapping only the specific devices that are needed.

Do not remove it and assume everything will continue to work; Bluetooth, USB, Zigbee, or other hardware integrations may require additional permissions or explicit device mappings.

### Log rotation

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

This limits Docker's container logs. Without rotation, logs can grow over time and fill the Raspberry Pi's SD card or storage device.

---

## 11. Open Home Assistant

Find the Raspberry Pi's local IP address:

```bash
hostname -I
```

Open Home Assistant from another device on the same local network:

```text
http://<RASPBERRY-PI-IP>:8123
```

Example only:

```text
http://192.168.1.50:8123
```

`raspberrypi.local` may also work:

```text
http://raspberrypi.local:8123
```

Complete the onboarding process and create the first owner account.

---

## 12. Home Assistant account security

Use:

- a strong, unique password;
- a password manager;
- multi-factor authentication;
- separate user accounts for different people;
- administrator rights only where they are necessary.

Home Assistant controls devices in the home, so an account compromise can have physical consequences.

### Do not expose port 8123 directly to the internet

For the first setup, Home Assistant should only be reachable inside the local network.

Do not create a router port-forwarding rule for port `8123`.

Safer remote-access options include:

- Home Assistant Cloud;
- a properly configured VPN;
- a correctly configured reverse proxy with HTTPS/TLS.

Plain HTTP is acceptable only on a trusted local network during development. It does not encrypt traffic.

---

## 13. Optional firewall restriction

Do not enable or change a firewall blindly, especially while connected remotely over SSH.

First ensure SSH remains allowed:

```bash
sudo ufw allow OpenSSH
```

Then allow Home Assistant only from the actual local subnet. Replace the example subnet with the real network:

```bash
sudo ufw allow from 192.168.1.0/24 to any port 8123 proto tcp
```

Only then consider enabling UFW:

```bash
sudo ufw enable
```

Check the result:

```bash
sudo ufw status verbose
```

> [!WARNING]
> A wrong firewall rule can lock you out of the Raspberry Pi. Skip this section until the actual network range is known.

---

## 14. Useful Home Assistant commands

Run these commands from:

```bash
cd ~/homeassistant
```

### Status

```bash
docker compose ps
```

### Logs

```bash
docker compose logs --tail=100 homeassistant
```

### Live logs

```bash
docker compose logs -f homeassistant
```

### Restart

```bash
docker compose restart homeassistant
```

### Stop

```bash
docker compose stop homeassistant
```

### Start

```bash
docker compose start homeassistant
```

### Stop and remove the container

```bash
docker compose down
```

The bind-mounted `config/` directory remains on disk, but always keep backups.

### Start or recreate the container

```bash
docker compose up -d
```

---

## 15. Updating Home Assistant safely

Before updating:

1. create a backup;
2. read the Home Assistant release notes;
3. check for backward-incompatible changes;
4. make sure enough disk space is available.

Update:

```bash
cd ~/homeassistant

docker compose pull
docker compose up -d
```

Check the result:

```bash
docker compose ps
docker compose logs --tail=100 homeassistant
```

Remove unused images only after confirming the new version works:

```bash
docker image prune
```

Do not use aggressive cleanup commands such as the following without understanding exactly what they remove:

```bash
docker system prune -a
docker volume prune
```

---

## 16. Backups

The `config/` directory contains the important persistent data.

A simple offline file backup can be created by briefly stopping Home Assistant:

```bash
mkdir -p ~/backups

cd ~/homeassistant
docker compose stop homeassistant

tar -czf ~/backups/homeassistant-config-$(date +%F).tar.gz config

docker compose start homeassistant
```

Restrict backup permissions:

```bash
chmod 600 ~/backups/homeassistant-config-*.tar.gz
```

Keep at least one backup on a different device. A backup stored only on the same SD card does not help if the card fails.

### Backup confidentiality

Backups can contain:

- account information;
- access tokens;
- Wi-Fi or integration credentials;
- device names;
- location and presence history;
- automation details;
- database contents.

Never commit Home Assistant backups to Git or upload them to a public file-sharing service.

---

## 17. Connecting FastAPI to Home Assistant later

The first dashboard goal should remain small:

```text
FastAPI calls Home Assistant
        ↓
detect online/offline
        ↓
React displays the result on the Home Assistant tile
```

Home Assistant's REST API is available at:

```text
http://127.0.0.1:8123/api/
```

Because FastAPI runs directly on the same Raspberry Pi, `127.0.0.1` is appropriate.

API requests use an authorization header:

```text
Authorization: Bearer <TOKEN>
```

### Create a long-lived access token

In Home Assistant:

```text
User profile
→ Security
→ Long-lived access tokens
→ Create token
```

Prefer a dedicated non-administrator Home Assistant user for the dashboard when the required API calls work with that account.

### Never place the token in React

Do not put the token in:

- React source files;
- Vite environment variables that are exposed to the browser;
- `applications.js`;
- frontend requests;
- Git commits;
- screenshots;
- README examples;
- console logs.

Anything sent to a browser can be inspected by the user of that browser.

The safe communication path is:

```text
React
  ↓ no HA token
FastAPI
  ↓ token stored server-side
Home Assistant
```

---

## 18. Store backend secrets safely

Create a private backend environment file:

```text
backend/.env
```

Example local contents:

```dotenv
HOME_ASSISTANT_URL=http://127.0.0.1:8123
HOME_ASSISTANT_TOKEN=replace_with_real_token
```

Restrict its permissions:

```bash
chmod 600 ~/Personal_PI_Dashboard/backend/.env
```

Create a safe template for Git:

```text
backend/.env.example
```

Template contents:

```dotenv
HOME_ASSISTANT_URL=http://127.0.0.1:8123
HOME_ASSISTANT_TOKEN=replace_with_your_token
```

The template contains placeholders only.

> [!IMPORTANT]
> Environment files and `secrets.yaml` store secrets as plaintext. They reduce accidental exposure through Git, but they do not encrypt the values on disk.

If a token is ever committed or shown publicly:

1. treat it as compromised immediately;
2. revoke/delete it in Home Assistant;
3. create a new token;
4. remove it from Git history if it was committed;
5. check logs and account activity where possible.

Deleting the token only from the newest commit is not enough because older Git commits still contain it.

---

## 19. Recommended `.gitignore`

Add or verify these entries in the dashboard repository's `.gitignore`:

```gitignore
# Python virtual environments
backend/venv/
backend/.venv/
venv/
.venv/

# Python generated files
__pycache__/
*.py[cod]

# Frontend dependencies and build output
frontend/node_modules/
frontend/dist/
node_modules/
dist/

# Environment files and secrets
.env
.env.*
!.env.example
backend/.env
*.token
*.pem
*.key

# Home Assistant private runtime data
homeassistant/config/
**/.storage/
**/secrets.yaml
**/home-assistant_v2.db*
**/*.log*
**/*.log.*

# Home Assistant backups
*.tar
*.tar.gz
*.backup
```

Before every push, check:

```bash
git status
git diff --cached
```

Search staged files for accidental tokens or passwords:

```bash
git grep --cached -n -I \
  -e 'HOME_ASSISTANT_TOKEN' \
  -e 'Authorization: Bearer' \
  -e 'password'
```

A match is not automatically a secret because templates may contain placeholders, but every match should be reviewed.

---

## 20. Files that may be committed

Safe examples:

```text
docs/HOME_ASSISTANT_DOCKER_SETUP.md
backend/.env.example
compose.yaml.example
.gitignore
```

Do not commit:

```text
backend/.env
~/homeassistant/config/
~/homeassistant/config/.storage/
~/homeassistant/config/secrets.yaml
Home Assistant database files
Home Assistant backup archives
real access tokens
real passwords
private keys
```

A `compose.yaml.example` file can be committed when it contains only generic paths and no private values.

---

## 21. Additional Docker security rules

- Install images only from trusted registries and publishers.
- Prefer official images.
- Do not blindly run shell scripts copied from unknown websites.
- Do not mount `/var/run/docker.sock` into Home Assistant or unrelated containers.
- Do not use `privileged: true` for new containers unless it is genuinely required.
- Do not use `chmod 777` to solve permission problems.
- Keep Debian, Docker, and Home Assistant updated.
- Back up before updates.
- Review newly added Compose mounts carefully because a mount gives the container access to that host path.
- Never mount the whole host filesystem, such as `/:/host`.
- Check disk usage periodically:

```bash
df -h
docker system df
```

---

## 22. Current next step

After Home Assistant starts successfully and onboarding is complete, the dashboard integration should be developed in this order:

```text
1. Create a dedicated Home Assistant API token.
2. Store the token in backend/.env.
3. Add a small FastAPI Home Assistant status endpoint.
4. Test the FastAPI endpoint directly.
5. Fetch that endpoint from React.
6. Display ONLINE, OFFLINE, LOADING, and ERROR states.
7. Read one harmless Home Assistant entity.
8. Only then add WLED controls.
```

Do not begin with full device control. First prove that one authenticated request works safely.

---

## 23. Official references

- [Install Docker Engine on Debian](https://docs.docker.com/engine/install/debian/)
- [Docker Linux post-installation steps](https://docs.docker.com/engine/install/linux-postinstall/)
- [Docker daemon remote-access security](https://docs.docker.com/engine/daemon/remote-access/)
- [Install Home Assistant Container on Linux](https://www.home-assistant.io/installation/linux/)
- [Home Assistant authentication](https://www.home-assistant.io/docs/authentication/)
- [Home Assistant REST API](https://developers.home-assistant.io/docs/api/rest/)
- [Securing Home Assistant](https://www.home-assistant.io/docs/configuration/securing/)
- [Remote access to Home Assistant](https://www.home-assistant.io/docs/configuration/remote/)
- [GitHub: Storing secrets safely](https://docs.github.com/en/get-started/learning-to-code/storing-your-secrets-safely)

---

_Last reviewed: 2026-08-02. Installation commands and security recommendations can change, so compare this document with the current official documentation before setting up a new system._
