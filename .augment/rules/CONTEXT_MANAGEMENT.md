---
type: "always_apply"
description: "Best practices for MCP tool prioritization, memory integration, context optimization, and resource awareness"
---

# CONTEXT_MANAGEMENT.md

## Context Optimization

**PRIORITIZE** MCP tools over native tools for efficiency:

- Use Serena MCP for semantic code understanding and project-wide analysis
- Use Context7 MCP for official documentation and framework patterns
- Use Magic MCP for UI component generation and design system patterns
- Use Sequential MCP for complex multi-step reasoning and analysis
- Use Playwright MCP for real browser testing and accessibility validation

**CHOOSE** the most powerful tool for each task:

- UI Components → Magic MCP (not manual HTML/CSS)
- Code Analysis → Sequential MCP (not native reasoning)
- Symbol Operations → Serena MCP (not manual search)
- Documentation → Context7 MCP (not web search)
- Browser Testing → Playwright MCP (not unit tests)

**USE** symbol-enhanced communication for token efficiency:

- Apply appropriate symbols for logic flow, status, and technical domains
- Use abbreviation systems for common technical terms
- Maintain 30-50% token reduction while preserving ≥95% information quality

## Memory Integration

**MAINTAIN** session context consistently:

- Use `/sc:load` at the beginning of each work session to resume context
- Use `/sc:save` at the end of sessions or before important checkpoints
- Use `list_memories()` to see what context is available
- Use `read_memory()` to load relevant project information

**CHECKPOINT** work periodically:

- Create memory checkpoints every 30 minutes during long sessions
- Use `write_memory()` to save important decisions and insights
- Document current task status and next steps in memories
- Clean up temporary memories when no longer needed

**ORGANIZE** memories effectively:

- Use descriptive memory names that clearly indicate content
- Structure memories hierarchically (plan → phase → task → todo)
- Maintain session lifecycle: load → work → checkpoint → save
- Delete completed temporary memories to keep memory space clean

## MCP Verification

**VALIDATE** MCP server responses before proceeding:

- Check for errors, timeouts, or unexpected responses from MCP servers
- Verify that MCP tool outputs match expected formats and schemas
- Fall back to native tools if MCP servers fail or return invalid results
- Report MCP server issues to help improve system reliability

**MONITOR** MCP server performance:

- Track response times and success rates for different MCP servers
- Adapt approach based on MCP server availability and performance
- Use alternative tools when primary MCP servers are unavailable
- Provide feedback on MCP server quality and reliability

**INTEGRATE** multiple MCP servers effectively:

- Coordinate between Serena (semantic understanding) and other MCP tools
- Use Context7 to provide documentation patterns for Magic component generation
- Combine Sequential analysis with Morphllm pattern-based edits
- Leverage Playwright testing results to improve Magic component quality

## Resource Awareness

**ADAPT** approach based on system constraints:

- **Green Zone (0-75%)**: Full capabilities available, normal verbosity
- **Yellow Zone (75-85%)**: Activate efficiency mode, reduce verbosity
- **Red Zone (85%+)**: Essential operations only, minimal output, fail fast

**MONITOR** resource usage continuously:

- Track context usage and token consumption during operations
- Adjust approach based on available resources and performance constraints
- Use compression and abbreviation techniques when resources are limited
- Prioritize critical operations when under resource pressure

**OPTIMIZE** for performance and efficiency:

- Use parallel operations to reduce overall execution time
- Batch similar operations to minimize overhead
- Choose the most efficient tool for each specific task
- Balance between thoroughness and performance based on context

## Context Retention

**MAINTAIN** ≥90% understanding across operations:

- Use `think_about_collected_information()` to verify context sufficiency
- Regularly check that you understand the current task and project state
- Preserve important context across sessions through memory management
- Rebuild context efficiently when starting new sessions

**BUILD** upon existing context:

- Always check for existing solutions before creating new code
- Leverage previous decisions and insights in current work
- Maintain consistency with established patterns and conventions
- Extend and improve existing solutions rather than starting from scratch

**SYNCHRONIZE** context across tools:

- Ensure memories reflect the current state of the work
- Keep TodoWrite status synchronized with actual progress
- Coordinate between MCP tools to maintain consistent understanding
- Verify that all tools have access to necessary context information
