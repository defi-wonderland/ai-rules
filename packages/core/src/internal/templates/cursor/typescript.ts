import type { CursorRule } from "../../interfaces/cursor-rule.interface.js";

export const typescriptRules: CursorRule[] = [
    {
        name: "typescript-base",
        description: "Base TypeScript development guidelines",
        globs: "**/*.ts",
        content: `# TypeScript Development Guidelines

## Code Organization
- Avoid over-abstraction and prioritize composition over inheritance
- Use dependency injection and follow SOLID principles
- Prevent circular dependencies using the internal module pattern
- Libraries should have an \`external.ts\` file for public exports

## Type Safety
- Avoid \`any\`; use \`unknown\` when type is uncertain
- Use runtime type-checking (Zod) for environment variables
- Maintain \`bigint\` types from external APIs

## Documentation
- Use JSDoc for all code elements
- Document public APIs thoroughly
- Include examples for complex functionality

## Best Practices
- Implement static async factory functions for constructors
- Follow established naming conventions
- Keep functions focused and single-purpose`,
    },
    {
        name: "typescript-services",
        description: "TypeScript service layer guidelines",
        globs: "**/services/**/*.ts",
        content: `# Service Layer Guidelines

## Architecture
- Proper encapsulation of business workflows
- Orchestrate multiple components or data sources
- Use Providers for resource access

## Naming
- Clear, descriptive service names (e.g., \`AggregatorService\`, \`MetricsService\`)
- Names should reflect domain-specific tasks
- Use consistent suffixes (\`Service\` for services)`,
    },
    {
        name: "typescript-providers",
        description: "TypeScript provider layer guidelines",
        globs: "**/providers/**/*.ts",
        content: `# Provider Layer Guidelines

## Architecture
- Narrowly scoped data/resource handling
- Single responsibility for data access
- Implement \`IMetadataProvider\` interface when applicable

## Naming
- Consistent naming for metadata interactions (e.g., \`GithubProvider\`)
- Names should reflect the resource being provided
- Use consistent suffixes (\`Provider\` for providers)`,
    },
    {
        name: "typescript-scripts",
        description: "TypeScript script guidelines",
        globs: "scripts/**/*.ts",
        content: `# Script Guidelines

## Organization
- Use \`process.cwd()\` for root directory references
- Follow folder conventions:
  - \`infra/\` for infrastructure scripts
  - \`utilities/\` for utility scripts

## Naming
- Organize in \`package.json\` using:
  - \`script:infra:{name}\` for infrastructure scripts
  - \`script:util:{name}\` for utility scripts

## Best Practices
- Include proper error handling
- Add logging for important operations
- Document script purpose and usage`,
    },
    {
        name: "typescript-tests",
        description: "TypeScript test file guidelines",
        globs: "**/*.test.ts",
        content: `# Test Guidelines

## Test Structure
- Write descriptive test names without using "should"
- Follow test library best practices (Mocha/Chai/Jest/Vitest/Cypress)
- Keep tests focused and single-purpose
- Use appropriate test hooks and lifecycle methods

## Best Practices
- Write clear, descriptive assertions
- Test edge cases and error conditions
- Use appropriate mocking strategies
- Follow the Arrange-Act-Assert pattern`,
    },
    {
        name: "typescript-errors",
        description: "TypeScript error class guidelines",
        globs: "**/errors/**/*.ts",
        content: `# Error Class Guidelines

## Naming Conventions
- Use declarative, descriptive names
- Avoid suffixes like \`Exception\` or \`Error\`
- Example: Use \`EmptyArray\` instead of \`EmptyArrayException\`

## Best Practices
- Extend the base Error class
- Set appropriate error names
- Include helpful error messages
- Consider adding context-specific properties`,
    },
];
