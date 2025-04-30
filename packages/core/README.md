# @ai-rules/core (Core Script)

Script entry point for generating and managing AI configuration files for the AI Rules project.

## Overview

This package provides the main script entry for generating standardized configuration files (such as `.coderabbit.yaml` and `.cursor/rules/*`) across teams and repositories. It is a script that can be run directly or via npx.

## Directory Structure

```
core/
├── src/
│   └── index.ts      # Script entry point
├── bin/
│   └── ai-rules.js   # Executable script for npx/global usage
├── test/
│   └── index.spec.ts # Tests for the script
├── package.json
└── README.md
```

## Usage

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
-   pnpm v9.7.1

### Available Scripts

| Script        | Description                                             |
| ------------- | ------------------------------------------------------- |
| `build`       | Build the script using tsc                              |
| `check-types` | Check types issues using tsc                            |
| `clean`       | Remove `dist` folder                                    |
| `lint`        | Run ESLint to check for coding standards                |
| `lint:fix`    | Run linter and automatically fix code formatting issues |
| `format`      | Check code formatting and style using Prettier          |
| `format:fix`  | Run formatter and automatically fix issues              |
| `test`        | Run tests using vitest                                  |
| `test:cov`    | Run tests with coverage report                          |

## Features

-   Generates `.coderabbit.yaml` and `.cursor/rules/*` files for standardizing AI configuration
-   Supports multiple tech stacks and team types
-   Semantic versioning for configuration
-   Typesafe and extensible architecture
-   File system-based operations with robust error handling

## Contributing

See the root README for contribution guidelines, conventional commits, and package creation instructions.

## License

MIT
