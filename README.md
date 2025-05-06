# AI Rules

A script for standardizing AI configuration across teams. This tool helps manage and maintain consistent `.coderabbit.yaml` and `.cursor/rules` configurations.

## Overview

This package provides a simple script to generate AI configuration files for your projects. It generates a `.coderabbit.yaml` file and a set of `.cursor/rules` files. Feel free to delete any that do not apply to your project.

## Installation & Usage

You can run the script directly with npx (no install required):

```bash
npx @defi-wonderland/ai-rules
```

Or, after installing globally:

```bash
pnpm add -g @defi-wonderland/ai-rules
ai-rules
```

## Generated Files

The script will generate:

1. `.coderabbit.yaml` - Configuration for the CodeRabbit AI code review tool
2. `.cursor/rules/*` - Team-specific best practices for Cursor AI coding assistant

## Features

-   Supports multiple tech stacks with best practices:
    -   Solidity
    -   TypeScript
    -   React/UI
-   Configuration uses semantic versioning to track changes
-   Typesafe configuration generation

## License

The primary license for the boilerplate is MIT. See the [`LICENSE`](./LICENSE) file for details.
