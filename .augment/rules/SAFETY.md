---
type: "agent_requested"
description: "Safety protocols for file system operations, git workflows, secrets management, validation gates, and error handling"
---

# SAFETY.md

## File System Safety

**USE** absolute paths only for all file operations:

- Always provide full file paths to Read, Write, and Edit tools
- Never use relative paths or assume current working directory
- Verify file existence with absolute paths before operations

**READ** before writing or editing:

- Always use Read tool to examine existing files before making changes
- Understand existing patterns and conventions before modifying code
- Never create new files when editing existing ones will suffice

**NEVER** auto-commit changes:

- Use git status and git diff to review changes before staging
- Never commit without explicit user approval
- Create restore points before risky operations

## Git Workflow Restrictions

**ALWAYS** work on feature branches:

- Create feature branches for ALL work, never work on main/master
- Use `git checkout -b feature-name` before starting any work
- Verify current branch with `git branch` before making changes

**INCREMENTAL** commits only:

- Commit frequently with meaningful messages
- Never create giant commits with multiple unrelated changes
- Use descriptive commit messages that explain the "why" not just the "what"

**VERIFY** before committing:

- Always run `git diff` to review changes before staging
- Ensure tests pass and lint checks complete before committing
- Create commits before risky operations for easy rollback

## Secrets Management

**NEVER** handle sensitive information without explicit approval:

- Do not process, store, or transmit API keys, tokens, or credentials
- Never commit secrets to version control
- Use environment variables or secure secret management only

**VALIDATE** files for secrets before operations:

- Check for potential secrets in files before processing
- Never suggest storing secrets in code or configuration files
- Recommend proper secret management practices

## Checkpoint Requirements

**CREATE** git commits before potentially destructive operations:

- Commit before refactoring, large-scale changes, or risky operations
- Use commits as restore points for easy rollback
- Tag important checkpoints with descriptive messages

**MAINTAIN** clean working directory:

- Never leave uncommitted changes that could be accidentally lost
- Clean up temporary files and artifacts regularly
- Use git stash for incomplete work that needs to be paused

## Validation Gates

**RUN** quality checks before marking tasks complete:

- Execute lint checks and fix any errors before completion
- Run type checking and resolve all type errors
- Execute tests and ensure all pass before considering work done

**NEVER** skip tests or validation:

- Never comment out or disable tests to make builds pass
- Never bypass quality checks for speed or convenience
- Treat test failures as blocking issues that must be resolved

**VALIDATE** MCP server responses:

- Verify MCP tool outputs before proceeding with operations
- Check for errors or unexpected responses from MCP servers
- Fall back to native tools if MCP servers fail or return invalid results

## Error Handling

**INVESTIGATE** failures thoroughly:

- Always perform root cause analysis for errors and test failures
- Never ignore or suppress errors without understanding their cause
- Use systematic debugging to identify and fix underlying issues

**DOCUMENT** known issues and limitations:

- Record any discovered bugs or limitations in the codebase
- Communicate potential risks or issues to users
- Provide clear error messages and guidance for troubleshooting
