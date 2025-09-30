🎨 UML Diagram Generated (MERMAID):

Model: Banking System
Format: mermaid

Copy the markup below into your preferred UML tool:

---
classDiagram
title Banking System
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
    -?isActive: boolean
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
Customer --> Account : owns
Account --> Transaction : has
Customer --> Loan : has
Customer --> LoanApplication : submits
Branch --> Customer : serves
Branch --> Employee : employs
Employee --> Branch : works at
Customer --> Address : lives at
Branch --> Address : located at
LoanApplication --> Employee : approved by
LoanApplication --> Loan : results in

---