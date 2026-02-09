# Ory Admin UI

[![GitHub Repo stars](https://img.shields.io/github/stars/licenseware/ory-admin-ui?style=flat)](https://github.com/licenseware/ory-admin-ui)
[![Docker Pulls](https://img.shields.io/docker/pulls/licenseware/ory-admin-ui)](https://hub.docker.com/r/licenseware/ory-admin-ui)
[![GitHub Release](https://img.shields.io/github/v/release/licenseware/ory-admin-ui?label=Latest+Release)](https://github.com/licenseware/ory-admin-ui/releases)
[![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/licenseware/ory-admin-ui/total?label=GitHub+Release+Downloads)](https://github.com/licenseware/ory-admin-ui/releases)
[![Docker Image Size](https://img.shields.io/docker/image-size/licenseware/ory-admin-ui)](https://hub.docker.com/r/licenseware/ory-admin-ui)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/licenseware/ory-admin-ui)](https://github.com/licenseware/ory-admin-ui/commits/main/)
[![GitHub last commit](https://img.shields.io/github/last-commit/licenseware/ory-admin-ui)](https://github.com/licenseware/ory-admin-ui/commits/main/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-yellow.svg)](https://opensource.org/licenses/Apache-2.0)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Powered by Ory](https://img.shields.io/badge/powered%20by-ory-blue)](https://www.ory.sh/)

Admin UI for [Ory Kratos](https://www.ory.sh/docs/kratos). Manage identities, sessions, and schemas across multiple environments.

![Dashboard](docs/assets/dashboard.png)

## Quick Start

```bash
docker run -p 8080:8080 licenseware/ory-admin-ui
```

Open http://localhost:8080, configure your Kratos endpoint in the Settings tab.

### With Custom Profiles

```bash
cat > config.json <<EOF
{
  "local": {
    "kratosAdminBaseURL": "http://localhost:4455",
    "kratosPublicBaseURL": "http://localhost:4433"
  },
  "prod": {
    "kratosAdminBaseURL": "https://kratos-admin.example.com",
    "kratosPublicBaseURL": "https://kratos-public.example.com"
  }
}
EOF

docker run -p 8080:8080 \
    -v ./config.json:/public/config.json:ro licenseware/ory-admin-ui
```

**NOTE**: You must ensure the CORS is setup corrrectly, i.e., by putting the
Kratos Admin URL behind a load-balancer/reverse-proxy.

## Features

- Identity CRUD with pagination
- Session management and revocation
- Courier message viewer
- Identity schema browser
- Multi-profile support (switch between environments, import/export)
- Profile switcher in header (AWS-style)
- Dark/light theme with system preference detection
- Runtime configuration (no rebuild needed)
- Responsive design

## Configuration

The API endpoints can be configured in three ways (in order of priority):

**Two endpoints are available:**

| Endpoint              | Default Port | Purpose                                 |
| --------------------- | ------------ | --------------------------------------- |
| `kratosAdminBaseURL`  | 4434         | Admin API - identity CRUD, session mgmt |
| `kratosPublicBaseURL` | 4433         | Public API - identity schemas           |

### 1. Profiles (Settings UI)

Users can create and switch between profiles via the Settings page. Saved to localStorage, takes highest priority.

### 2. Runtime Configuration (Recommended)

Mount a `config.json` file at runtime:

```json
{
  "local": {
    "kratosAdminBaseURL": "http://localhost:4434",
    "kratosPublicBaseURL": "http://localhost:4433"
  },
  "prod-eu": {
    "kratosAdminBaseURL": "https://kratos-admin.eu.example.com",
    "kratosPublicBaseURL": "https://kratos.eu.example.com"
  }
}
```

**Docker:**

```bash
docker run -p 8080:8080 \
  -v ./config.json:/public/config.json:ro \
  licenseware/ory-admin-ui
```

**Kubernetes:**

```yaml
spec:
  containers:
    - name: ory-admin-ui
      image: licenseware/ory-admin-ui
      volumeMounts:
        - name: config
          mountPath: /public/config.json
          subPath: config.json
          readOnly: true
  volumes:
    - name: config
      configMap:
        name: ory-admin-ui-config
        optional: false
        defaultMode: 0444
```

### 3. Build-time Environment Variable

Set during build (baked into the bundle):

```bash
VITE_DEFAULT_PROFILES={"local":{"kratosAdminBaseURL":"http://localhost:4434","kratosPublicBaseURL":"http://localhost:4433"}}
```

**Priority:** Profiles UI > Runtime Config > Build-time Env > Hardcoded fallback

## Development

```bash
docker compose up -d

bun install
bun start
```

## Vision

Building a unified admin UI for the [Ory](https://www.ory.sh/) ecosystem. Currently supports Kratos.

Hydra, Keto, and Oathkeeper support planned.

## Contributing

PRs welcome. Fork, branch, PR.

## License

[Apache-2.0](LICENSE)
