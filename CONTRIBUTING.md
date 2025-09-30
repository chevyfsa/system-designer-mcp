# Contributing to System Designer MCP Server

Thank you for your interest in contributing to the System Designer MCP Server! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors. Please be professional, constructive, and kind in all interactions.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/) JavaScript runtime (v1.0.0 or higher)
- Git for version control
- A code editor (VS Code recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/system-designer-mcp.git
cd system-designer-mcp
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/chevyfsa/system-designer-mcp.git
```

## Development Setup

### Install Dependencies

```bash
# Install all dependencies
bun install
```

### Build the Project

```bash
# Build for production
bun run build

# Build and watch for changes (development)
bun run dev
```

### Run Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test test/integration/end-to-end.test.ts
```

### Code Quality Checks

```bash
# Run linter
bun run lint

# Fix linting errors automatically
bun run lint:fix

# Format code with Prettier
bun run format

# Check formatting without changes
bun run format:check
```

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates

### 2. Make Your Changes

- Write clean, readable code following our style guidelines
- Add tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes

Before submitting, ensure:

```bash
# All tests pass
bun test

# Code is properly formatted
bun run format

# No linting errors
bun run lint

# Build succeeds
bun run build
```

### 4. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add support for custom System Runtime types"
```

Commit message format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test additions or updates
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

### 5. Keep Your Branch Updated

Regularly sync with the upstream repository:

```bash
git fetch upstream
git rebase upstream/main
```

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Provide explicit types for function parameters and return values
- Avoid `any` types - use `unknown` or proper types
- Use interfaces for object shapes
- Use type aliases for unions and complex types

### Code Organization

- Follow the existing modular structure:
  - `src/types.ts` - Type definitions
  - `src/schemas.ts` - Zod validation schemas
  - `src/tools.ts` - MCP tool registration
  - `src/transformers/` - Transformation logic
  - `src/validators/` - Validation logic
- Keep files focused and under 500 lines when possible
- Use clear, descriptive names for functions and variables

### Formatting

- Use Prettier for code formatting (configured in the project)
- 100-character line width
- Single quotes for strings
- Semicolons required
- Trailing commas (ES5 style)

### Documentation

- Add JSDoc comments for public APIs
- Include examples in documentation
- Update README.md for user-facing changes
- Update API-REFERENCE.md for tool changes

## Testing Requirements

### Test Coverage

- Aim for 95%+ test coverage for new code
- Write unit tests for individual functions
- Write integration tests for complete workflows
- Write end-to-end tests for user scenarios

### Test Structure

```typescript
import { describe, expect, test } from 'bun:test';

describe('Feature Name', () => {
  test('should do something specific', () => {
    // Arrange
    const input = {
      /* test data */
    };

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.property).toBe(expectedValue);
  });
});
```

### Test Files

- Place tests in `test/` directory
- Mirror source structure: `src/transformers/foo.ts` → `test/transformers/foo.test.ts`
- Use descriptive test names that explain the behavior being tested

## Submitting Changes

### Pull Request Process

1. **Push your branch** to your fork:

```bash
git push origin feature/your-feature-name
```

2. **Create a Pull Request** on GitHub:
   - Go to https://github.com/chevyfsa/system-designer-mcp
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template

3. **PR Title and Description**:
   - Use a clear, descriptive title
   - Explain what changes you made and why
   - Reference any related issues (e.g., "Fixes #123")
   - Include screenshots for UI changes

4. **Wait for Review**:
   - Maintainers will review your PR
   - Address any feedback or requested changes
   - Keep the PR updated with the main branch

### PR Checklist

Before submitting, ensure:

- [ ] All tests pass (`bun test`)
- [ ] Code is formatted (`bun run format`)
- [ ] No linting errors (`bun run lint`)
- [ ] Build succeeds (`bun run build`)
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive
- [ ] Branch is up to date with main

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (Bun version, OS, etc.)
- Error messages or logs
- Minimal code example if applicable

### Feature Requests

When requesting features, please include:

- Clear description of the feature
- Use case and motivation
- Proposed implementation (if you have ideas)
- Any alternatives you've considered

### Issue Templates

Use the GitHub issue templates when available. This helps ensure all necessary information is provided.

## Questions?

If you have questions about contributing:

- Check existing issues and discussions
- Review the documentation in `docs/`
- Open a new issue with the "question" label

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to System Designer MCP Server! 🎉
