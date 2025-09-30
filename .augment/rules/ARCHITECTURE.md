---
type: 'agent_requested'
description: 'Guidelines for system architecture, API design, dependency injection, performance optimization, and security architecture patterns'
---

# ARCHITECTURE.md

## Separation of Concerns

**MAINTAIN** clear boundaries between architectural layers:

- **Presentation Layer**: UI components, views, and user interfaces
- **Business Logic Layer**: Core business rules and application logic
- **Data Access Layer**: Database operations, API calls, and data persistence
- **Infrastructure Layer**: External services, configuration, and utilities

**ORGANIZE** code by feature/domain, not by technical concerns:

- Structure code around business capabilities and user stories
- Group related components, services, and data access together
- Avoid technical layering that doesn't reflect business domains
- Use bounded contexts for complex business domains

**IMPLEMENT** proper dependency direction:

- Higher-level modules should not depend on lower-level modules
- Dependencies should point inward, toward the core business logic
- Use dependency inversion to manage cross-layer dependencies
- Avoid circular dependencies between modules and components

## API Design Patterns

**FOLLOW** RESTful API design principles:

- Use HTTP methods appropriately (GET, POST, PUT, DELETE)
- Design resource-oriented URLs with hierarchical structure
- Implement proper status codes for different response types
- Use consistent response formats and error handling

**IMPLEMENT** consistent error handling:

- Use standard HTTP status codes for different error types
- Provide detailed error messages in response bodies
- Include error codes and relevant contextual information
- Implement proper logging for debugging and monitoring

**DESIGN** for API evolution and versioning:

- Use semantic versioning for API changes
- Implement backward compatibility for breaking changes
- Provide clear deprecation timelines and migration paths
- Use API documentation tools like OpenAPI/Swagger

**SECURE** APIs properly:

- Implement proper authentication and authorization
- Use rate limiting and throttling to prevent abuse
- Validate and sanitize all input data
- Implement proper CORS policies and security headers

## Dependency Injection

**USE** dependency injection patterns effectively:

- Inject dependencies through constructors or properties
- Use dependency injection containers for complex applications
- Avoid direct instantiation of dependencies within components
- Prefer interface-based programming for loose coupling

**MANAGE** dependency lifecycle properly:

- Use appropriate scope for dependencies (singleton, transient, scoped)
- Implement proper disposal and cleanup of resources
- Avoid memory leaks from improper dependency management
- Use factory patterns for complex object creation

**DESIGN** for testability:

- Make dependencies injectable to enable unit testing
- Use mock objects and test doubles for external dependencies
- Implement proper isolation between test and production dependencies
- Design components to be easily testable in isolation

**AVOID** service locator anti-pattern:

- Don't use global service locators for dependency resolution
- Prefer explicit dependency injection over implicit resolution
- Make dependencies clearly visible in component interfaces
- Avoid hidden dependencies that make code hard to understand and test

## Performance Considerations

**IMPLEMENT** lazy loading strategies:

- Load components and resources only when needed
- Use code splitting for large applications
- Implement lazy loading for images and other assets
- Consider dynamic imports for non-critical functionality

**USE** caching effectively:

- Implement appropriate caching strategies for frequently accessed data
- Use memory caching with proper expiration policies
- Consider distributed caching for scalable applications
- Implement cache invalidation strategies for data consistency

**OPTIMIZE** database operations:

- Use efficient queries and proper indexing
- Implement connection pooling for database connections
- Consider read replicas for scaling read operations
- Use batch operations for bulk data processing

**MONITOR** and optimize performance:

- Implement performance monitoring and alerting
- Profile application performance regularly
- Identify and optimize performance bottlenecks
- Use appropriate data structures and algorithms

## Scalability Planning

**DESIGN** for horizontal scalability:

- Use stateless services where possible
- Implement proper session management
- Design for distributed deployment
- Use load balancing for high-traffic applications

**PLAN** for data growth:

- Design database schemas for scalability
- Implement proper data partitioning strategies
- Consider NoSQL solutions for unstructured data
- Plan for data archiving and retention policies

**IMPLEMENT** proper error handling and resilience:

- Use circuit breakers for external service calls
- Implement retry policies with exponential backoff
- Design for graceful degradation under load
- Implement proper logging and monitoring

**CONSIDER** deployment strategies:

- Use containerization for consistent deployment
- Implement CI/CD pipelines for automated deployment
- Design for blue-green or canary deployment strategies
- Plan for rollback capabilities for quick recovery

## Security Architecture

**IMPLEMENT** defense-in-depth security:

- Use multiple layers of security controls
- Implement proper authentication and authorization
- Use encryption for sensitive data at rest and in transit
- Implement proper logging and monitoring for security events

**DESIGN** for secure development:

- Follow secure coding practices and guidelines
- Implement proper input validation and sanitization
- Use secure communication protocols and configurations
- Regularly update dependencies to patch security vulnerabilities

**PLAN** for incident response:

- Implement proper logging and monitoring for security events
- Design for quick detection and response to security incidents
- Have backup and recovery procedures in place
- Regularly test security controls and incident response procedures

**CONSIDER** compliance requirements:

- Understand and implement relevant compliance requirements
- Implement proper data handling and privacy controls
- Maintain proper documentation for compliance audits
- Regularly review and update security controls
