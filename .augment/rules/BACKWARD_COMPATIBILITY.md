---
type: 'agent_requested'
description: 'Guidelines prohibiting backward compatibility code to prevent dead code accumulation and unintended bloat in the system'
---

# BACKWARD_COMPATIBILITY.md

## No Backward Compatibility Code

**NEVER** create backward compatibility code or maintain legacy interfaces:

- **No Legacy Support**: Do not create compatibility layers, adapters, or shims for old versions
- **No Version Parity**: Do not maintain multiple versions of the same functionality
- **No Deprecation Periods**: Do not keep deprecated code around for "transition periods"
- **No Feature Flags**: Do not use feature flags to toggle between old and new implementations

## Dead Code Prevention

**ELIMINATE** dead code aggressively and systematically:

- **Remove Unused Code**: Delete unused functions, classes, variables, and imports immediately
- **Clean Up After Refactoring**: Remove old code after implementing new solutions
- **No "Just in Case" Code**: Never leave code commented out or disabled "for future use"
- **No Conditional Compilation**: Avoid `#ifdef` or conditional compilation for compatibility

## Code Bloat Prevention

**MAINTAIN** lean, focused codebases without unnecessary complexity:

- **Single Source of Truth**: Each piece of functionality should exist in one place only
- **No Duplication**: Never duplicate logic to "maintain compatibility"
- **No Wrapper Functions**: Avoid creating wrapper functions just to preserve old interfaces
- **No Abstraction for Abstraction's Sake**: Don't add layers to hide breaking changes

## Breaking Changes Management

**EMBRACE** necessary breaking changes as improvements:

- **Semantic Versioning**: Use proper version increments to signal breaking changes
- **Clear Migration Paths**: Provide migration guides when making intentional breaking changes
- **Communication**: Document breaking changes clearly and prominently
- **Justification**: Ensure breaking changes have clear technical benefits

## Migration Over Compatibility

**PREFER** migration assistance over compatibility code:

- **Migration Tools**: Provide scripts or tools to help users migrate
- **Documentation**: Create comprehensive migration guides
- **Deprecation Warnings**: Use warnings to guide users to new approaches
- **Gradual Migration**: Support incremental migration without maintaining old code

## Code Quality Impact

**UNDERSTAND** the negative impact of backward compatibility:

- **Increased Complexity**: Compatibility code adds unnecessary complexity
- **Maintenance Burden**: Legacy code requires ongoing maintenance
- **Testing Overhead**: More code paths mean more testing requirements
- **Cognitive Load**: Developers must understand both old and new approaches
- **Innovation Hindered**: Legacy compatibility constrains improvements

## Exception Criteria

**RARELY** make exceptions for backward compatibility:

- **Critical Infrastructure**: Only for truly critical system infrastructure
- **Security Patches**: When security requires maintaining old interfaces temporarily
- **Contractual Obligations**: Only when legally or contractually required
- **Explicit User Request**: When specifically requested and justified

## Enforcement

**ENFORCE** these rules systematically:

- **Code Reviews**: Reject patches that add unnecessary compatibility code
- **Static Analysis**: Use tools to detect dead code and duplication
- **Regular Cleanup**: Schedule regular cleanup sessions to remove unused code
- **Technical Debt Tracking**: Track compatibility code as technical debt with removal plans

## Benefits

**ACHIEVE** better software through strict no-compatibility policies:

- **Cleaner Codebase**: Reduced complexity and easier maintenance
- **Faster Development**: Less time spent on legacy compatibility
- **Better Performance**: Reduced code size and complexity
- **Improved Innovation**: Freedom to improve without legacy constraints
- **Lower Costs**: Reduced maintenance and testing overhead
