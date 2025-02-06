# @ai-rules/prompts

Interactive prompt system for the AI Rules CLI tool.

## Overview

This package provides the interactive prompt system for the AI Rules CLI tool. It handles user input collection, validation, and manages the flow of questions based on previous answers.

## Structure

```
src/
├── questions/      # Question definitions and flows
├── validators/     # Input validation rules
├── external.ts     # Public exports
└── index.ts       # Entry point
```

## Key Components

### Question System

-   Team selection prompts
-   Tech stack questions
-   Configuration options
-   Validation rules

### Validators

-   Input validation
-   Format checking
-   Dependency validation
-   Cross-answer validation

### Flow Management

-   Conditional questions
-   Dynamic options
-   Answer persistence
-   State management

## Usage

TODO: add usage info

## TODO

-   [ ] Implement base prompt system
-   [ ] Create team selection prompts
-   [ ] Add technology stack questions
-   [ ] Implement validation rules
-   [ ] Add conditional flow logic
-   [ ] Create answer persistence
-   [ ] Add state management
-   [ ] Implement cross-answer validation

## Setup

1. Install dependencies running `pnpm install`

## Available Scripts

Available scripts that can be run using `pnpm`:

| Script        | Description                                             |
| ------------- | ------------------------------------------------------- |
| `build`       | Build library using tsc                                 |
| `check-types` | Check types issues using tsc                            |
| `clean`       | Remove `dist` folder                                    |
| `lint`        | Run ESLint to check for coding standards                |
| `lint:fix`    | Run linter and automatically fix code formatting issues |
| `format`      | Check code formatting and style using Prettier          |
| `format:fix`  | Run formatter and automatically fix issues              |
| `test`        | Run tests using vitest                                  |
| `test:cov`    | Run tests with coverage report                          |
