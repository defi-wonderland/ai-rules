# @ai-rules/core

TODO: update this README since no longer using CLI

Command-line interface for generating and managing AI configuration files.

## Overview

This package provides the main CLI interface for the AI Rules tool. It uses oclif to create a command-line experience for managing AI configuration files across teams.

## Structure

```
src/
├── commands/      # CLI commands
├── services/      # CLI services
└── index.ts      # Entry point
```

## Key Components

### Commands

-   `init` - Initialize configuration
-   `generate` - Generate configuration files
-   `validate` - Validate existing configurations
-   `upgrade` - Upgrade configuration versions

### Services

-   `CLIService` - Main service for CLI operations
-   `LoggingService` - Handles CLI output and logging
-   `StateService` - Manages CLI state

## Installation

````bash
# Using npm
npm install -g @ai-rules/cli

# Using yarn
yarn global add @ai-rules/cli

Generate configuration files:
```bash
ai-rules generate
````

Options:

-   `-f, --force`: Force overwrite existing files
-   `-p, --path`: Output path for generated files (default: current directory)

## Development

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Build the project:

```bash
pnpm run build
```

4. Link the CLI for local testing:

```bash
pnpm link
```

## Testing

### Unit Tests

Run the test suite:

```bash
pnpm test
```

Run with coverage:

```bash
pnpm test:cov
```

### Manual Testing

1. Build and link the CLI:

```bash
pnpm run build
pnpm link
```

2. Create a test directory:

```bash
mkdir test-cli
cd test-cli
```

3. Test the generate command:

```bash
ai-rules generate
```

4. Test with different flags:

```bash
# Force overwrite
ai-rules generate -f

# Custom output path
ai-rules generate -p ./configs
```

5. Verify generated files:

```bash
ls -la .cursor/rules/
cat .coderabbit.yaml
```

### Integration Testing

Test the CLI with different project setups:

1. Empty project:

```bash
mkdir empty-test
cd empty-test
ai-rules generate
```

2. Existing project:

```bash
# Create a sample project
mkdir existing-test
cd existing-test
echo '{}' > package.json
ai-rules generate
```

3. With existing configurations:

```bash
# Create existing configs
mkdir existing-configs
cd existing-configs
mkdir -p .cursor/rules
touch .cursor/rules/typescript-base.mdc
ai-rules generate -f  # Test overwrite
```

## Available Scripts

| Script        | Description                                             |
| ------------- | ------------------------------------------------------- |
| `build`       | Build CLI using tsc                                     |
| `check-types` | Check types issues using tsc                            |
| `clean`       | Remove `dist` folder                                    |
| `lint`        | Run ESLint to check for coding standards                |
| `lint:fix`    | Run linter and automatically fix code formatting issues |
| `format`      | Check code formatting and style using Prettier          |
| `format:fix`  | Run formatter and automatically fix issues              |
| `test`        | Run tests using vitest                                  |
| `test:cov`    | Run tests with coverage report                          |

## TODO

-   [ ] Implement base CLI structure
-   [ ] Create init command
-   [ ] Add generate command
-   [ ] Implement validate command
-   [ ] Add upgrade command
-   [ ] Create logging service
-   [ ] Add state management
-   [ ] Implement error handling
-   [ ] Add command documentation
-   [ ] Create help system
