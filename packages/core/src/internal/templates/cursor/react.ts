import type { CursorRule } from "../../interfaces/index.js";

export const reactRules: CursorRule[] = [
    {
        name: "react-components",
        description: "React component development guidelines",
        globs: "**/*.tsx",
        content: `# React Component Guidelines

## Component Structure
- Abstract complex logic from render functions
- Keep render methods simple and declarative
- Split complex components into smaller ones
- Use hooks for side effects and state management

## Import Order
1. React imports
2. Third-party libraries
3. Internal files

## Best Practices
- Use logical AND (\`&&\`) over ternary conditionals for clarity
- Keep components focused and reusable
- Follow React hooks best practices
- Avoid inline styles`,
    },
    {
        name: "react-performance",
        description: "React performance optimization guidelines",
        globs: "**/*.tsx",
        content: `# React Performance Guidelines

## Optimization
- Implement proper memoization (useMemo, useCallback)
- Optimize re-renders
- Lazy load components when appropriate
- Optimize images to be under 250kB

## State Management
- Use appropriate state management solutions
- Avoid unnecessary state
- Keep state as local as possible
- Use context API appropriately`,
    },
    {
        name: "react-styling",
        description: "React styling guidelines",
        globs: "**/*.tsx",
        content: `# React Styling Guidelines

## Style Organization
- Use CSS-in-JS or external stylesheets
- Follow team styling conventions
- Maintain consistent spacing and formatting
- Use design system tokens when available

## Best Practices
- Implement responsive design patterns
- Use CSS modules or styled-components
- Follow BEM or similar naming conventions
- Keep styles modular and reusable`,
    },
];
