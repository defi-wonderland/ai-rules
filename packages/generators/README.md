# @ai-rules/generators

Configuration file generators for the AI Rules CLI tool.

## Overview

This package handles the generation of configuration files for both `.coderabbit.yaml` and `.cursor/rules`. It uses templates and user inputs to create properly formatted configuration files with team-specific best practices.

## Structure

```
src/
├── templates/      # Template files
│   ├── coderabbit/ # CodeRabbit templates
│   └── cursor/     # Cursor templates
├── providers/      # Template providers
├── services/       # Generator services
├── external.ts     # Public exports
└── index.ts       # Entry point
```

## Key Components

### Template System

-   Handlebars-based templating
-   Version-specific templates
-   Team-specific templates
-   Template inheritance

### Generator Services

-   `GeneratorService` - Main service for file generation
-   `TemplateService` - Handles template loading and processing
-   `ValidationService` - Validates generated configurations

## Usage

```typescript
import { GeneratorService } from "@ai-rules/generators";

const generator = await GeneratorService.create();

// Generate configurations
await generator.generate({
    teams: ["typescript", "solidity"],
    outputDir: "./config",
    // other options
});
```

## TODO

-   [ ] Create base template system
-   [ ] Implement CodeRabbit templates
-   [ ] Implement Cursor rule templates
-   [ ] Add template inheritance
-   [ ] Create generator service
