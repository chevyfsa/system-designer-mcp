# System Designer MCP Server Examples

This directory contains example MSON models demonstrating the capabilities of the System Designer MCP Server. All examples were generated using the modern MCP SDK patterns with `server.registerTool()` and Zod validation schemas.

## Available Examples

### 1. Student Management System (Simple)

A simple educational example demonstrating basic class relationships.

**Files:**

- **`student-system.json`** - MSON model definition
- **`student-system-plantuml.puml`** - PlantUML class diagram
- **`student-system-mermaid.md`** - Mermaid class diagram
- **`student-system-export.json`** - System Designer export format

**Features:**

- 2 entities (Student, Course)
- 1 relationship (Student enrolls in Course)
- Basic attributes and methods
- Association with multiplicity

### 2. Banking System (Complex)

A comprehensive banking system demonstrating advanced modeling capabilities.

**Files:**

- **`banking-system.json`** - MSON model definition
- **`banking-system-plantuml.puml`** - PlantUML class diagram
- **`banking-system-mermaid.md`** - Mermaid class diagram
- **`banking-system-export.json`** - System Designer export format

**Features:**

- 8 entities (Customer, Account, Transaction, Loan, Branch, Employee, Address, LoanApplication)
- 11 relationships with various multiplicities
- Complex business logic and workflows
- Multiple relationship types (association, composition, aggregation)

## System Architecture

### Core Entities (8)

1. **Customer** - Bank customers with personal information and financial activities
2. **Account** - Financial accounts with balance management and transactions
3. **Transaction** - Individual financial transactions between accounts
4. **Loan** - Loan products with terms and payment management
5. **Branch** - Physical bank locations with staff and customers
6. **Employee** - Bank staff who process transactions and approve loans
7. **Address** - Address information for customers and branches
8. **LoanApplication** - Loan request workflow with approval process

### Relationships (11)

- **Customer → Account** (1:0..\*) - Customers own multiple accounts
- **Account → Transaction** (1:0..\*) - Accounts have multiple transactions
- **Customer → Loan** (1:0..\*) - Customers have multiple loans
- **Customer → LoanApplication** (1:0..\*) - Customers submit loan applications
- **Branch → Customer** (1:0..\*) - Branches serve multiple customers
- **Branch → Employee** (1:0..\*) - Branches employ multiple staff
- **Employee → Branch** (1:1) - Employees work at one branch
- **Customer → Address** (1:1) - Customers have one address
- **Branch → Address** (1:1) - Branches have one address
- **LoanApplication → Employee** (1:0..1) - Applications approved by employees
- **LoanApplication → Loan** (1:0..1) - Applications result in loans

### Key Features

#### Customer Management

- Personal information management
- Account opening and closing
- Loan applications
- Fund transfers between accounts

#### Account Management

- Deposit and withdrawal operations
- Balance inquiries
- Transaction history
- Interest calculation
- Account closure

#### Transaction Processing

- Transaction validation and processing
- Detailed transaction tracking
- Status management
- Account-to-account transfers

#### Loan Management

- Loan application workflow
- Payment processing
- Balance tracking
- Refinancing options

#### Branch Operations

- Customer service
- Staff management
- Branch operations
- Address management

## How These Examples Were Generated

All examples in this directory were generated using the System Designer MCP Server with modern SDK patterns:

1. **Model Creation**: Using `create_mson_model` tool with Zod-validated input schemas
2. **Validation**: Using `validate_mson_model` tool to ensure consistency
3. **UML Generation**: Using `generate_uml_diagram` tool for both PlantUML and Mermaid formats
4. **Export**: Using `export_to_system_designer` tool for System Designer app integration

### Generation Script

You can regenerate these examples using the included script:

```bash
bun run scripts/generate-examples.ts
```

This script demonstrates:

- Modern `server.registerTool()` API usage
- Zod schema validation
- Type-safe handler methods
- All 4 MCP tools in action

## Using the Examples

### 1. With MCP Client

```javascript
// Create a model
const model = await mcpClient.callTool('create_mson_model', {
  name: 'Student Management System',
  type: 'class',
  entities: [
    /* ... */
  ],
  relationships: [
    /* ... */
  ],
});

// Validate the model
const validation = await mcpClient.callTool('validate_mson_model', {
  model: model.content[1].json,
});

// Generate UML diagram
const diagram = await mcpClient.callTool('generate_uml_diagram', {
  model: model.content[1].json,
  format: 'plantuml', // or 'mermaid'
});

// Export to System Designer
const exported = await mcpClient.callTool('export_to_system_designer', {
  model: model.content[1].json,
  filePath: './output.json',
});
```

### 2. With PlantUML

```bash
# Generate PNG from PlantUML
plantuml student-system-plantuml.puml
plantuml banking-system-plantuml.puml
```

### 3. With Mermaid

Copy the Mermaid code into any Mermaid-enabled platform:

- GitHub/GitLab markdown
- Mermaid Live Editor
- Notion, Obsidian, etc.

## Statistics

- **Total Entities**: 8
- **Total Relationships**: 11
- **Total Methods**: 36
- **Total Attributes**: 49
- **Model Type**: Class Diagram
- **Complexity**: Medium-High

## Model Validation

This model has been validated using the System Designer MCP Server:

- ✅ All entity IDs are unique
- ✅ All relationship references are valid
- ✅ No orphaned relationships
- ✅ Proper multiplicity definitions
- ✅ Valid entity types and attributes

## Export Options

The model can be exported to multiple formats:

- **MSON JSON** - Native format for the MCP server
- **PlantUML** - UML diagram generation
- **Mermaid** - Web-compatible diagrams
- **System Designer** - Native app format

## Integration with System Designer App

1. Import `banking-system-export.json` into System Designer
2. The model will appear as a complete class diagram
3. Edit and extend the diagram as needed
4. Export back to MSON format if changes are made

## Extending the Model

### Additional Entities to Consider

- **Card** - Debit/Credit card management
- **ATM** - ATM transactions and locations
- **BillPayment** - Bill payment services
- **Investment** - Investment accounts and portfolios
- **Insurance** - Insurance products
- **Alert** - Account alerts and notifications

### Additional Features

- Multi-currency support
- International banking
- Mobile banking integration
- API endpoints for web banking
- Audit and compliance features

## Technical Details

### Modern MCP SDK Patterns

These examples demonstrate the modern MCP TypeScript SDK (v1.18.2) patterns:

- **`server.registerTool()`** - Modern tool registration API
- **Zod Input Schemas** - Type-safe input validation
- **Title Metadata** - Enhanced UX with tool titles
- **Type Inference** - Zod-inferred types for parameters

### Modular Architecture

The examples were generated using a modular codebase structure:

- **`src/types.ts`** - TypeScript type definitions
- **`src/schemas.ts`** - Zod validation schemas
- **`src/tools.ts`** - Tool registration with modern SDK
- **`src/index.ts`** - Server class with handler methods

### Validation Features

All models include:

- ✅ Unique entity IDs
- ✅ Valid relationship references
- ✅ No orphaned relationships
- ✅ Proper multiplicity definitions
- ✅ Type-safe attributes and methods

## Created With

These examples were created using:

- **MCP Server**: system-designer-mcp v1.0.0
- **MCP SDK**: @modelcontextprotocol/sdk v1.18.2
- **Validation**: Zod v4.1.11
- **Runtime**: Bun JavaScript Runtime
- **Creation Date**: 2025-09-29
- **Tools Used**: All 4 MCP tools (create, validate, generate, export)

## License

These examples are provided as-is for educational and demonstration purposes.
