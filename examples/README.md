# Banking System Example

This example demonstrates a comprehensive banking system model created using the System Designer MCP Server.

## Files Overview

- **`banking-system.json`** - MSON model definition (raw JSON format)
- **`banking-system-plantuml.puml`** - PlantUML class diagram
- **`banking-system-mermaid.md`** - Mermaid class diagram with documentation
- **`banking-system-export.json`** - System Designer export format

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

## Usage Examples

### Using with System Designer MCP Server

```bash
# Import the model into the MCP server
cat banking-system.json | xargs -I {} mcp-client call-tool create_mson_model --model-file {}

# Generate UML diagrams
mcp-client call-tool generate_uml_diagram --model banking-system.json --format plantuml
mcp-client call-tool generate_uml_diagram --model banking-system.json --format mermaid

# Export to System Designer
mcp-client call-tool export_to_system_designer --model banking-system.json --output banking-system-export.json
```

### Using the Diagrams

#### PlantUML

```bash
# Generate PNG from PlantUML
plantuml banking-system-plantuml.puml
```

#### Mermaid

```markdown
# Copy the mermaid code into any Mermaid-enabled platform

# GitHub, GitLab, Mermaid Live Editor, etc.
```

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

## Created With

This example was created using the System Designer MCP Server:

- **MCP Server**: system-designer-mcp v1.0.0
- **Creation Date**: 2025-09-29
- **Tools Used**: create_mson_model, generate_uml_diagram, export_to_system_designer

## License

This example is provided as-is for educational and demonstration purposes.
