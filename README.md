# AI Rules Script

A script for standardizing AI configuration across teams. This tool helps manage and maintain consistent `.coderabbit.yaml` and `.cursor/rules` configurations across multiple repositories.

## Overview

Current project setups require manual configuration of `coderabbit.yml` and `.cursor/rules` files across multiple teams. This leads to inconsistencies and missed optimizations. The script standardizes configuration while respecting team-specific best practices. Feel free to delete and/or change any configuration files, but if you have a suggestion on improving one of the rules open an issue and we'll update the script accordingly!

## Features

-   Variety of tech stack best practices supported: React, Solidity, TypeScript, etc.
-   Preset best practice configurations
-   Configuration semantic versioning
-   Typesafe configurations

## Architecture

```
┌─────────────────┐
│  Script Entry   │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────┐
│  Generate Configuration Files│
│  (e.g., .coderabbit.yaml,    │
│   .cursor/rules/*)           │
└──────────────────────────────┘
```

## Project Structure

```
ai-rules/
├── packages/
│   ├── types/        # Core type definitions and schemas
│   ├── config/       # Configuration management
│   ├── generators/   # Configuration generators
│   └── core/         # Main script entry point
```

## Installation & Usage

You can run the script directly with npx (no install required):

```bash
npx @defi-wonderland/ai-rules
```

Or, after installing globally:

```bash
pnpm add -g @defi-wonderland/ai-rules
ai-rules
```

Or, for development:

```bash
git clone https://github.com/defi-wonderland/ai-rules.git
cd ai-rules
pnpm install
pnpm build
node packages/core/bin/ai-rules.js
```

## Development

### Prerequisites

-   Node.js v20
-   pnpm v.9.7.1

### Available Scripts

| Script     | Description             |
| ---------- | ----------------------- |
| `build`    | Build all packages      |
| `clean`    | Clean build artifacts   |
| `test`     | Run tests               |
| `test:cov` | Run tests with coverage |
| `lint`     | Run linter              |
| `format`   | Run formatter           |

### Package Structure

-   `@ai-rules/types`: Core type definitions and schemas
-   `@ai-rules/config`: Configuration management
-   `@ai-rules/generators`: Configuration generators
-   `@defi-wonderland/ai-rules`: Main script entry point

## Contributing

Wonderland is a team of top Web3 researchers, developers, and operators who believe that the future needs to be open-source, permissionless, and decentralized.

[DeFi sucks](https://defi.sucks), but Wonderland is here to make it better.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### 💻 Conventional Commits

We follow the Conventional Commits [specification](https://www.conventionalcommits.org/en/v1.0.0/#specification).

### Creating a new package

To create a new package, run the following command:

```bash
pnpm run create-package <package-name>
```

Replace `<package-name>` with your desired package name. This command will generate the package directory with predefined templates and configuration files.

## License

The primary license for the boilerplate is MIT. See the [`LICENSE`](./LICENSE) file for details.
