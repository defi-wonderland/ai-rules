# @ai-rules/config

Configuration management for the AI Rules CLI tool.

## Overview

This package handles all configuration-related functionality for the AI Rules CLI tool. It provides services and providers for reading, writing, and managing configurations for both `.coderabbit.yaml` and `.cursor/rules`.

## Structure

```
src/
├── interfaces/
│   ├── index.ts                    # Exports all interfaces
│   └── config-provider.interface.ts # Interface implementation
├── templates/      # Configuration templates
│   └── defaults/   # Default configuration templates
│       ├── base.ts        # Base configuration template
│       ├── offchain.ts    # Offchain configuration template
│       ├── solidity.ts    # Solidity team template
│       └── index.ts       # Template exports
├── providers/      # Configuration providers
│   └── filesystem-provider.ts  # File system operations
├── services/      # Configuration services
│   ├── configuration.service.ts  # Main configuration service
│   └── index.ts                 # Service exports
├── external.ts    # Public exports
└── index.ts      # Entry point
```

## Key Components

### Configuration Provider

The `FileSystemProvider` class handles all file system operations:

-   Reading configuration files
-   Writing configuration files
-   Checking file existence
-   Proper error handling for file operations

### Configuration Service

The `ConfigurationService` class orchestrates configuration management:

-   Static factory method for easy instantiation
-   Configuration file reading and writing
-   Configuration existence checking
-   Provider-based architecture for extensibility

### Templates

Default configuration templates for different scenarios:

-   Base configuration template with common settings
-   Team-specific templates (e.g., Solidity, Offchain)
-   Extensible template system for future teams

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
-   ✅ Default configuration templates
-   ✅ Error handling with custom error types
-   ✅ Provider-based architecture for extensibility

## TODO:

-   [ ] Implement configuration merging
-   [ ] Add configuration migration support
