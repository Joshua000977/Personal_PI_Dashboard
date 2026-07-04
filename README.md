# Raspberry Pi Personal Dashboard

A modular self-hosted dashboard designed to run on a Raspberry Pi connected to a dedicated touchscreen.

The project combines personal information, system monitoring, finance data, media controls, smart-home integration, project tracking, and device status into one central interface.

The dashboard uses:

- **React** for the frontend
- **Python with FastAPI** for the backend
- **PostgreSQL** for persistent data
- **Docker Compose** for deployment
- **Mosquitto MQTT** for future device communication
- **Raspberry Pi** as the main host
- **7-inch touchscreen** as the primary interface

The long-term goal is to build a personal command center that can be expanded progressively without redesigning the complete system.

---

# Project Status

```text
Planning / Initial Development
```

The project will be built progressively.

The first version will focus on:

- Raspberry Pi setup
- Docker environment
- React frontend
- Python FastAPI backend
- basic dashboard navigation
- weather information
- Raspberry Pi system monitoring
- fullscreen touchscreen interface

Additional modules will be added later.

---

# Main Goals

The main goals of the project are:

- create one central personal dashboard
- build a useful everyday system
- use a modern frontend and backend architecture
- keep all modules independent and expandable
- provide live information
- integrate external APIs
- integrate local services
- support smart-home devices
- support future MQTT devices
- provide a clean touchscreen interface
- run primarily on the local network
- automatically start after Raspberry Pi boot
- serve as a long-term portfolio project

---

# Planned Hardware

## Main System

| Component | Purpose |
|---|---|
| Raspberry Pi 4 | Main application host |
| 7-inch HDMI touchscreen | Primary user interface |
| Gigabit Ethernet connection | Stable network connection |
| Gigabit Ethernet switch | Connect PC and Raspberry Pi |
| microSD card or SSD | Operating system and application storage |
| Raspberry Pi power supply | Main power source |

The Raspberry Pi will preferably use Ethernet instead of Wi-Fi.

Example network setup:

```text
                    Router
                      |
                      |
                Ethernet Cable
                      |
                      v
              +---------------+
              | Gigabit Switch|
              +---+--------+--+
                  |        |
                  |        |
                  v        v
                 PC   Raspberry Pi
```

This provides:

- stable local communication
- low latency
- reliable Docker downloads
- reliable API communication
- stable MQTT communication
- no dependency on weak room Wi-Fi

---

# Planned Software Stack

```text
Frontend:
React

Frontend Language:
JavaScript or TypeScript

Backend:
Python

Backend Framework:
FastAPI

Database:
PostgreSQL

Containerization:
Docker
Docker Compose

MQTT Broker:
Mosquitto

Operating System:
Raspberry Pi OS or another suitable Linux distribution

Reverse Proxy:
Optional Nginx

Remote Access:
Optional Tailscale

Smart Home:
Home Assistant
```

---

# Why React for the Frontend

React is used for the visible dashboard interface.

The frontend should feel more like a dedicated application than a traditional data dashboard.

React provides:

- reusable components
- highly customizable layouts
- responsive interfaces
- touchscreen-friendly controls
- animated page transitions
- dynamic widgets
- live state updates
- clean separation between frontend and backend
- easy integration with REST APIs and WebSockets

Example component structure:

```text
Dashboard
|
+-- Navigation
|
+-- HomePage
|   |
|   +-- WeatherCard
|   +-- PortfolioCard
|   +-- PiStatusCard
|   +-- PrinterCard
|   +-- SpotifyCard
|
+-- FinancePage
|
+-- SystemPage
|
+-- PrinterPage
|
+-- SpotifyPage
|
+-- HomeAssistantPage
|
+-- ProjectsPage
|
+-- SettingsPage
```

Example React components:

```text
<WeatherCard />
<PortfolioCard />
<SystemStatusCard />
<PrinterStatusCard />
<SpotifyCard />
<ProjectCard />
```

Each module can be developed independently.

---

# Why Python and FastAPI for the Backend

Python is used for backend logic and integrations.

FastAPI provides the communication layer between the React frontend and the rest of the system.

The backend will be responsible for:

- REST API endpoints
- WebSocket connections
- external API requests
- Raspberry Pi system information
- PostgreSQL access
- MQTT communication
- Home Assistant integration
- printer integration
- Spotify integration
- finance data processing
- dashboard settings
- background services
- data aggregation

Example:

```text
React Frontend
      |
      |
      | HTTP / WebSocket
      |
      v
FastAPI Backend
      |
      +--------------------+
      |                    |
      v                    v
PostgreSQL              MQTT
      |
      +--------------------+
      |
      v
External APIs
```

---

# Overall Architecture

```text
                        External APIs
                             |
          +------------------+------------------+
          |                  |                  |
          v                  v                  v
   +-------------+    +-------------+    +-------------+
   | Finance API |    | Weather API |    | Spotify API |
   +------+------+    +------+------+    +------+------+
          |                  |                  |
          +------------------+------------------+
                             |
                             v
                    +-------------------+
                    | Python Backend    |
                    | FastAPI           |
                    +---------+---------+
                              |
              +---------------+---------------+
              |               |               |
              v               v               v
      +---------------+ +-------------+ +-------------+
      | PostgreSQL    | | Mosquitto   | | Local APIs  |
      | Database      | | MQTT Broker | | / Services  |
      +---------------+ +------+------+ +-------------+
                              |
                              |
                +-------------+-------------+
                |                           |
                v                           v
        +---------------+           +---------------+
        | Home Assistant|           | Future MQTT   |
        | Integration   |           | Devices       |
        +---------------+           +---------------+

                              |
                              v
                    +-------------------+
                    | React Frontend    |
                    +---------+---------+
                              |
                              v
                    +-------------------+
                    | 7" Touchscreen    |
                    +-------------------+
```

---

# Docker Architecture

The project should run primarily through Docker Compose.

Possible services:

```text
Raspberry Pi
|
+-- frontend
|   |
|   +-- React
|
+-- backend
|   |
|   +-- FastAPI
|
+-- database
|   |
|   +-- PostgreSQL
|
+-- mqtt
|   |
|   +-- Mosquitto
|
+-- homeassistant
|   |
|   +-- Home Assistant
|
+-- reverse-proxy
    |
    +-- Optional Nginx
```

Example:

```text
+------------------------------------------------+
| Raspberry Pi                                   |
|                                                |
|  +------------------------------------------+  |
|  | React Frontend                           |  |
|  +------------------------------------------+  |
|                                                |
|  +------------------------------------------+  |
|  | FastAPI Backend                          |  |
|  +------------------------------------------+  |
|                                                |
|  +------------------------------------------+  |
|  | PostgreSQL                               |  |
|  +------------------------------------------+  |
|                                                |
|  +------------------------------------------+  |
|  | Mosquitto MQTT Broker                    |  |
|  +------------------------------------------+  |
|                                                |
|  +------------------------------------------+  |
|  | Home Assistant                           |  |
|  +------------------------------------------+  |
|                                                |
+------------------------------------------------+
```

Benefits:

- isolated services
- easier deployment
- easier backups
- easier updates
- reproducible development environment
- simpler migration to another device
- easier testing on a PC before deployment

---

# Communication Between Frontend and Backend

The React frontend should not directly communicate with every service.

Instead:

```text
React
  |
  v
FastAPI
  |
  +-- PostgreSQL
  |
  +-- MQTT
  |
  +-- Weather API
  |
  +-- Finance APIs
  |
  +-- Spotify API
  |
  +-- Home Assistant
  |
  +-- Printer Integration
  |
  +-- Raspberry Pi System
```

This keeps the frontend independent from individual integrations.

---

# REST API

FastAPI will provide REST endpoints.

Possible endpoints:

```text
GET /api/health

GET /api/dashboard
GET /api/dashboard/widgets

GET /api/system/status
GET /api/system/cpu
GET /api/system/memory
GET /api/system/storage

GET /api/weather/current
GET /api/weather/forecast

GET /api/portfolio
GET /api/portfolio/assets
GET /api/portfolio/history

GET /api/printer/status

GET /api/spotify/current
GET /api/spotify/devices

GET /api/home/entities

GET /api/projects
GET /api/projects/{id}

GET /api/settings
```

Possible actions:

```text
POST /api/settings

POST /api/spotify/play
POST /api/spotify/pause
POST /api/spotify/next
POST /api/spotify/previous

POST /api/printer/pause
POST /api/printer/resume

POST /api/home/action

POST /api/system/service/restart
```

---

# WebSocket Support

WebSockets can be used for live updates.

Example:

```text
Raspberry Pi CPU changes
        |
        v
FastAPI Backend
        |
        v
WebSocket
        |
        v
React Frontend
        |
        v
System widget updates instantly
```

Possible live data:

- CPU usage
- CPU temperature
- memory usage
- printer progress
- Spotify track changes
- MQTT device status
- Home Assistant state changes
- dashboard notifications

Example endpoint:

```text
/ws/dashboard
```

Possible message:

```json
{
  "type": "system_update",
  "data": {
    "cpu_usage": 18.4,
    "cpu_temperature": 44.2,
    "memory_usage": 38.1
  }
}
```

---

# PostgreSQL Database

PostgreSQL is planned for persistent storage.

Possible tables:

```text
users
dashboard_settings
dashboard_widgets

portfolio_assets
portfolio_transactions
portfolio_history

projects
project_milestones

devices
device_status

integrations

mqtt_devices

application_settings
```

Example:

```text
+------------------------+
| portfolio_assets       |
+------------------------+
| id                     |
| symbol                 |
| name                   |
| asset_type             |
| quantity               |
| average_buy_price      |
| currency               |
+------------------------+
```

---

# Planned Dashboard Pages

## 1. Home Page

The home page should show the most important information at a glance.

Possible widgets:

- current time
- current date
- weather
- portfolio summary
- Raspberry Pi status
- printer status
- current Spotify playback
- Home Assistant information
- project progress

Example:

```text
+--------------------------------------------------+
| 18:42                       Saturday, 4 July      |
+--------------------------------------------------+
| Weather          | Portfolio                     |
| 24 C             | +2.4%                         |
| Sunny            | EUR 5,xxx                     |
+------------------+-------------------------------+
| Printer          | Spotify                       |
| Printing         | Current Track                 |
| 67%              | Artist                        |
+------------------+-------------------------------+
| Projects         | Pi Status                     |
| 3 Active         | CPU 42 C                      |
| 1 Planned        | RAM 38%                       |
+------------------+-------------------------------+
```

---

# 2. Finance and Portfolio Page

The finance page should provide an overview of personal investments and selected assets.

Planned features:

- total portfolio value
- daily performance
- total performance
- individual positions
- selected stocks
- ETFs
- cryptocurrencies
- gold
- cash
- allocation charts
- historical performance
- custom watchlist
- gain and loss values
- percentage changes

Example:

```text
+------------------------------------------------+
| Portfolio                                      |
+------------------------------------------------+
| Total Value              EUR 5,xxx             |
| Daily Change             +1.42%                |
| Total Performance        +xx.xx%               |
+------------------------------------------------+
| Asset        Price       Change       Position |
| Asset A      ...         +...%         ...     |
| Asset B      ...         -...%         ...     |
| Asset C      ...         +...%         ...     |
+------------------------------------------------+
```

Possible charts:

```text
Portfolio Value Over Time

Allocation by Asset

Allocation by Sector

Daily Performance

Monthly Investment Amount
```

Future possibilities:

- transaction history
- average buy-in
- realized profit
- unrealized profit
- dividends
- target allocation
- rebalancing information
- investment goals

---

# 3. Raspberry Pi System Page

This page should monitor the Raspberry Pi.

Planned information:

- CPU usage
- CPU temperature
- RAM usage
- disk usage
- uptime
- network status
- Ethernet status
- IP address
- load average
- Docker status
- container status
- service status

Example:

```text
+--------------------------------+
| Raspberry Pi Status            |
+--------------------------------+
| CPU Usage          18%         |
| CPU Temperature    44 C        |
| RAM Usage          38%         |
| Disk Usage         27%         |
| Uptime             6d 4h       |
| Ethernet           Connected   |
+--------------------------------+
```

Possible future controls:

- restart service
- restart Docker container
- reboot Raspberry Pi
- shut down Raspberry Pi
- view service logs
- view container logs

---

# 4. Weather Page

The weather page should provide:

- current temperature
- current conditions
- hourly forecast
- daily forecast
- rain probability
- wind speed
- wind direction
- sunrise
- sunset

Example:

```text
+------------------------------------+
| Weather                            |
+------------------------------------+
| Current       24 C                 |
| Condition     Sunny                |
| Wind          12 km/h              |
| Rain          10%                  |
+------------------------------------+
| Tomorrow      26 / 15 C            |
| Monday        23 / 14 C            |
| Tuesday       21 / 13 C            |
+------------------------------------+
```

Possible future features:

- precipitation radar
- severe weather warnings
- air quality
- weather history

---

# 5. Bambu Lab P1S Page

The dashboard should integrate with the Bambu Lab P1S.

Planned information:

- printer online/offline
- current state
- current print job
- print progress
- remaining time
- current layer
- total layers
- nozzle temperature
- bed temperature
- error state

Example:

```text
+--------------------------------+
| Bambu Lab P1S                  |
+--------------------------------+
| Status       Printing          |
| File         enclosure.3mf     |
| Progress     67%               |
| Remaining    1h 24m            |
| Layer        342 / 510         |
| Nozzle       220 C             |
| Bed          55 C              |
+--------------------------------+
```

Possible future controls:

- pause print
- resume print
- stop print
- chamber light control
- printer camera view

---

# 6. Spotify Page

The Spotify page should provide playback information and controls.

Planned features:

- current song
- artist
- album
- album artwork
- playback progress
- play
- pause
- next track
- previous track
- volume control
- shuffle
- repeat
- playlist shortcuts

Example:

```text
+--------------------------------------+
| Spotify                              |
+--------------------------------------+
|                                      |
|          Album Artwork               |
|                                      |
| Song Title                           |
| Artist                               |
| Album                                |
|                                      |
| Previous       Play       Next       |
|                                      |
| Volume: 65%                          |
+--------------------------------------+
```

---

# 7. Home Assistant Page

The dashboard should integrate with Home Assistant.

Possible information:

- lights
- switches
- room temperature
- humidity
- device availability
- smart plugs
- scenes
- sensor values

Example:

```text
+------------------------------------+
| Home Assistant                     |
+------------------------------------+
| Room Light          ON             |
| Desk Light          OFF            |
| Temperature         23.4 C         |
| Humidity            48%            |
| Smart Plug          ON             |
+------------------------------------+
```

Possible actions:

```text
Toggle room light

Turn all lights off

Activate scene

Control smart plug

Change brightness

Show sensor history
```

---

# 8. Projects Page

The projects page should provide an overview of personal development projects.

Possible information:

- project name
- current status
- progress
- milestones
- TODO items
- GitHub repository
- latest commit
- open issues

Example:

```text
+--------------------------------------+
| Projects                             |
+--------------------------------------+
| Project A                            |
| Status: Active                       |
| Progress: 75%                        |
|                                      |
| Project B                            |
| Status: Development                  |
| Progress: 30%                        |
|                                      |
| Project C                            |
| Status: Planning                     |
| Progress: 5%                         |
+--------------------------------------+
```

Possible states:

```text
Planning

Active

Development

Testing

Paused

Completed
```

---

# 9. Settings Page

The settings page should allow configuration without editing code.

Planned settings:

- selected stocks
- selected ETFs
- selected cryptocurrencies
- dashboard widgets
- widget visibility
- brightness
- theme
- default page
- refresh intervals
- MQTT settings
- Home Assistant settings
- Spotify settings
- weather location
- dashboard behavior

Example:

```text
+------------------------------------+
| Settings                           |
+------------------------------------+
| Theme          Dark               |
| Brightness     80%                |
| Default Page   Home               |
|                                    |
| Stocks         Edit               |
| ETFs           Edit               |
| Crypto         Edit               |
| MQTT           Connected          |
+------------------------------------+
```

---

# MQTT Integration

MQTT is planned as a communication layer for future devices and integrations.

Broker:

```text
Mosquitto
```

Hosted on:

```text
Raspberry Pi
```

Architecture:

```text
                    +----------------------+
                    | Mosquitto MQTT       |
                    | Raspberry Pi         |
                    +----------+-----------+
                               |
          +--------------------+--------------------+
          |                    |                    |
          v                    v                    v
 +----------------+   +----------------+   +----------------+
 | Future ESP32   |   | Home Assistant |   | Future Devices |
 | Devices        |   | Integration    |   |                |
 +----------------+   +----------------+   +----------------+
```

The FastAPI backend can subscribe to selected MQTT topics and forward relevant updates to React using WebSockets.

Example:

```text
MQTT Device
    |
    v
Mosquitto
    |
    v
FastAPI
    |
    v
WebSocket
    |
    v
React
```

---

# Example MQTT Topics

## Dashboard

```text
dashboard/status
dashboard/page/set
dashboard/page/current
dashboard/brightness/set
```

## Raspberry Pi

```text
pi/status/cpu
pi/status/temperature
pi/status/ram
pi/status/disk
pi/status/network
```

## Printer

```text
printer/p1s/status
printer/p1s/progress
printer/p1s/remaining
printer/p1s/error
```

## Future Devices

```text
devices/+/status
devices/+/state
devices/+/command
```

---

# Future Physical Control

The dashboard may later be controlled by a separate custom Stream-Deck-style device.

This device would be developed as an independent project.

Possible communication:

```text
Custom Control Device
        |
        v
      MQTT
        |
        v
    Mosquitto
        |
        v
 FastAPI Backend
        |
        v
 React Dashboard
```

Possible actions:

- switch dashboard pages
- control Spotify
- open finance page
- open printer page
- control Home Assistant
- change dashboard brightness
- trigger custom actions

The dashboard itself should therefore expose clean APIs and MQTT topics so external control devices can be added later.

---

# Local Network Design

The dashboard is primarily intended for local use.

Example:

```text
Router
   |
   |
Ethernet
   |
   v
Gigabit Switch
   |
   +--------------------+
   |                    |
   v                    v
  PC              Raspberry Pi
```

Benefits:

- stable communication
- low latency
- reliable backend access
- reliable MQTT
- fast local network
- less dependency on Wi-Fi

---

# Dashboard Access

The directly connected touchscreen can access the dashboard locally.

Possible address:

```text
http://localhost
```

Depending on the Docker and reverse proxy setup:

```text
http://localhost:3000
```

or:

```text
http://dashboard.local
```

Other devices on the local network may use:

```text
http://raspberrypi.local
```

or the Raspberry Pi IP address.

---

# Remote Access

Remote access is optional.

Possible solution:

```text
Tailscale
```

Possible uses:

- Raspberry Pi maintenance
- SSH
- Home Assistant access
- dashboard administration
- remote status viewing

The primary touchscreen dashboard can still remain local-first.

---

# Automatic Startup

The complete system should start automatically after boot.

Planned flow:

```text
Power On
   |
   v
Raspberry Pi Boots
   |
   v
Docker Starts
   |
   v
PostgreSQL Starts
   |
   v
Mosquitto Starts
   |
   v
FastAPI Starts
   |
   v
React Frontend Starts
   |
   v
Chromium Opens
   |
   v
Fullscreen Dashboard
```

Possible browser mode:

```text
Chromium Kiosk Mode
```

---

# Touchscreen Design

The interface should be optimized for a 7-inch display.

Design priorities:

- large touch targets
- readable text
- dark theme
- simple navigation
- clear status indicators
- high contrast
- responsive layout
- fast page switching
- minimal unnecessary text
- smooth animations

Possible navigation:

```text
+------------------------------------------------+
| Home | Finance | Printer | Spotify | More      |
+------------------------------------------------+
```

Alternative:

```text
Swipe Left  -> Next Page

Swipe Right -> Previous Page
```

Possible combination:

```text
Bottom Navigation
+
Swipe Gestures
+
Future External Controls
```

---

# Suggested Repository Structure

```text
pi-dashboard/
|
+-- README.md
|
+-- docker-compose.yml
|
+-- .env.example
|
+-- frontend/
|   |
|   +-- src/
|   |   |
|   |   +-- components/
|   |   |
|   |   +-- pages/
|   |   |
|   |   +-- hooks/
|   |   |
|   |   +-- services/
|   |   |
|   |   +-- context/
|   |   |
|   |   +-- assets/
|   |   |
|   |   +-- styles/
|   |   |
|   |   +-- App.jsx
|   |
|   +-- package.json
|   |
|   +-- Dockerfile
|
+-- backend/
|   |
|   +-- app/
|   |   |
|   |   +-- main.py
|   |   |
|   |   +-- api/
|   |   |
|   |   +-- models/
|   |   |
|   |   +-- schemas/
|   |   |
|   |   +-- services/
|   |   |
|   |   +-- mqtt/
|   |   |
|   |   +-- websocket/
|   |   |
|   |   +-- integrations/
|   |   |
|   |   +-- database/
|   |   |
|   |   +-- system/
|   |
|   +-- requirements.txt
|   |
|   +-- Dockerfile
|
+-- database/
|   |
|   +-- migrations/
|
+-- mosquitto/
|   |
|   +-- config/
|   |
|   +-- data/
|   |
|   +-- log/
|
+-- scripts/
|   |
|   +-- install.sh
|   |
|   +-- backup.sh
|   |
|   +-- restore.sh
|   |
|   +-- kiosk-start.sh
|
+-- docs/
    |
    +-- architecture.md
    |
    +-- api.md
    |
    +-- mqtt-topics.md
    |
    +-- database.md
    |
    +-- screenshots/
```

---

# Example Frontend Structure

```text
frontend/src/
|
+-- components/
|   |
|   +-- cards/
|   |   |
|   |   +-- WeatherCard.jsx
|   |   +-- PortfolioCard.jsx
|   |   +-- SystemCard.jsx
|   |   +-- PrinterCard.jsx
|   |   +-- SpotifyCard.jsx
|   |
|   +-- navigation/
|   |
|   +-- charts/
|   |
|   +-- common/
|
+-- pages/
|   |
|   +-- HomePage.jsx
|   +-- FinancePage.jsx
|   +-- SystemPage.jsx
|   +-- WeatherPage.jsx
|   +-- PrinterPage.jsx
|   +-- SpotifyPage.jsx
|   +-- HomeAssistantPage.jsx
|   +-- ProjectsPage.jsx
|   +-- SettingsPage.jsx
|
+-- services/
|   |
|   +-- api.js
|   +-- websocket.js
|
+-- hooks/
|
+-- context/
|
+-- assets/
|
+-- styles/
|
+-- App.jsx
```

---

# Example Backend Structure

```text
backend/app/
|
+-- main.py
|
+-- api/
|   |
|   +-- dashboard.py
|   +-- system.py
|   +-- weather.py
|   +-- portfolio.py
|   +-- printer.py
|   +-- spotify.py
|   +-- home.py
|   +-- projects.py
|   +-- settings.py
|
+-- services/
|   |
|   +-- system_service.py
|   +-- weather_service.py
|   +-- portfolio_service.py
|   +-- printer_service.py
|   +-- spotify_service.py
|
+-- integrations/
|   |
|   +-- weather/
|   +-- finance/
|   +-- spotify/
|   +-- homeassistant/
|   +-- bambu/
|
+-- mqtt/
|   |
|   +-- client.py
|   +-- handlers.py
|   +-- topics.py
|
+-- websocket/
|   |
|   +-- manager.py
|
+-- database/
|   |
|   +-- connection.py
|   +-- models.py
|   +-- repositories.py
|
+-- schemas/
|
+-- models/
|
+-- system/
```

---

# Environment Configuration

Sensitive configuration should not be stored directly in the repository.

Example:

```text
.env
```

Possible variables:

```env
POSTGRES_HOST=database
POSTGRES_PORT=5432
POSTGRES_DB=dashboard
POSTGRES_USER=dashboard_user
POSTGRES_PASSWORD=change_me

MQTT_HOST=mosquitto
MQTT_PORT=1883

WEATHER_API_KEY=

SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

HOME_ASSISTANT_URL=
HOME_ASSISTANT_TOKEN=
```

The repository should contain:

```text
.env.example
```

but not the real:

```text
.env
```

---

# Planned Development Roadmap

## Phase 1 - Base Infrastructure

Goal:

Create the basic project architecture.

Tasks:

- create Git repository
- create frontend folder
- create backend folder
- create React application
- create FastAPI application
- create Dockerfiles
- create Docker Compose setup
- establish frontend/backend communication

Result:

```text
React
  |
  v
FastAPI
```

working locally.

---

## Phase 2 - Basic Dashboard UI

Add:

- main layout
- navigation
- dark theme
- touchscreen-friendly buttons
- responsive card system
- placeholder widgets

Pages:

```text
Home

System

Weather

Settings
```

---

## Phase 3 - Raspberry Pi Monitoring

Add backend services for:

- CPU usage
- CPU temperature
- RAM usage
- disk usage
- uptime
- network status

Flow:

```text
Raspberry Pi
    |
    v
Python Service
    |
    v
FastAPI
    |
    v
React
```

---

## Phase 4 - Weather Integration

Add:

- current weather
- hourly forecast
- daily forecast
- rain probability
- wind information

---

## Phase 5 - PostgreSQL

Add:

- database container
- SQL models
- migrations
- settings storage
- widget configuration
- persistent user preferences

---

## Phase 6 - Finance Integration

Add:

- portfolio assets
- selected stocks
- ETFs
- crypto
- gold
- performance calculations
- charts
- portfolio history

---

## Phase 7 - WebSockets

Add real-time communication:

```text
FastAPI
   |
   v
WebSocket
   |
   v
React
```

Use for:

- system monitoring
- printer progress
- MQTT events
- live device states
- notifications

---

## Phase 8 - MQTT

Add:

- Mosquitto
- Python MQTT client
- topic handlers
- live device status
- future external controls

---

## Phase 9 - Home Assistant

Add:

- entity states
- sensors
- lights
- switches
- scenes
- actions

---

## Phase 10 - Bambu Lab P1S

Add:

- status
- current job
- progress
- remaining time
- temperatures
- errors

---

## Phase 11 - Spotify

Add:

- current track
- album art
- player state
- playback controls
- volume
- playlist shortcuts

---

## Phase 12 - Projects Page

Add:

- project list
- status
- progress
- milestones
- GitHub integration
- latest commits
- issue information

---

## Phase 13 - Advanced UI

Possible improvements:

- page transitions
- animations
- customizable widgets
- drag-and-drop layout
- theme selection
- configurable home screen
- status notifications
- fullscreen overlays

---

# Future Feature Ideas

Possible future additions:

- calendar
- upcoming appointments
- email summaries
- GitHub activity
- RSS feeds
- news
- network monitoring
- internet speed monitoring
- NAS status
- PC status
- Wake-on-LAN
- PC shutdown
- smart-home scenes
- energy monitoring
- custom widgets
- automatic brightness
- presence detection
- project deadlines
- travel information
- motorcycle trip planning
- system notifications
- service health monitoring

---

# Possible PC Integration

The dashboard may later communicate with a service running on a PC.

Possible features:

- PC online/offline status
- CPU usage
- GPU usage
- RAM usage
- current application
- Wake-on-LAN
- shutdown
- restart
- lock workstation

Architecture:

```text
Raspberry Pi Dashboard
        |
        v
Local Network
        |
        v
PC Agent
```

---

# Error Handling

The dashboard should remain usable even when an external service is unavailable.

Example:

```text
Spotify API unavailable
        |
        v
Spotify widget shows:
"Offline"
```

Instead of:

```text
Complete dashboard crashes
```

Each integration should fail independently.

Example architecture:

```text
Weather Service      -> Offline
Finance Service      -> Online
Spotify Service      -> Online
Printer Service      -> Offline
System Monitoring    -> Online
```

The rest of the dashboard should continue running.

---

# Logging

The backend should use structured logging.

Possible log categories:

```text
INFO

WARNING

ERROR

DEBUG
```

Example:

```text
2026-07-04 18:42:10 INFO  Backend started

2026-07-04 18:42:11 INFO  PostgreSQL connected

2026-07-04 18:42:12 INFO  MQTT connected

2026-07-04 18:42:15 WARNING Spotify unavailable

2026-07-04 18:42:18 INFO  WebSocket client connected
```

---

# Security

The project primarily runs on the local network.

Security considerations:

- do not commit API keys
- do not commit passwords
- use environment variables
- protect PostgreSQL credentials
- use MQTT authentication
- restrict sensitive API endpoints
- avoid exposing services directly to the public internet
- use Tailscale for remote access where possible

---

# Backup Strategy

Important persistent data should be backed up.

Possible backup targets:

- PostgreSQL database
- dashboard settings
- Mosquitto configuration
- Home Assistant configuration
- environment templates
- project configuration

Example:

```text
scripts/backup.sh
```

Could create:

```text
backups/
|
+-- database/
|
+-- config/
|
+-- mqtt/
```

---

# Portfolio Value

This project demonstrates experience with:

- Raspberry Pi
- Linux
- Docker
- Docker Compose
- React
- JavaScript or TypeScript
- Python
- FastAPI
- PostgreSQL
- MQTT
- REST APIs
- WebSockets
- frontend development
- backend development
- database design
- networking
- external API integration
- smart-home integration
- system monitoring
- touchscreen interfaces
- deployment
- service architecture
- real-world application development

The project is not intended to be only a demo.

It should become a real system used every day.

---

# Development Philosophy

The project should be built progressively.

Instead of implementing everything at once:

```text
Step 1
|
v
Basic React Interface
|
v
Step 2
|
v
FastAPI Backend
|
v
Step 3
|
v
Pi Monitoring
|
v
Step 4
|
v
Weather
|
v
Step 5
|
v
Database
|
v
Step 6
|
v
Finance
|
v
Step 7
|
v
MQTT
|
v
Step 8
|
v
Additional Integrations
```

Every phase should create a usable improvement.

---

# Current Recommended Architecture

```text
Frontend:
React

Backend:
Python + FastAPI

Database:
PostgreSQL

Live Updates:
WebSockets

Device Communication:
MQTT

MQTT Broker:
Mosquitto

Deployment:
Docker Compose

Host:
Raspberry Pi 4

Display:
7-inch HDMI touchscreen

Network:
Gigabit Ethernet

Smart Home:
Home Assistant

Remote Access:
Optional Tailscale
```

---

# Final Vision

```text
                       +----------------------+
                       |   7" Touchscreen     |
                       |----------------------|
                       | Home                 |
                       | Finance              |
                       | Weather              |
                       | System               |
                       | Printer              |
                       | Spotify              |
                       | Home Assistant       |
                       | Projects             |
                       +----------+-----------+
                                  |
                                  v
                       +----------------------+
                       | React Frontend       |
                       +----------+-----------+
                                  |
                         REST / WebSocket
                                  |
                                  v
                       +----------------------+
                       | Python FastAPI       |
                       | Backend              |
                       +----------+-----------+
                                  |
          +-----------------------+-----------------------+
          |                       |                       |
          v                       v                       v
+------------------+    +------------------+    +------------------+
| PostgreSQL       |    | Mosquitto MQTT  |    | External APIs    |
+------------------+    +------------------+    +------------------+
                                  |
                    +-------------+-------------+
                    |                           |
                    v                           v
          +------------------+        +------------------+
          | Home Assistant   |        | Future Devices   |
          +------------------+        +------------------+
```

The project should remain modular so new pages, integrations, services, APIs, and hardware can be added over time without redesigning the complete system.
