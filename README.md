# Kratos Admin

[![GitHub Stars](https://img.shields.io/github/stars/meysam81/kratos-admin)](https://github.com/meysam81/kratos-admin)
[![Docker Pulls](https://img.shields.io/docker/pulls/meysam81/kratos-admin)](https://hub.docker.com/r/meysam81/kratos-admin)
[![Docker Image Size](https://img.shields.io/docker/image-size/meysam81/kratos-admin)](https://hub.docker.com/r/meysam81/kratos-admin)
[![GitHub last commit](https://img.shields.io/github/last-commit/meysam81/kratos-admin)](https://github.com/meysam81/kratos-admin/commits/main/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-yellow.svg)](https://opensource.org/licenses/Apache-2.0)
[![pre-commit.ci status](https://results.pre-commit.ci/badge/github/meysam81/kratos-admin/main.svg)](https://results.pre-commit.ci/latest/github/meysam81/kratos-admin/main)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Powered by Ory](https://img.shields.io/badge/powered%20by-ory-blue)](https://www.ory.sh/)

Admin UI for [Ory Kratos](https://www.ory.sh/docs/kratos). Manage identities, sessions, and schemas.

![Dashboard](docs/assets/dashboard.png)

## Quick Start

```bash
docker run -p 8080:8080 meysam81/kratos-admin
```

Open http://localhost:8080, configure your Kratos endpoint in the Settings tab.

### With Custom Endpoint

```bash
echo '{"apiEndpoint":"https://kratos.example.com"}' > config.json
docker run -p 8080:8080 -v ./config.json:/public/config.json:ro meysam81/kratos-admin
```

**NOTE**: You must ensure the CORS is setup corrrectly, i.e., by putting the
Kratos Admin URL behind a load-balancer/reverse-proxy.

## Features

- Identity CRUD with pagination
- Session management and revocation
- Courier message viewer
- Identity schema browser
- Dark/light theme with system preference detection
- Runtime configuration (no rebuild needed)
- Responsive design

## Configuration

The API endpoint can be configured in three ways (in order of priority):

### 1. User Override (Settings UI)

Users can set a custom endpoint via the Settings page. Saved to localStorage, takes highest priority.

### 2. Runtime Configuration (Recommended)

Mount a `config.json` file at runtime:

```json
{
  "apiEndpoint": "https://kratos-admin.example.com"
}
```

**Docker:**

```bash
docker run -p 8080:8080 \
  -v ./config.json:/public/config.json:ro \
  meysam81/kratos-admin
```

**Kubernetes:**

```yaml
spec:
  containers:
    - name: kratos-admin
      image: meysam81/kratos-admin:latest
      volumeMounts:
        - name: config
          mountPath: /public/config.json
          subPath: config.json
          readOnly: true
  volumes:
    - name: config
      configMap:
        name: kratos-admin-config
        optional: false
        defaultMode: 0444
```

### 3. Build-time Environment Variable

Set during build (baked into the bundle):

```bash
VITE_DEFAULT_API_ENDPOINT=http://localhost:4434
```

**Priority:** User Override > Runtime Config > Build-time Env > Default (`http://localhost:4434`)

## Development

```bash
bun install && bun start
```

## Vision

Building a unified admin UI for the [Ory](https://www.ory.sh/) ecosystem. Currently supports Kratos.

Hydra, Keto, and Oathkeeper support planned.

## Contributing

PRs welcome. Fork, branch, PR.

## License

[Apache-2.0](LICENSE)
