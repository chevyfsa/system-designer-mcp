---
type: "agent_requested"
description: "Fundamental principles including memory-first approach, MCP tool prioritization, evidence-based reasoning, and parallel thinking"
---

# CORE_PRINCIPLES.md

## Memory-First Approach

**ALWAYS** check existing memories before starting any task:

- Use `list_memories()` to see what context is available
- Use `read_memory()` to load relevant project context
- Use `write_memory()` to save important insights and decisions
- Check for existing solutions before creating new code

**NEVER** assume you understand the project without checking memories first

## MCP Tool Prioritization

**USE** the most powerful tool for each task type:

- **Symbol Operations**: Use Serena MCP for semantic code understanding, symbol renames, dependency tracking
- **Documentation**: Use Context7 MCP for official library docs and framework patterns
- **UI Components**: Use Magic MCP for modern React/Vue/Angular component generation
- **Analysis**: Use Sequential MCP for complex reasoning and multi-step problem solving
- **Browser Testing**: Use Playwright MCP for E2E testing and accessibility validation
- **Pattern Edits**: Use Morphllm MCP for bulk code transformations and style enforcement

**PREFER** MCP tools over native tools unless specifically requested otherwise

## Time-Aware Information Gathering

**VERIFY** current date and context before making temporal assessments:

- Check `<env>` context for "Today's date" before ANY date/time references
- Never default to knowledge cutoff dates or assumptions about "latest" versions
- When discussing "latest" versions, always verify against current date
- Use explicit time references: "As of 2025-09-29, the current version is..."

**ALWAYS** state the source of date/time information in responses

## Evidence-Based Reasoning

**BASE** all claims on verifiable evidence:

- Support technical claims with testing results, metrics, or official documentation
- Never make assumptions about performance without measurements
- Validate information against multiple sources when possible
- Use `think_about_collected_information()` to verify evidence sufficiency

**NEVER** make claims that cannot be verified through testing or documentation

## Parallel Thinking

**MAXIMIZE** efficiency through intelligent coordination:

- Execute independent operations in parallel whenever possible
- Batch Read calls, group similar operations, use MultiEdit for multiple file changes
- Use Task agents for complex multi-step operations (>3 steps)
- Plan for optimal MCP server combinations and batch operations

**ALWAYS** consider parallelization opportunities during planning phase

## Task-First Approach

**FOLLOW** the systematic task pattern:

1. **Understand**: Research requirements and existing codebase
2. **Plan**: Create TodoWrite for >3 step tasks, identify parallel operations
3. **Execute**: Implement with proper tool selection and validation
4. **Validate**: Test, lint, and verify before marking complete

**NEVER** jump directly to implementation without proper planning

## Context Awareness

**MAINTAIN** project understanding across sessions:

- Use `/sc:load` to resume previous work sessions
- Use `/sc:save` to checkpoint work before ending sessions
- Maintain ≥90% context retention across operations
- Use `think_about_task_adherence()` to verify you're on track

**ALWAYS** preserve and build upon existing context rather than starting fresh
