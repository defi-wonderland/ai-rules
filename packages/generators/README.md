# @ai-rules/generators

Configuration file generators for the AI Rules script.

## Overview

This package handles the generation of configuration files for both `.coderabbit.yaml` and `.cursor/rules`. It uses templates and programmatic logic to create properly formatted configuration files with team-specific best practices.

## Directory Structure

```
generators/
├── src/
│   ├── generators/   # Main generator classes (e.g., TemplateGenerator)
│   ├── builders/     # Builder utilities (e.g., ConfigBuilder)
│   ├── external.ts   # Public exports
│   └── index.ts      # Entry point
├── test/
│   ├── generators/   # Tests for generator classes
│   ├── builders/     # Tests for builder utilities
│   └── index.spec.ts # General tests
├── package.json
└── README.md
```

## Key Components

-   **TemplateGenerator**: Main class for generating configuration files from templates.
-   **Templates**: Team- and tool-specific templates for CodeRabbit and Cursor rules.

## Usage

```typescript
import { TemplateGenerator } from "@ai-rules/generators";
import { Config } from "@ai-rules/types";

const config: Config = {
    /* ... */
};
const outputPath = "/path/to/output";
const generator = new TemplateGenerator(config, outputPath);
await generator.generateAll();
```

## Features

-   Generates `.coderabbit.yaml` and `.cursor/rules/*` files
-   Supports multiple tech stacks and team types
-   Uses semantic versioning for configuration
-   Typesafe and extensible architecture
-   File system-based operations with robust error handling

## Development

-   Node.js v20
-   pnpm v9.7.1

See the root README for scripts, contribution guidelines, and more.

## License

MIT
