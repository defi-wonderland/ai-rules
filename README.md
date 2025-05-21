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

Or, if testing the ai-rules repo locally

```bash
pnpm local:ai-rules
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

## How to Add New Rules

Adding new .cursor/rules is straightforward, even if you're not primarily a TypeScript developer. Rules generally involve defining some metadata and the rule content in Markdown.

Here's how you can contribute a new rule:

1.  **Understand Rule Structure**:

    -   Rules are defined as objects within arrays in [`packages/core/src/internal/templates/cursor/index.ts`](packages/core/src/internal/templates/cursor/index.ts).
    -   There are typically different arrays for different rule categories (e.g., `typescriptRules`, `solidityRules`, `reactRules`).
    -   Each rule object has properties like `name`, `description`, `globs` (file patterns it applies to), and `content` (the actual rule text in Markdown).

2.  **Locate the Correct Rule Set**:

    -   Open [`packages/core/src/internal/templates/cursor/index.ts`](packages/core/src/internal/templates/cursor/index.ts).
    -   Find the array corresponding to the category of your new rule (e.g., if it's a Solidity rule, look for `solidityRules`).

3.  **Add Your Rule Definition**:

    -   To the chosen array, add a new object for your rule. For example:

        ```typescript
        {
            name: "your-new-rule-name", // This becomes the .mdc filename (e.g., your-new-rule-name.mdc)
            description: "A brief description of what this rule checks or suggests.",
            globs: ["*.sol"], // File patterns this rule applies to (e.g., all Solidity files)
            content: `
        ### Your New Rule Title

        This is the actual content of your rule.
        You can use Markdown here to explain the rule, provide examples, etc.
        `,
        }
        ```

4.  **Content (`.mdc` file format)**:

    -   The `content` string is what will be written into a `.mdc` file (Markdown with frontmatter).
    -   The generator script automatically adds frontmatter like `description`, `globs`, and `version` based on your definition and the package version.

5.  **Generating the Rule File**:

    -   After adding your rule definition, you need to run the generation script. This script reads these definitions and creates/updates the actual `.mdc` rule files in the [`.cursor/rules/`](.cursor/rules/) directory of the project where `ai-rules` is used.
    -   To test this locally within the `ai-rules` repository itself or in a project using your development version of `ai-rules`:
        -   Build the `@defi-wonderland/ai-rules` package: `pnpm run build` (from the root or within [`packages/core`](packages/core)).
        -   Run the generator: `pnpm exec ai-rules` (from the root of a project where you want to generate the rules, or link your local `ai-rules` package and run `ai-rules`).
        -   This will create a new file like [`.cursor/rules/Solidity/your-new-rule-name.mdc`](.cursor/rules/Solidity/your-new-rule-name.mdc).

6.  **Testing (Optional but Recommended)**:

    -   If your rule involves changes to configuration schemas (e.g., adding new configurable options in `.coderabbit.yaml`), you might need to update schemas in [`packages/core/src/internal/schemas/config.ts`](packages/core/src/internal/schemas/config.ts) and add relevant tests in [`packages/core/test/`](packages/core/test/).
    -   For simple content-only rules, ensure the generated `.mdc` file looks correct.

7.  **Commit and Push**:
    -   Add the changes in [`packages/core/src/internal/templates/cursor/index.ts`](packages/core/src/internal/templates/cursor/index.ts) and any newly generated/updated rule files to your commit.

If you still need help, feel free to message the Offchain Team!

## Release Process

When preparing a new release of the package, the version number must be manually updated. This is because the current publishing workflow (`.github/workflows/publish.yml`) publishes the version as it exists in the `package.json` files.

To release a new version:

1.  **Determine the new version number**: Following [Semantic Versioning](https://semver.org/) (e.g., `vX.Y.Z`), decide on the new version based on the changes (patch, minor, or major).
2.  **Update `package.json`**: Manually edit [`packages/core/package.json`](packages/core/package.json) and update the `"version"` field to the new version number.
    ```json
    // packages/core/package.json
    {
        "name": "@defi-wonderland/ai-rules",
        "version": "NEW_VERSION_HERE" // e.g., "0.1.0"
        // ... rest of the file
    }
    ```
3.  **Create a GitHub Release**: Once the version update is on the main branch, go to the repository's GitHub page, navigate to "Releases", and draft a new release.
    -   Choose a tag for your release that matches the new version (e.g., `vNEW_VERSION_HERE`).
    -   Title your release (e.g., `vNEW_VERSION_HERE`).
    -   Describe the changes in the release.
    -   Publishing the release will trigger the `publish.yml` workflow, which builds and publishes the package with the new version to npm.

## Contributing

Wonderland is a team of top Web3 researchers, developers, and operators who believe that the future needs to be open-source, permissionless, and decentralized.

[DeFi sucks](https://defi.sucks), but Wonderland is here to make it better.

## License

The primary license for the boilerplate is MIT. See the [`LICENSE`](./LICENSE) file for details.
