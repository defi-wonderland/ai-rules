# AI Rules CLI

A command-line tool for standardizing AI configuration across teams. This tool helps manage and maintain consistent `.coderabbit.yaml` and `.cursor/rules` configurations across multiple repositories.

## Overview

Current project setups require manual configuration of `code-rabbit.yml` and `.cursor/rules` files across multiple teams. This leads to inconsistencies and missed optimizations. The CLI tool standardizes configuration while respecting team-specific best practices.

## Features

-   Multi-team support (Offchain, Solidity, UI, Technical Writing)
-   Preset best practice configurations
-   Interactive prompt system with conditional flows
-   Configuration versioning
-   Cross-team best practices support
-   Validation & safety checks

## Architecture

```
┌─────────────────┐
│  CLI Command    │
│ (oclif-based)   │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│ General Tech Stack Prompt│
│ (Multi-select: Back End, │
│  UI, Solidity)           │
└────────┬────────┬────────┘
         │        │
         ▼        ▼
┌────────────┐  ┌─────────────┐
│ Offchain   │  │  Solidity   │
│ Prompt:    │  │ Prompt:     │
│ Language   │  │ Gas Options │
│ selection  │  │ (Yes/No)    │
└────────────┘  └─────────────┘
         │              │
         ▼              ▼
┌──────────────────────────┐
│  Validate Answers (Zod)  │
└────────┬────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│  Generate Config Files   │
└──────────────────────────┘
```

## Project Structure

```
packages/
├── types/           # Core type definitions and schemas
├── config/          # Configuration management
├── prompts/         # Interactive prompt system
├── generators/      # Configuration generators
└── cli/            # Main CLI interface
```

## Installation

```bash
# Using npm
npm install -g @ai-rules/cli

# Using yarn
yarn global add @ai-rules/cli

# Using pnpm
pnpm add -g @ai-rules/cli
```

## Usage

```bash
# Initialize new configuration
ai-rules init

# Generate configuration files
ai-rules generate

# Validate existing configuration
ai-rules validate

# Upgrade configuration version
ai-rules upgrade
```

## Development

### Prerequisites

-   Node.js v.20
-   pnpm v.9.7.1

### Setup

1. Clone the repository

```bash
git clone https://github.com/defi-wonderland/ai-rules.git
cd ai-rules
```

2. Install dependencies

```bash
pnpm install
```

3. Build all packages

```bash
pnpm build
```

### Available Scripts

| Script     | Description             |
| ---------- | ----------------------- |
| `build`    | Build all packages      |
| `clean`    | Clean build artifacts   |
| `dev`      | Start development mode  |
| `test`     | Run tests               |
| `test:cov` | Run tests with coverage |
| `lint`     | Run linter              |
| `format`   | Run formatter           |

### Package Structure

-   `@ai-rules/types`: Core type definitions and schemas
-   `@ai-rules/config`: Configuration management
-   `@ai-rules/prompts`: Interactive prompt system
-   `@ai-rules/generators`: Configuration generators
-   `@ai-rules/cli`: Main CLI interface

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
