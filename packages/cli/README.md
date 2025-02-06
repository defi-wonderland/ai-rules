# @ai-rules/cli

Command-line interface for the AI Rules tool.

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
