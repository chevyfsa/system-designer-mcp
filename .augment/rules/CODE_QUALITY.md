---
type: "agent_requested"
description: "Standards for language best practices, code style, documentation, maintainability, performance, and security considerations"
---

# CODE_QUALITY.md

## Language Best Practices

**FOLLOW** framework-specific patterns and conventions:

- React: Use hooks, functional components, and proper state management
- Node.js: Use async/await, proper error handling, and middleware patterns
- TypeScript: Enable strict mode, use proper typing, avoid `any` type
- Python: Follow PEP 8, use type hints, prefer context managers

**USE** TypeScript strict mode effectively:

- Enable all strict compiler options for maximum type safety
- Define interfaces for all complex data structures
- Use generics appropriately for reusable components
- Avoid type assertions unless absolutely necessary

**PREFER** composition over inheritance:

- Build complex functionality from smaller, focused components
- Use dependency injection for loose coupling
- Implement composition patterns like decorators and mixins
- Favor functional programming approaches where appropriate

## Code Style Standards

**MAINTAIN** consistent ESLint and Prettier compliance:

- Configure ESLint with framework-specific rules and best practices
- Use Prettier for consistent formatting across the codebase
- Set appropriate line length (typically 80-100 characters)
- Enable consistent indentation, quotes, and trailing commas

**FOLLOW** consistent naming conventions:

- Use camelCase for variables and functions in JavaScript/TypeScript
- Use PascalCase for classes, interfaces, and components
- Use SCREAMING_SNAKE_CASE for constants and environment variables
- Use kebab-case for file names and CSS classes

**IMPLEMENT** proper error handling:

- Use try-catch blocks for all potentially failing operations
- Provide meaningful error messages with context
- Handle both synchronous and asynchronous errors appropriately
- Implement proper error logging and monitoring

**WRITE** clean, readable code:

- Keep functions small and focused on single responsibilities
- Use descriptive variable and function names
- Add appropriate comments for complex logic
- Avoid deeply nested code structures

## Documentation Requirements

**MAINTAIN** comprehensive JSDoc documentation:

- Document all public APIs with clear descriptions
- Include parameter types, return types, and examples
- Document edge cases and error conditions
- Keep documentation synchronized with code changes

**ADD** clear comments for complex logic:

- Explain non-obvious algorithms and business logic
- Document the "why" behind important decisions
- Include TODO comments for future improvements with context
- Reference relevant issues or documentation when helpful

**CREATE** and update README files:

- Document project setup and installation instructions
- Provide clear usage examples and API references
- Include troubleshooting guides and common issues
- Maintain contribution guidelines and development workflows

**ORGANIZE** documentation effectively:

- Use clear, hierarchical structure for documentation
- Include code examples that demonstrate real usage
- Keep documentation up-to-date with code changes
- Use consistent formatting and style across all docs

## Maintainability Guidelines

**APPLY** Single Responsibility Principle:

- Each function, class, and module should have one clear purpose
- Break down large components into smaller, focused units
- Avoid creating god classes or monolithic functions
- Keep coupling between components loose and minimal

**FOLLOW** DRY (Don't Repeat Yourself) principles:

- Extract common functionality into reusable utilities
- Use shared configuration and constants
- Implement inheritance or composition for shared behavior
- Avoid duplicating code across the codebase

**MANAGE** dependencies effectively:

- Keep dependencies minimal and well-maintained
- Use semantic versioning for dependency updates
- Regularly update dependencies to patch security vulnerabilities
- Document the purpose and usage of each significant dependency

**IMPLEMENT** proper logging and monitoring:

- Add appropriate logging for debugging and monitoring
- Use structured logging with consistent formats
- Include relevant context in log messages
- Implement proper log levels (debug, info, warn, error)

## Performance Considerations

**OPTIMIZE** for performance and efficiency:

- Choose appropriate algorithms and data structures
- Implement lazy loading and caching where beneficial
- Avoid unnecessary computations and data transformations
- Use efficient database queries and API calls

**MONITOR** performance metrics:

- Implement performance monitoring for critical paths
- Profile code to identify performance bottlenecks
- Set up alerts for performance degradation
- Regularly review and optimize slow operations

**CONSIDER** memory usage and leaks:

- Properly manage memory allocation and deallocation
- Avoid memory leaks in long-running applications
- Use appropriate data structures to minimize memory overhead
- Implement proper cleanup for resources and connections

## Security Best Practices

**IMPLEMENT** proper security measures:

- Validate all user inputs and sanitize data
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization
- Keep dependencies updated to patch security vulnerabilities

**FOLLOW** secure coding practices:

- Never expose sensitive information in logs or error messages
- Use secure communication protocols (HTTPS, TLS)
- Implement proper session management and CSRF protection
- Store sensitive data securely (encrypted, hashed)

**CONDUCT** regular security reviews:

- Review code for security vulnerabilities regularly
- Use automated security scanning tools
- Stay informed about security best practices and threats
- Implement security testing in the development workflow
