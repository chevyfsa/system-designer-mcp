# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

The System Designer MCP Server team and community take security vulnerabilities seriously. We appreciate your efforts to responsibly disclose vulnerabilities.

### How to Report

**Please do not open a public issue for security vulnerabilities.**

To report a security vulnerability, please send an email to: **chevonmdphillip@gmail.com**

Your email should include:

- A clear description of the vulnerability
- Steps to reproduce the issue (if applicable)
- Potential impact of the vulnerability
- Any suggested mitigation (if known)

### What to Expect

- **Response Time**: We will acknowledge receipt of your vulnerability report within 48 hours.
- **Initial Assessment**: We will provide an initial assessment of the report within 7 business days.
- **Resolution**: We will work to address valid security vulnerabilities in a timely manner and aim to release patches in the next scheduled version or sooner if critical.

### Security Measures

The System Designer MCP Server implements several security measures:

#### Input Validation

- All MCP tool inputs are validated using Zod schemas
- Type safety prevents injection attacks
- Input sanitization for file operations

#### File System Access

- No arbitrary file system access
- Restricted to designated output directories
- Safe file path handling

#### Network Security

- No external network calls initiated by the server
- Optional CORS configuration for web deployments
- No authentication credentials stored in code

#### Runtime Isolation

- Stateless operation in Cloudflare Workers environment
- No persistent storage of user data
- Sandboxed execution environment

### Security Best Practices for Users

#### Development Environments

- Keep dependencies updated: `bun update`
- Use the latest version of the MCP server
- Review tool outputs before execution

#### Production Deployments

- Configure appropriate CORS policies
- Use environment variables for configuration
- Monitor deployment logs for unusual activity
- Consider rate limiting for public deployments

#### Integration Security

- Validate all inputs before passing to MCP tools
- Use secure communication channels for remote deployments
- Implement proper authentication in client applications

### Security Updates

Security updates will be announced through:

- GitHub Security Advisories
- Release notes with security implications clearly marked
- Critical updates may include additional notifications

### Security Research

We welcome responsible security research and value the security community's efforts to improve the safety of our project. If you discover a potential vulnerability, please follow our reporting process above.

### Threat Model

The System Designer MCP Server is designed with the following threat model in mind:

#### Primary Threats Addressed

1. **Input Injection**: Malicious inputs attempting to execute arbitrary code
2. **Path Traversal**: Attempts to access files outside designated directories
3. **Resource Exhaustion**: Denial of service through excessive resource consumption
4. **Data Exposure**: Unauthorized access to system or user data

#### Trust Boundaries

- **LLM to Server**: The LLM provides structured data, server validates all inputs
- **Server to File System**: Controlled access to designated directories only
- **Server to Network**: No outbound network connections initiated by server
- **Client to Server**: Secure MCP protocol communication

### Third-Party Dependencies

We regularly review and update third-party dependencies to address known vulnerabilities. The project uses:

- **@modelcontextprotocol/sdk**: MCP protocol implementation
- **zod**: Schema validation and type safety
- **fs-extra**: Safe file system operations
- **commander**: Command-line interface parsing

All dependencies are regularly audited using automated tools and manual review.

### Security Questions

For security-related questions that are not vulnerability reports, please:

- Check existing issues and documentation
- Open a regular GitHub issue with the "security" label
- Contact us at chevonmdphillip@gmail.com for sensitive questions

---

Thank you for helping keep the System Designer MCP Server and its users safe!
