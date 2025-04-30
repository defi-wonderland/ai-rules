# @ai-rules/types

Core type definitions and schemas for the AI Rules script.

## Overview

This package contains all shared types, interfaces, and validation schemas used across the AI Rules script. It serves as the single source of truth for type definitions and ensures consistency across all packages.

## Directory Structure

```
types/
├── src/
│   ├── errors/         # Custom error types (e.g., file-check, file-operation, validation, etc.)
│   ├── schemas/        # Zod schemas and config mocks for configuration validation
│   ├── interfaces/     # Shared TypeScript interfaces (e.g., cursor-rule.interface)
│   ├── external.ts     # Public exports
│   └── index.ts        # Entry point
├── test/               # Unit tests for errors, schemas, etc.
├── package.json
└── README.md
```

## Key Components

### Schemas

The package provides Zod schemas for validating configurations:

-   `ConfigSchema`: Validates the complete configuration structure
-   `OffchainLanguageConfigSchema`: Validates TypeScript team configurations
-   `SolidityConfigSchema`: Validates Solidity team configurations
-   `mockConfig`, `mockMinimalConfig`: Mocks for testing

### Error Types

Custom error classes for specific failure scenarios:

-   `InvalidJson`, `FileOperation`, `FileCheck`, `FileGeneration`: File and parsing errors
-   `BaseConfiguration`: Base error class for configuration-related errors
-   `MissingConfig`, `MissingTeam`: Errors for missing configuration or team
-   `Validation`: Error for schema validation failures

### Interfaces

-   `CursorRule`: Interface for cursor rule definitions

## Usage

```typescript
import type { Config } from "@ai-rules/types";
import { ConfigSchema, FileOperation, mockConfig } from "@ai-rules/types";

try {
    const validated = ConfigSchema.parse(mockConfig);
} catch (error) {
    if (error instanceof FileOperation) {
        // Handle file operation error
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
