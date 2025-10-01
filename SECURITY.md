# Security Policy

We take the security of this project seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

## Supported Versions

This repository is a self-hosted MCP server intended for local stdio usage or user-owned Cloudflare Workers deployments. There is no shared, centrally hosted production instance.

## Reporting a Vulnerability

- Email: security@example.com (or open a private security advisory on GitHub)
- Please include:
  - A description of the issue
  - Steps to reproduce
  - Potential impact
  - Any suggested remediation
- We aim to respond within 7 days.

## Scope & Design Notes

- Authentication: Not required by design (users deploy this server to their own environment). If you need authentication, consider adding a simple header check in your fork and documenting it in `wrangler.toml`.
- Data handling: The server does not persist user data; it returns JSON responses and, in local mode, may write files when you request it.
- Secrets: No secrets are required by default. Do not commit secrets to the repo.

## Disclosure

We follow responsible disclosure. Please do not open public issues for security reports. After a fix is released, we will credit reporters accordingly.

