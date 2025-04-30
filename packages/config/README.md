# @ai-rules/config

Configuration management for the AI Rules script.

## Overview

This package handles all configuration-related functionality for the AI Rules script. It provides services and providers for reading, writing, and managing configurations for both `.coderabbit.yaml` and `.cursor/rules`.

## Directory Structure

```
config/
├── src/
│   ├── interfaces/   # TypeScript interfaces for providers/services
│   ├── templates/    # Default and team-specific configuration templates
│   ├── providers/    # Configuration providers (e.g., FileSystemProvider)
│   ├── services/     # Configuration services (e.g., ConfigurationService)
│   ├── external.ts   # Public exports
│   └── index.ts      # Entry point
```

## Key Components

-   **FileSystemProvider**: Handles file system operations (read, write, exists) for configuration files.
-   **ConfigurationService**: Orchestrates configuration management using providers. Supports reading, writing, and checking existence of config files.
-   **Templates**: Provides default and team-specific configuration templates for easy bootstrapping and extension.

## Usage

```typescript
import { ConfigurationService } from "@ai-rules/config";

// Create a configuration service instance
const configService = await ConfigurationService.create("/path/to/config");

// Read configuration
const config = await configService.readConfig("config.json");

// Write configuration
await configService.writeConfig("config.json", {
    version: "1.0.0",
    teams: ["solidity"],
    coderabbit: {
        // ... configuration details
    },
});

// Check if configuration exists
const exists = await configService.hasConfig("config.json");
```

## Features

-   ✅ File system-based configuration management
-   ✅ Static factory pattern for service creation
-   ✅ Default and team-specific configuration templates
-   ✅ Error handling with custom error types
-   ✅ Provider-based architecture for extensibility
-   ✅ Typesafe configurations
-   ✅ Configuration of semantic versioning
