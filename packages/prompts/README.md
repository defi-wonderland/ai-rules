# @ai-rules/prompts

Interactive prompt system for the AI Rules CLI tool. This package handles user interactions, validation, and state management for configuration generation.

## Installation

```bash
pnpm add @ai-rules/prompts
```

## Structure

```
src/
├── interfaces/
│   ├── index.ts
│   └── prompt-provider.interface.ts    # Contract for prompt providers
├── providers/
│   ├── index.ts
│   └── inquirer-provider.ts           # Implementation using Inquirer.js
├── services/
│   ├── index.ts
│   ├── validation.service.ts          # Validates user inputs and configurations
│   └── state.service.ts               # Manages prompt state and persistence
├── external.ts                        # Public exports
└── index.ts                          # Package entry point

test/                                 # Test files
└── index.spec.ts
```

## Usage

### Basic Usage

```typescript
import { InquirerProvider, StateService, ValidationService } from "@ai-rules/prompts";

// Initialize services
const stateService = new StateService();
const validationService = new ValidationService(stateService);
const promptProvider = new InquirerProvider();

// Get tech stack selection
const teams = await promptProvider.getTechStackSelection();

// Get team-specific configuration
for (const team of teams) {
    const answers = await promptProvider.getTeamConfig(team);
    stateService.addTeamAnswers(team, answers);
}

// Validate final configuration
const errors = validationService.validateConfiguration();
if (errors.length > 0) {
    console.error("Configuration validation failed:", errors);
}
```

### Custom Prompt Provider

You can create your own prompt provider by implementing the `IPromptProvider` interface:

```typescript
import { IPromptProvider, TeamType } from "@ai-rules/prompts";

class CustomPromptProvider implements IPromptProvider {
    async getTechStackSelection(): Promise<TeamType[]> {
        // Your implementation
    }

    async getTeamConfig(team: TeamType): Promise<unknown> {
        // Your implementation
    }
}
```

## Services

### StateService

Manages the state of the prompt system, including:

-   Selected teams
-   Team-specific answers
-   Configuration persistence

```typescript
const stateService = new StateService();
stateService.addTeam(TeamType.enum.offchain);
stateService.addTeamAnswers(TeamType.enum.offchain, { language: "typescript" });
```

### ValidationService

Handles validation of:

-   Individual answers
-   Cross-answer validation
-   Complete configuration validation

```typescript
const validationService = new ValidationService(stateService);
const config = validationService.validateOffchainConfig(answers);
const errors = validationService.validateConfiguration();
```

## Providers

### InquirerProvider

Default implementation using Inquirer.js for:

-   Interactive CLI prompts
-   Team selection
-   Configuration questions

```typescript
const provider = new InquirerProvider();
const teams = await provider.getTechStackSelection();
const config = await provider.getTeamConfig(TeamType.enum.solidity);
```

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
