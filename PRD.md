# System Designer MCP Server - Product Requirements Document

## 1. Overview

### 1.1 Project Name

System Designer MCP Server

### 1.2 Document Purpose

This PRD outlines the requirements, features, and technical specifications for building a Model Context Protocol (MCP) server that integrates with System Designer to enable AI-assisted system design and UML diagram generation.

### 1.3 Problem Statement

System designers and developers need efficient ways to:

- Convert natural language descriptions into structured system models
- Generate UML diagrams from system models
- Validate system designs for consistency and correctness
- Export models to various formats for implementation

Current solutions require manual diagram creation and model definition, which is time-consuming and error-prone.

### 1.4 Solution Overview

We're building an MCP server that provides AI agents with tools to:

- Create MSON (Metamodel JavaScript Object Notation) models from natural language
- Generate UML diagrams (Class, Sequence, Activity, Component) from MSON models
- Validate MSON models for structural consistency
- Export models to multiple formats (JSON, JavaScript, PlantUML, Mermaid)
- Provide templates and examples for common design patterns

## 2. Target Users

### 2.1 Primary Users

- **System Architects**: Designing system architectures and components
- **Software Developers**: Creating UML diagrams and system models
- **AI Agents**: Assisting with system design tasks through MCP integration

### 2.2 Secondary Users

- **Technical Writers**: Documenting system designs
- **Project Managers**: Understanding system architecture
- **DevOps Engineers**: Implementing system designs

## 3. Product Features

### 3.1 Core Features

#### 3.1.1 MSON Model Generation

- **Description**: Convert natural language descriptions to MSON format
- **User Value**: Rapid prototyping of system models without manual JSON definition
- **Requirements**:
  - Parse natural language to identify entities, properties, methods, and relationships
  - Generate valid MSON schema and model structures
  - Support class, component, and system model types

#### 3.1.2 UML Diagram Generation

- **Description**: Create various UML diagrams from MSON models
- **User Value**: Visual representation of system architecture
- **Requirements**:
  - Support Class diagrams (primary)
  - Support Sequence, Activity, and Component diagrams
  - Generate diagrams in PlantUML and Mermaid formats
  - Maintain consistency between model and diagram

#### 3.1.3 Model Validation

- **Description**: Validate MSON models for structural consistency
- **User Value**: Ensure models follow correct patterns and relationships
- **Requirements**:
  - Check type consistency across properties and methods
  - Validate relationship integrity
  - Provide detailed error messages for invalid models
  - Suggest corrections for common issues

#### 3.1.4 Multi-Format Export

- **Description**: Export MSON models to various implementation formats
- **User Value**: Seamless transition from design to implementation
- **Requirements**:
  - Export to JSON (MSON format)
  - Export to JavaScript classes
  - Export to PlantUML diagrams
  - Export to Mermaid diagrams
  - Support for future formats (Graphviz, etc.)

### 3.2 Supporting Features

#### 3.2.1 Template Library

- **Description**: Pre-built MSON templates for common patterns
- **User Value**: Accelerate design with proven patterns
- **Requirements**:
  - Basic class template
  - User management template
  - Repository pattern template
  - CRUD operation template

#### 3.2.2 Example Models

- **Description**: Reference implementations of common systems
- **User Value**: Learning and reference material
- **Requirements**:
  - Person/Contact model example
  - E-commerce system example
  - Blog/CMS system example

#### 3.2.3 Guided Design Prompts

- **Description**: MCP prompts for common design tasks
- **User Value**: Structured approach to system design
- **Requirements**:
  - System design planning prompt
  - Model refactoring prompt
  - Diagram generation workflow prompt

## 4. Technical Requirements

### 4.1 Technology Stack

- **Runtime**: Bun JavaScript runtime
- **Language**: TypeScript
- **MCP SDK**: @modelcontextprotocol/sdk
- **Validation**: Zod for type safety and validation
- **State Management**: Zustand (for potential UI components)
- **Testing**: Bun Test (`bun test`)
- **Diagram Generation**: PlantUML, Mermaid

### 4.2 MCP Server Requirements

- **Transport**: Support both stdio (local) and HTTP/SSE (cloud)
- **Protocol Compliance**: Full MCP specification compliance
- **Error Handling**: Comprehensive error handling and reporting
- **Logging**: Structured logging for debugging and monitoring
- **Server Implementation**: Use `Bun.serve()` for HTTP/SSE transport with WebSocket support
- **File Operations**: Use `Bun.file()` for efficient file I/O operations
- **Environment**: Automatic .env loading (no dotenv required)

### 4.3 Performance Requirements

- **Response Time**: < 2 seconds for simple model generation
- **Memory Usage**: < 100MB for typical operations
- **Concurrent Users**: Support multiple simultaneous connections

### 4.4 Security Requirements

- **Input Validation**: Validate all inputs using Zod schemas
- **No Code Execution**: Never execute user-provided code
- **Safe Parsing**: Secure JSON parsing with error handling

## 5. Architecture

### 5.1 High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   LLM Client    │    │   MCP Server     │    │ System Designer │
│  (Claude/etc.)  │◄──►│  (Our Server)    │◄──►│  (Local/File)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │  ┌─────────────────┐   │   ┌─────────────────┐   │
        │  │ MSON Tools      │   │   │ Model Validator  │   │
        │  │ Diagram Gen     │   │   │ Export Engine    │   │
        │  │ Zod Schemas     │   │   │ File Operations  │   │
        │  └─────────────────┘   │   └─────────────────┘   │
        └────────────────────────┘                        │
                                └────────────────────────┘
```

### 5.2 Key Architectural Changes

**Previous Approach (Parser-Based)**:

- Natural language input → Server-side parsing → MSON model
- Complex NLP processing and pattern matching
- Deterministic rules for entity extraction
- Limited flexibility and maintainability

**Current Approach (Tool-Based)**:

- Structured input from LLM → Validation → Processing
- LLM handles understanding, server handles validation/formatting
- Simple, maintainable tools with clear responsibilities
- Maximum flexibility for different use cases

**Benefits of Tool-Based Approach**:

- **Simplicity**: No complex parsing logic to maintain
- **Flexibility**: Works with any domain the LLM understands
- **Reliability**: Fewer moving parts, less error-prone
- **Extensibility**: Easy to add new tools and features
- **Performance**: Faster validation and processing

### 5.3 Component Architecture

- **MCP Server Core**: Handles MCP protocol communication
- **Tools Layer**: Exposes functionality as MCP tools
- **Validation Layer**: Zod schema validation for type safety
- **Export Layer**: Multiple format export (JSON, UML, System Designer)

### 5.4 Data Flow

1. LLM creates structured MSON model using our schema
2. AI agent calls our MCP server tools with structured data
3. MCP server validates MSON model using Zod schemas
4. Model is processed and UML diagrams are generated
5. MSON model is exported to System Designer format using `Bun.file()`
6. Results are returned to AI agent via MCP protocol

### 5.5 System Designer Integration Strategy

#### macOS Application Integration

- **Electron-based**: System Designer is built with Electron, runs on macOS
- **File-based communication**: Write MSON files to app's data directory
- **No direct API**: Use file operations instead of direct API calls
- **AppleScript support**: Potentially use AppleScript to refresh the app
- **Data directory**: Write to `~/Library/Application Support/System Designer/`

#### Integration Flow

```typescript
// Write MSON model to System Designer's data directory
const appDataPath = `${homedir()}/Library/Application Support/System Designer`;
const modelFile = Bun.file(`${appDataPath}/models/${modelName}.json`);
await modelFile.write(JSON.stringify(msonModel, null, 2));

// Optionally trigger app refresh via AppleScript
await triggerAppRefresh();
```

#### Benefits of This Approach

- **Simple**: No complex API integration needed
- **Reliable**: File operations are well-supported
- **Native**: Works with existing System Designer functionality
- **Extensible**: Can add more features later

### 5.6 Bun-Specific Implementation Considerations

#### Server Implementation

```typescript
// MCP Server with Bun.serve()
const server = Bun.serve({
  port: process.env.PORT || 3000,
  fetch(req) {
    // Handle MCP protocol requests
    if (req.headers.get('upgrade') === 'websocket') {
      // WebSocket support for real-time communication
    }
    // HTTP/SSE transport handling
  },
  websocket: {
    open(ws) {
      // WebSocket connection opened
    },
    message(ws, message) {
      // Handle MCP messages
    },
    close(ws) {
      // Connection cleanup
    },
  },
});
```

#### File Operations

```typescript
// Efficient file operations with Bun.file()
const templateFile = Bun.file('./templates/basic-class.json');
const templateContent = await templateFile.text();

// Write exported models
const outputFile = Bun.file('./exports/model.json');
await outputFile.write(JSON.stringify(model, null, 2));
```

#### Testing

```typescript
// Use bun test for all testing
import { test, expect } from 'bun:test';

test('MSON model validation', () => {
  const result = validateModel(testModel);
  expect(result.valid).toBe(true);
});
```

## 6. MCP Interface Specification

### 6.1 Tools

#### 6.1.1 create_mson_model

- **Purpose**: Create and validate MSON models from structured data
- **Parameters**:
  - `name` (string, required): Name of the model
  - `type` (enum: "class"|"component"|"deployment"|"usecase", required): Model type
  - `description` (string, optional): Description of the model
  - `entities` (array, required): Array of entities in the model
  - `relationships` (array, optional): Array of relationships between entities
- **Returns**: Validated MSON model with unique IDs

#### 6.1.2 generate_uml_diagram

- **Purpose**: Create UML diagrams from MSON models
- **Parameters**:
  - `model` (object, required): MSON model object
  - `format` (enum: "plantuml"|"mermaid", optional): Output format (default: plantuml)
- **Returns**: Generated diagram markup in requested format

#### 6.1.3 validate_mson_model

- **Purpose**: Validate MSON model consistency and completeness
- **Parameters**:
  - `model` (object, required): MSON model to validate
- **Returns**: Validation results with warnings and errors

#### 6.1.4 export_to_system_designer

- **Purpose**: Export MSON model to System Designer format
- **Parameters**:
  - `model` (object, required): MSON model to export
  - `filePath` (string, optional): File path to save the exported file
- **Returns**: Export success confirmation with file location

### 6.2 Resources

#### 6.2.1 mson://templates/{templateType}

- **Purpose**: Access pre-built MSON templates
- **Template Types**: "basic-class", "user-model", "repository-pattern"
- **Returns**: MSON template as JSON

#### 6.2.2 mson://examples/{exampleType}

- **Purpose**: Access example MSON models
- **Example Types**: "person", "order", "blog"
- **Returns**: Example model as JSON

#### 6.2.3 mson://types

- **Purpose**: List supported MSON data types
- **Returns**: Supported types documentation

### 6.3 Prompts

#### 6.3.1 system-design-planning

- **Purpose**: Guide users through system design process
- **Parameters**:
  - `systemName` (string): Name of the system
  - `requirements` (string): System requirements
  - `complexity` (enum: "simple"|"medium"|"complex"): System complexity
- **Returns**: Structured design workflow

#### 6.3.2 model-refactoring

- **Purpose**: Help improve existing MSON models
- **Parameters**:
  - `currentModel` (string): Current MSON model
  - `issues` (string): Issues to address
  - `targetArchitecture` (string, optional): Target pattern
- **Returns**: Refactoring guidance

#### 6.3.3 diagram-workflow

- **Purpose**: Step-by-step diagram generation
- **Parameters**:
  - `msonModel` (string): MSON model
  - `diagramTypes` (array): Requested diagram types
- **Returns**: Diagram generation workflow

## 7. Success Metrics

### 7.1 Technical Metrics

- **Server Uptime**: > 99.9%
- **Response Time**: < 2 seconds for 95% of requests
- **Error Rate**: < 1% for valid inputs
- **Test Coverage**: > 90% code coverage

### 7.2 User Experience Metrics

- **Task Completion Rate**: > 90% for common workflows
- **Model Validation Accuracy**: > 95% correct validation results
- **Diagram Generation Quality**: Diagrams accurately represent models

### 7.3 Adoption Metrics

- **MCP Client Integration**: Compatible with major MCP clients
- **Community Engagement**: Active issues and contributions
- **Documentation Quality**: Clear, comprehensive documentation

## 8. Implementation Plan

### 8.1 Phase 1: Understanding MCP (Week 1) - **Learning-Focused** ✅ **COMPLETED**

- **Task 1.1**: MCP Server "Hello World" - Learn MCP fundamentals ✅
- **Task 1.2**: Basic Tool Implementation - Understand MCP tool interface ✅
- **Task 1.3**: System Designer Integration Research - Figure out macOS app communication ✅
- **Goal**: Create basic MCP server and understand core concepts ✅

### 8.2 Phase 2: Tool-Based Approach (Week 2) - **Core Engine** 🔄 **COMPLETED**

- **Task 2.1**: MSON Schema Definition - TypeScript interfaces and type safety ✅
- **Task 2.2**: Tool-Based Architecture - LLM-empowering tools instead of parser ✅
- **Task 2.3**: Model Validation - Error handling and data integrity ✅
- **Goal**: Create tool-based MCP server that empowers LLMs ✅

### 8.3 Phase 3: UML Diagram Generation (Week 3) - **Visual Output** 🔄 **COMPLETED**

- **Task 3.1**: PlantUML Generator - Template generation patterns ✅
- **Task 3.2**: Multiple Format Support - Abstract factory pattern ✅
- **Goal**: Generate UML diagrams from MSON models ✅

### 8.4 Phase 4: Complete MCP Tools (Week 4) - **Integration** 🔄 **COMPLETED**

- **Task 4.1**: Complete Tool Set - All 4 MCP tools with full functionality ✅
- **Task 4.2**: System Designer Integration - Bridge to macOS application ✅
- **Task 4.3**: Testing and Documentation - Quality assurance ✅
- **Goal**: Production-ready MCP server with full integration ✅

### 8.5 File-by-File Architecture

```
system-designer-mcp/
├── src/
│   ├── index.ts              # Main MCP server entry point
│   ├── types.ts              # MSON type definitions and Zod schemas
│   ├── tools/
│   │   ├── create-model.ts    # create_mson_model tool
│   │   ├── validate-model.ts # validate_mson_model tool
│   │   ├── generate-diagram.ts # generate_uml_diagram tool
│   │   └── export-model.ts   # export_to_system_designer tool
│   ├── utils/
│   │   ├── plantuml.ts       # PlantUML generation utilities
│   │   ├── mermaid.ts        # Mermaid generation utilities
│   │   └── validation.ts     # Model validation utilities
├── test/                     # Test files for tool-based approach
├── package.json
└── README.md
```

## 9. Future Enhancements

### 9.1 Short-term (1-3 months)

- Additional UML diagram types (State, Deployment, Use Case)
- More export formats (Graphviz, SVG)
- Advanced model analysis features
- Web-based UI for testing

### 9.2 Medium-term (3-6 months)

- System Designer API integration
- Real-time collaboration features
- Advanced NLP for model generation
- Integration with version control

### 9.3 Long-term (6+ months)

- Multi-language support
- Machine learning for model suggestions
- Enterprise features (SAML, RBAC)
- Plugin system for extensions

## 10. Open Source Strategy

### 10.1 License

- MIT License (same as System Designer)
- Permissive for commercial and non-commercial use

### 10.2 Community Building

- Clear contribution guidelines
- Issue and PR templates
- Documentation and tutorials
- Example implementations

### 10.3 Maintenance

- Regular updates and security patches
- Responsive to community feedback
- Compatibility with MCP specification updates
- Backward compatibility where possible

## 11. Assumptions and Constraints

### 11.1 Assumptions

- Users have basic understanding of UML and system design
- MCP clients support the full MCP specification
- System Designer models follow MSON format
- Natural language processing can identify basic entities and relationships

### 11.2 Constraints

- No direct System Designer API integration in initial version
- Limited by MCP specification capabilities
- Cannot execute user-provided code for security reasons
- Initial focus on most common diagram types

## 12. Risks and Mitigation

### 12.1 Technical Risks

- **Risk**: Complex MSON parsing from natural language
  **Mitigation**: Start with simple patterns, iterate based on feedback

- **Risk**: Diagram generation accuracy
  **Mitigation**: Extensive testing with various model types

- **Risk**: Performance issues with complex models
  **Mitigation**: Implement caching and optimization strategies

### 12.2 Adoption Risks

- **Risk**: Low MCP client adoption
  **Mitigation**: Ensure compatibility with major MCP implementations

- **Risk**: Competition from existing tools
  **Mitigation**: Focus on unique MCP integration and AI assistance

## 13. Learning Approach

### 13.1 Educational Goals

This project is designed as a learning experience for first-time MCP server developers:

#### Key Learning Concepts

- **MCP Fundamentals**: Understanding tools, resources, and prompts
- **TypeScript Best Practices**: Type safety, interfaces, and modularity
- **System Design Patterns**: Parser, generator, and integration patterns
- **macOS Integration**: File operations and inter-process communication
- **Natural Language Processing**: Basic text analysis and entity extraction
- **UML Diagram Generation**: Template-based code generation

#### Learning-by-Doing Approach

Each phase includes detailed explanations of:

- **Why** we structure code a certain way
- **What** each component does and how it fits together
- **How** different patterns solve specific problems
- **When** to use specific approaches and alternatives

### 13.2 Code Documentation Standards

Every file includes:

- **Purpose**: Why this file exists and what problem it solves
- **Architecture**: How it fits into the overall system
- **Dependencies**: What other components it relies on
- **Examples**: How to use and test the component

### 13.3 Progressive Complexity

- **Start Simple**: Basic MCP server with minimal functionality
- **Build Gradually**: Add complexity one concept at a time
- **Explain Thoroughly**: Each new concept is explained in context
- **Reinforce Learning**: Each phase builds on previous concepts

## 14. Glossary

- **MCP**: Model Context Protocol - standard for AI-tool integration
- **MSON**: Metamodel JavaScript Object Notation - JSON format for system models
- **UML**: Unified Modeling Language - standard for system diagrams
- **PlantUML**: Tool to generate UML diagrams from text description
- **Mermaid**: JavaScript-based diagramming and charting tool
- **Zod**: TypeScript-first schema validation library
- **Bun**: Fast JavaScript runtime and package manager
