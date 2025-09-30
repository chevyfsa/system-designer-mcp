---
type: 'always_apply'
description: 'Forbidden actions including package management restrictions, git workflow rules, security constraints, and code quality requirements'
---

# PROHIBITED_ACTIONS.md

## Package and Dependency Management

**NEVER** modify package.json without explicit user approval:

- Do not add, remove, or update dependencies without permission
- Never change version ranges or dependency configurations
- Do not modify scripts, engines, or other package metadata
- Always seek approval before any package.json changes

**NEVER** delete node_modules or build directories without explicit permission:

- Do not remove node_modules/, dist/, build/, or .next/ directories
- Never clear build artifacts or caches without user confirmation
- Do not run clean commands that delete generated files
- Always ask before performing destructive file system operations

**NEVER** install or update packages without user direction:

- Do not run npm install, yarn, bun install, or similar commands
- Never update packages to latest versions without approval
- Do not add development dependencies without explicit request
- Always follow user instructions for package management

## Git and Version Control

**NEVER** work directly on main/master branch:

- Always create feature branches for any work
- Never commit directly to main/master without explicit approval
- Do not push changes to main/master without proper review
- Always use git checkout -b for new work

**NEVER** force push or rewrite history without explicit approval:

- Do not use git push --force or git rebase without permission
- Never rewrite commit history or amend public commits
- Do not perform destructive git operations without confirmation
- Always preserve git history integrity

**NEVER** commit without proper review and validation:

- Do not commit code that fails tests or lint checks
- Never commit sensitive information or credentials
- Do not commit generated files that should be in .gitignore
- Always ensure commits meet quality standards

## Security and Secrets

**NEVER** handle, store, or transmit sensitive information:

- Do not process API keys, tokens, passwords, or credentials
- Never commit secrets to version control or configuration files
- Do not suggest storing secrets in code or environment files
- Always use proper secret management practices

**NEVER** disable security features or validations:

- Do not disable CORS, CSRF protection, or other security measures
- Never bypass authentication or authorization checks
- Do not suggest insecure coding practices
- Always follow security best practices

**NEVER** access or modify files outside project scope:

- Do not read or write files outside the project directory
- Never access system files or user data without permission
- Do not perform file system operations outside the codebase
- Always respect file system boundaries and permissions

## Code Quality and Testing

**NEVER** skip tests or validation steps:

- Do not comment out or disable tests to make builds pass
- Never bypass lint checks or type validation
- Do not ignore test failures or error messages
- Always ensure all quality checks pass

**NEVER** generate incomplete placeholder code:

- Do not create TODO comments for core functionality
- Never generate mock objects or fake implementations
- Do not leave incomplete features or stub implementations
- Always deliver working, complete solutions

**NEVER** ignore existing patterns or conventions:

- Do not create new patterns when existing ones exist
- Never ignore project-specific conventions or standards
- Do not introduce inconsistent coding styles
- Always follow established project patterns

## MCP Server Usage

**NEVER** use MCP servers inappropriately:

- Do not use Magic MCP for non-UI tasks
- Never use Serena MCP for simple text replacements
- Do not use Context7 MCP when web search is more appropriate
- Always choose the right tool for each task

**NEVER** bypass MCP server validation:

- Do not ignore MCP server errors or validation failures
- Never proceed with invalid MCP server responses
- Do not use fallback tools without first trying appropriate MCP servers
- Always respect MCP server capabilities and limitations

## File Operations

**NEVER** create unnecessary files:

- Do not create duplicate files when existing ones suffice
- Never generate documentation files without explicit request
- Do not create temporary files without proper cleanup
- Always minimize file creation to essential needs

**NEVER** modify files without understanding their purpose:

- Do not edit files without first reading and understanding them
- Never change file permissions or ownership without permission
- Do not modify configuration files without proper context
- Always understand file purpose before making changes

**NEVER** use relative paths for file operations:

- Do not assume current working directory for file paths
- Never use relative paths in Read, Write, or Edit operations
- Do not guess file locations or use wildcards carelessly
- Always use absolute paths for file operations

## Communication and Documentation

**NEVER** use marketing language or unsubstantiated claims:

- Do not use terms like "blazingly fast," "100% secure," or "excellent"
- Never make claims without evidence or verification
- Do not use vague or promotional language
- Always use objective, professional communication

**NEVER** provide incomplete or misleading information:

- Do not omit important context or limitations
- Never provide information without proper verification
- Do not make assumptions without stating them clearly
- Always provide complete and accurate information

## User Interaction

**NEVER** proceed without proper understanding:

- Do not implement features without clear requirements
- Never make assumptions about user needs or preferences
- Do not proceed with ambiguous or unclear instructions
- Always seek clarification when requirements are unclear

**NEVER** ignore user preferences or constraints:

- Do not override user-specified requirements or constraints
- Never ignore user feedback or direction changes
- Do not make unilateral decisions about implementation approach
- Always respect user requirements and preferences
