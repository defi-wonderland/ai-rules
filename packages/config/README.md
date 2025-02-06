# @ai-rules/config

Configuration management for the AI Rules CLI tool.

## Overview

This package handles all configuration-related functionality for the AI Rules CLI tool. It provides services and providers for reading, writing, and managing configurations for both `.coderabbit.yaml` and `.cursor/rules`.

## Structure

```
src/
├── templates/      # Configuration templates
├── providers/      # Configuration providers (GitHub, File System)
├── services/       # Configuration services
├── external.ts     # Public exports
└── index.ts       # Entry point
```

## Key Components

### Configuration Providers

-   `FileSystemProvider` - Handles local file system operations
-   `GitHubProvider` - Manages GitHub-specific configurations
-   `ConfigurationProvider` - Base provider interface

### Configuration Services

-   `ConfigurationService` - Orchestrates configuration management
-   `ValidationService` - Handles configuration validation
-   `MigrationService` - Manages configuration versioning

### Templates

-   Base templates for different team configurations
-   Version-specific templates
-   Team-specific overrides

## Usage

```typescript
import { ConfigurationService } from "@ai-rules/config";

const configService = await ConfigurationService.create({
    // TODO: configuration options
});

// Generate configuration
await configService.generateConfig({
    teams: ["typescript", "solidity"],
    // other options
});
```

## TODO

-   [ ] Implement configuration providers
-   [ ] Create configuration service
-   [ ] Add validation service
-   [ ] Create base templates
-   [ ] Add version migration support
-   [ ] Implement configuration merging
-   [ ] Add configuration backup functionality
