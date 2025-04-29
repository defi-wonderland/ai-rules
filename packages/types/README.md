# @ai-rules/types

Core type definitions and schemas for the AI Rules CLI tool.

## Overview

This package contains all shared types, interfaces, and validation schemas used across the AI Rules CLI tool. It serves as the single source of truth for type definitions and ensures consistency across all packages.

## Structure

```
src/
├── schemas/        # Zod schemas for configuration validation
│   ├── config.ts   # Core configuration schemas
│   └── index.ts    # Schema exports
├── errors/         # Custom error types
│   ├── base-configuration.ts   # Base configuration errors
│   ├── missing-config.ts       # Missing configuration errors
│   ├── missing-team.ts         # Team-related errors
│   ├── validation.ts           # Validation errors
│   └── index.ts               # Error exports
├── external.ts     # Public exports
└── index.ts       # Entry point
```

## Key Components

### Schemas

The package provides Zod schemas for validating configurations:

-   `ConfigSchema`: Validates the complete configuration structure
-   `MinimalConfigSchema`: Validates the minimal required configuration
-   `CodeRabbitConfigSchema`: Validates CodeRabbit-specific settings
-   `SolidityConfigSchema`: Validates Solidity team configurations
-   `OffchainLanguageConfigSchema`: Validates TypeScript team configurations

### Error Types

Custom error classes for specific failure scenarios:

-   `BaseConfiguration`: Base error class for configuration-related errors
-   `MissingConfig`: Error for missing configuration files
-   `MissingTeam`: Error for missing team configurations
-   `InvalidValidation`: Error for schema validation failures

## Usage

```typescript
import type { Config, MinimalConfig } from "@ai-rules/types";
import { ConfigSchema, MinimalConfigSchema, MissingConfig } from "@ai-rules/types";

const config: MinimalConfig = {
    version: "1.0.0",
    teams: ["solidity", "ui"],
    coderabbit: {
        language: "en",
        tone_instructions: "friendly",
        early_access: false,
        enable_free_tier: true,
        reviews: {
            // ... review settings
        },
        chat: {
            // ... chat settings
        },
        knowledge_base: {
            // ... knowledge base settings
        },
    },
};

// Validate with schemas
try {
    const validated = MinimalConfigSchema.parse(config);
} catch (error) {
    if (error instanceof MissingConfig) {
        // Handle missing configuration
    }
    // Handle other errors
}
```

## Features

-   ✅ Comprehensive type definitions for configuration
-   ✅ Zod schemas for runtime validation
-   ✅ Custom error classes for better error handling
-   ✅ Type-safe exports through `external.ts`
-   ✅ Full TypeScript support with strict typing

## TODO:

-   [ ] Add validation utilities
