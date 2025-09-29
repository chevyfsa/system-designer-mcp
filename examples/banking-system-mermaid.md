# Banking System - Mermaid Class Diagram

```mermaid
classDiagram
    class Customer {
        -customerId: string
        -firstName: string
        -lastName: string
        -email: string
        -phone: string
        -dateOfBirth: Date
        -address: Address
        -creditScore: number
        +openAccount(accountType: string): Account
        +closeAccount(account: Account): boolean
        +applyForLoan(loanAmount: number, loanType: string): LoanApplication
        +getAccountBalance(account: Account): number
        +transferFunds(fromAccount: Account, toAccount: Account, amount: number): boolean
    }

    class Account {
        -accountNumber: string
        -accountType: string
        -balance: number
        -interestRate: number
        -dateOpened: Date
        +isActive: boolean {readOnly}
        -minimumBalance: number
        +deposit(amount: number): boolean
        +withdraw(amount: number): boolean
        +getBalance(): number
        +getTransactionHistory(): Transaction[]
        +calculateInterest(): number
        +closeAccount(): boolean
    }

    class Transaction {
        -transactionId: string
        -transactionType: string
        -amount: number
        -timestamp: Date
        -description: string
        -status: string
        -fromAccount: Account
        -toAccount: Account
        +processTransaction(): boolean
        +validateTransaction(): boolean
        +getTransactionDetails(): string
    }

    class Loan {
        -loanId: string
        -loanType: string
        -principalAmount: number
        -interestRate: number
        -termMonths: number
        -startDate: Date
        -endDate: Date
        -monthlyPayment: number
        -outstandingBalance: number
        -loanStatus: string
        +calculateMonthlyPayment(): number
        +makePayment(amount: number): boolean
        +getRemainingBalance(): number
        +refinanceLoan(newInterestRate: number): boolean
    }

    class Branch {
        -branchId: string
        -branchName: string
        -address: Address
        -phoneNumber: string
        -manager: Employee
        -operatingHours: string
        +openBranch(): boolean
        +closeBranch(): boolean
        +addCustomer(customer: Customer): boolean
        +getBranchDetails(): string
    }

    class Employee {
        -employeeId: string
        -firstName: string
        -lastName: string
        -position: string
        -department: string
        -salary: number
        -hireDate: Date
        -branch: Branch
        +processTransaction(transaction: Transaction): boolean
        +approveLoan(loanApplication: LoanApplication): boolean
        +openCustomerAccount(customer: Customer, accountType: string): Account
        +getEmployeeDetails(): string
    }

    class Address {
        -street: string
        -city: string
        -state: string
        -zipCode: string
        -country: string
        +validateAddress(): boolean
        +getFullAddress(): string
        +updateAddress(newAddress: Address): boolean
    }

    class LoanApplication {
        -applicationId: string
        -customer: Customer
        -loanType: string
        -requestedAmount: number
        -applicationDate: Date
        -applicationStatus: string
        -creditScore: number
        -income: number
        -approvedBy: Employee
        -approvalDate: Date
        +submitApplication(): boolean
        +updateStatus(status: string): boolean
        +getApprovalStatus(): string
        +calculateLoanTerms(): Loan
    }

    Customer "1" -- "0..*" Account : owns
    Account "1" -- "0..*" Transaction : has
    Customer "1" -- "0..*" Loan : has
    Customer "1" -- "0..*" LoanApplication : submits
    Branch "1" -- "0..*" Customer : serves
    Branch "1" -- "0..*" Employee : employs
    Employee "1" -- "1" Branch : works at
    Customer "1" -- "1" Address : lives at
    Branch "1" -- "1" Address : located at
    LoanApplication "1" -- "0..1" Employee : approved by
    LoanApplication "1" -- "0..1" Loan : results in
```

## System Overview

This banking system includes 8 core entities with comprehensive relationships:

### Core Entities:

- **Customer** - Bank customers with personal information and financial activities
- **Account** - Financial accounts with balance management and transactions
- **Transaction** - Individual financial transactions between accounts
- **Loan** - Loan products with terms and payment management
- **Branch** - Physical bank locations with staff and customers
- **Employee** - Bank staff who process transactions and approve loans
- **Address** - Address information for customers and branches
- **LoanApplication** - Loan request workflow with approval process

### Key Features:

- Comprehensive account management (deposit, withdraw, transfer)
- Transaction history and validation
- Loan application and approval workflow
- Branch and employee management
- Address handling for customers and branches
- Full audit trail with timestamps and status tracking
