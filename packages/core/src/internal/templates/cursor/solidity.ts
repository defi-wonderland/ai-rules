import type { CursorRule } from "../../interfaces/index.js";

export const solidityRules: CursorRule[] = [
    {
        name: "solidity-base",
        description: "Solidity guidelines",
        globs: "**/*.sol",
        content: `# Solidity Base Guidelines

## Code Structure
- Order imports: External Libraries → Internal Libraries → Local Interfaces → Local Contracts
- Define events, errors, and structs in interfaces
- Order functions by visibility: external → public → internal → private
- Order state variables: constants → immutable → storage

## Naming Conventions
- Prefix interfaces with "I"
- Capitalize constants and immutable variables
- Prefix internal storage variables with underscore
- Use descriptive, unambiguous names`,
    },
    {
        name: "solidity-security",
        description: "Solidity security guidelines",
        globs: "**/*.sol",
        content: `# Solidity Security Guidelines

## Security Patterns
- Use CEI pattern (Checks-Effects-Interactions)
- Prefer custom errors over require statements
- Include comprehensive NatSpec documentation
- Emit events for storage changes
- Inherit interfaces last to avoid linearization issues

## Best Practices
- Use SafeMath or unchecked blocks appropriately
- Validate all inputs
- Handle edge cases explicitly
- Follow security best practices`,
    },
    {
        name: "solidity-gas",
        description: "Solidity gas optimization guidelines",
        globs: "**/*.sol",
        content: `# Gas Optimization Guidelines

## Storage Optimization
- Cache storage variables in memory
- Pack storage variables into single slots
- Keep strings under 32 bytes
- Use appropriate variable sizes (uint48 for timestamps)
- Use mappings instead of arrays when possible

## Computation Optimization
- Use unchecked blocks for safe arithmetic
- Avoid unnecessary storage reads/writes
- Use calldata for function parameters
- Cache repeated calculations
- Use events instead of storage when possible`,
    },
    {
        name: "solidity-tests",
        description: "Solidity test file guidelines",
        globs: "**/t.sol",
        content: `# Solidity Test Guidelines

## Unit Tests
- Use vm.bound for multiple fuzz case exclusions
- Use vm.assume only for single case exclusions
- Use vm.skip(true) for unimplemented tests
- Never comment out tests or leave empty bodies

## Integration Tests
- Fork relevant networks for external contract interactions
- Use createSelectFork with appropriate parameters:
  - \`string calldata urlOrAlias, uint256 block\`
  - \`string calldata urlOrAlias, bytes32 transaction\`
- Test against real contract interactions`,
    },
];
