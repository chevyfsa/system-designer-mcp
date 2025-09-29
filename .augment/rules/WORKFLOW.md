---
type: "always_apply"
description: "Systematic development workflow including design-build-test process, reuse principles, testing requirements, and quality gates"
---

# WORKFLOW.md

## Design-Build-Test Process

**FOLLOW** the systematic task pattern for all operations:

1. **Understand**: Research requirements, explore existing codebase, gather context
2. **Plan**: Create TodoWrite for >3 step tasks, identify parallel operations, estimate resources
3. **Execute**: Implement with proper tool selection, validation gates, and progress tracking
4. **Validate**: Test, lint, verify quality, and document before marking complete

**NEVER** skip the planning phase for complex tasks:

- Always use TodoWrite for operations with >3 steps
- Identify dependencies and parallelization opportunities during planning
- Consider resource constraints and choose appropriate tools
- Set clear success criteria before starting implementation

**VALIDATE** completion systematically:

- Use `think_about_whether_you_are_done()` before marking tasks complete
- Ensure all quality gates pass (lint, typecheck, tests)
- Verify that the solution meets the original requirements
- Clean up temporary files and document the solution

## Reuse-First Principles

**ALWAYS** check for existing solutions before creating new code:

- Search the codebase thoroughly for similar functionality
- Check existing libraries and dependencies before implementing features
- Leverage existing patterns and conventions rather than creating new ones
- Modify and extend existing solutions when possible

**PREFER** modification over creation:

- Edit existing files rather than creating new ones when appropriate
- Follow established project structure and naming conventions
- Use existing utility functions and helper modules
- Maintain consistency with the current codebase architecture

**RESPECT** existing patterns and conventions:

- Study the codebase to understand established patterns
- Follow the same coding style and architectural decisions
- Use the same testing frameworks and approaches
- Maintain consistency with existing error handling patterns

## Testing Requirements

**WRITE** tests before or alongside implementation:

- Create comprehensive test suites for all new functionality
- Achieve 95%+ test coverage for critical components
- Write tests that cover edge cases and error conditions
- Use the same testing framework as the existing codebase

**NEVER** skip tests or validation steps:

- Treat test failures as blocking issues that must be resolved
- Never comment out or disable tests to make builds pass
- Run the full test suite before marking work complete
- Ensure all tests pass in both isolation and integration scenarios

**MAINTAIN** test quality and reliability:

- Write clear, descriptive test names and documentation
- Use appropriate test fixtures and mock data
- Test both positive and negative scenarios
- Ensure tests are independent and can run in any order

## Task Management

**USE** TodoWrite systematically for complex operations:

- Create TodoWrite for any task with >3 steps or multiple dependencies
- Break down large tasks into manageable, actionable items
- Track progress by marking items as in_progress and completed
- Update TodoWrite status in real-time as work progresses

**ORGANIZE** tasks hierarchically:

- Structure tasks as Plan → Phase → Task → Todo
- Use clear, descriptive names for each task level
- Include both content and activeForm for each task item
- Maintain logical dependencies between tasks

**COORDINATE** parallel operations effectively:

- Identify independent operations that can run concurrently
- Execute parallel Read calls, batch similar operations
- Use MultiEdit for multiple file changes instead of sequential Edits
- Leverage Task agents for complex multi-step operations

## Quality Gates

**IMPLEMENT** systematic quality validation:

- Run lint checks and fix all errors before completion
- Execute type checking and resolve all type errors
- Run the full test suite and ensure all tests pass
- Verify code follows project standards and conventions

**VALIDATE** MCP tool outputs:

- Check MCP server responses for errors and validity
- Verify that generated code meets quality standards
- Test MCP-generated components thoroughly
- Fall back to manual implementation if MCP tools fail

**DOCUMENT** solutions comprehensively:

- Add clear comments for complex logic and algorithms
- Maintain JSDoc documentation for public APIs
- Create or update README files for new features
- Document architectural decisions and their rationale

## Continuous Improvement

**REVIEW** and refine workflows regularly:

- Analyze completed tasks to identify improvement opportunities
- Learn from errors and failures to prevent recurrence
- Optimize tool selection and usage patterns based on experience
- Share insights and best practices with the team

**ADAPT** to project-specific requirements:

- Adjust workflows based on project complexity and team preferences
- Customize quality gates based on project standards
- Tailor tool selection to the specific technology stack
- Evolve workflows as the project grows and changes
