# Kratos Admin Dashboard 🚀

[![GitHub repo size](https://img.shields.io/github/repo-size/meysam81/kratos-admin)](https://github.com/meysam81/kratos-admin)
[![GitHub language count](https://img.shields.io/github/languages/count/meysam81/kratos-admin)](https://github.com/meysam81/kratos-admin)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/meysam81/kratos-admin)](https://github.com/meysam81/kratos-admin/commits/main/)
[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/meysam81/kratos-admin)](https://github.com/meysam81/kratos-admin)
[![pre-commit.ci status](https://results.pre-commit.ci/badge/github/meysam81/kratos-admin/main.svg)](https://results.pre-commit.ci/latest/github/meysam81/kratos-admin/main)
[![Docker Image Size](https://img.shields.io/docker/image-size/meysam81/kratos-admin)](https://hub.docker.com/r/meysam81/kratos-admin)
[![Docker Pulls](https://img.shields.io/docker/pulls/meysam81/kratos-admin)](https://hub.docker.com/r/meysam81/kratos-admin)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Powered by Ory](https://img.shields.io/badge/powered%20by-ory-blue)](https://www.ory.sh/)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [🔧 Configuration](#-configuration)
- [🏗️ Building for Production](#-building-for-production)
- [🎯 Usage](#-usage)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)
- [🔗 Links](#-links)
- [🌟 Acknowledgments](#-acknowledgments)
- [📊 Project Status](#-project-status)
- [🔮 Roadmap](#-roadmap)
- [💡 Need Help?](#-need-help)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

A sleek, modern single-page application for managing identities and access control in Ory Kratos identity servers.

## ✨ Features

- 🎯 Intuitive identity management interface
- 🔐 Create, read, update, and delete identities
- 🌓 Dark mode support with system preference detection
- 📱 Fully responsive design
- ⚡ Lightning-fast performance with Vite
- 🎨 Modern UI with Tailwind CSS
- 🔒 Secure interaction with Kratos Admin APIs
- 🌐 Cross-browser compatibility
- 🚀 Zero dependencies (vanilla JavaScript)

## 🚀 Quick Start

### Prerequisites

- Bun v1
- A running Ory Kratos server

### Installation

```bash
# Clone the repository
git clone https://github.com/meysam81/kratos-admin.git

# Navigate to the project directory
cd kratos-admin

# Install dependencies
bun install

# Start the development server
bun run dev
```

## 🔧 Configuration

The API endpoint can be configured in three ways (in order of priority):

### 1. User Override (Settings UI)

Users can set a custom endpoint via the Settings page. This is saved to localStorage and takes highest priority.

### 2. Runtime Configuration (Recommended for Deployment)

Mount a `config.json` file at runtime to set the default API endpoint without rebuilding:

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
volumes:
  - name: config
    configMap:
      name: kratos-admin-config
volumeMounts:
  - name: config
    mountPath: /public/config.json
    subPath: config.json
```

### 3. Build-time Environment Variable

Set during build (baked into the bundle):

```bash
VITE_DEFAULT_API_ENDPOINT=http://localhost:4434
```

**Priority Chain:** User Override > Runtime Config > Build-time Env > Default (`http://localhost:4434`)

## 🏗️ Building for Production

```bash
# Build the application
bun run build

# Preview the production build
bun run preview
```

## 🎯 Usage

1. Configure your Kratos server URL in the environment variables
2. Start the application
3. Use the interface to:
   - View all identities
   - Create new identities
   - Modify existing identities
   - Delete identities
   - Manage identity traits
   - View identity sessions

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🔗 Links

- [Ory Kratos Documentation](https://www.ory.sh/docs/kratos)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)

## 🌟 Acknowledgments

- [Ory](https://www.ory.sh/) for creating Kratos
- The open-source community for inspiration and support

## 📊 Project Status

This project is under active development. We welcome feedback, bug reports, and feature requests through GitHub issues.

## 🔮 Roadmap

- [ ] Implement user session management
- [ ] Add authentication flow visualization

## 💡 Need Help?

If you have any questions or need help with setup, please open an issue in the GitHub repository.

---

<p align="center">Made with ❤️ for the Ory community</p>
