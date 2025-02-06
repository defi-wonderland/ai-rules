# @ai-rules/types

Core type definitions and schemas for the AI Rules CLI tool.

## Overview

This package contains all shared types, interfaces, and validation schemas used across the AI Rules CLI tool. It serves as the single source of truth for type definitions and ensures consistency across all packages.

## Structure

```
src/
├── schemas/        # Zod schemas for configuration validation
├── errors/         # Custom error types
├── external.ts     # Public exports
└── index.ts       # Entry point
```

## Key Components

### Schemas

-   Configuration schemas for `.coderabbit.yaml`
-   Configuration schemas for `.cursor/rules`
-   Validation schemas for CLI inputs

### Error Types

-   Custom error classes for specific failure scenarios
-   Type-safe error handling utilities

## Usage

```typescript
import type { TeamConfig } from "@ai-rules/types";
import { TeamConfigSchema } from "@ai-rules/types";

// Use types
const config: TeamConfig = {
    // ...
};

// Validate with schemas
const validated = TeamConfigSchema.parse(config);
```

## TODO

-   [ ] Define base configuration interfaces
-   [ ] Create Zod schemas for all configurations
-   [ ] Implement custom error classes
-   [ ] Add validation utilities
-   [ ] Document all types and interfaces with JSDoc
