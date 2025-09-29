#!/usr/bin/env bun

// Test script to create a Bank model using the MCP server
import { SystemDesignerMCPServer } from './src/index.ts';

// Bank model data
const bankModel = {
  name: 'Banking System',
  type: 'class' as const,
  description:
    'A comprehensive banking system for managing accounts, customers, transactions, and loans',
  entities: [
    {
      id: 'customer',
      name: 'Customer',
      type: 'class' as const,
      attributes: [
        { name: 'customerId', type: 'string', visibility: 'private' },
        { name: 'firstName', type: 'string', visibility: 'private' },
        { name: 'lastName', type: 'string', visibility: 'private' },
        { name: 'email', type: 'string', visibility: 'private' },
        { name: 'phone', type: 'string', visibility: 'private' },
        { name: 'dateOfBirth', type: 'Date', visibility: 'private' },
        { name: 'address', type: 'Address', visibility: 'private' },
        { name: 'creditScore', type: 'number', visibility: 'private' },
      ],
      methods: [
        {
          name: 'openAccount',
          parameters: [{ name: 'accountType', type: 'string' }],
          returnType: 'Account',
          visibility: 'public',
        },
        {
          name: 'closeAccount',
          parameters: [{ name: 'account', type: 'Account' }],
          returnType: 'boolean',
          visibility: 'public',
        },
        {
          name: 'applyForLoan',
          parameters: [
            { name: 'loanAmount', type: 'number' },
            { name: 'loanType', type: 'string' },
          ],
          returnType: 'LoanApplication',
          visibility: 'public',
        },
        {
          name: 'getAccountBalance',
          parameters: [{ name: 'account', type: 'Account' }],
          returnType: 'number',
          visibility: 'public',
        },
        {
          name: 'transferFunds',
          parameters: [
            { name: 'fromAccount', type: 'Account' },
            { name: 'toAccount', type: 'Account' },
            { name: 'amount', type: 'number' },
          ],
          returnType: 'boolean',
          visibility: 'public',
        },
      ],
    },
    {
      id: 'account',
      name: 'Account',
      type: 'class' as const,
      attributes: [
        { name: 'accountNumber', type: 'string', visibility: 'private' },
        { name: 'accountType', type: 'string', visibility: 'private' },
        { name: 'balance', type: 'number', visibility: 'private' },
        { name: 'interestRate', type: 'number', visibility: 'private' },
        { name: 'dateOpened', type: 'Date', visibility: 'private' },
        { name: 'isActive', type: 'boolean', visibility: 'private', isReadOnly: true },
        { name: 'minimumBalance', type: 'number', visibility: 'private' },
      ],
      methods: [
        {
          name: 'deposit',
          parameters: [{ name: 'amount', type: 'number' }],
          returnType: 'boolean',
          visibility: 'public',
        },
        {
          name: 'withdraw',
          parameters: [{ name: 'amount', type: 'number' }],
          returnType: 'boolean',
          visibility: 'public',
        },
        { name: 'getBalance', parameters: [], returnType: 'number', visibility: 'public' },
        {
          name: 'getTransactionHistory',
          parameters: [],
          returnType: 'Transaction[]',
          visibility: 'public',
        },
        { name: 'calculateInterest', parameters: [], returnType: 'number', visibility: 'public' },
        { name: 'closeAccount', parameters: [], returnType: 'boolean', visibility: 'public' },
      ],
    },
    {
      id: 'transaction',
      name: 'Transaction',
      type: 'class' as const,
      attributes: [
        { name: 'transactionId', type: 'string', visibility: 'private' },
        { name: 'transactionType', type: 'string', visibility: 'private' },
        { name: 'amount', type: 'number', visibility: 'private' },
        { name: 'timestamp', type: 'Date', visibility: 'private' },
        { name: 'description', type: 'string', visibility: 'private' },
        { name: 'status', type: 'string', visibility: 'private' },
        { name: 'fromAccount', type: 'Account', visibility: 'private' },
        { name: 'toAccount', type: 'Account', visibility: 'private' },
      ],
      methods: [
        { name: 'processTransaction', parameters: [], returnType: 'boolean', visibility: 'public' },
        {
          name: 'validateTransaction',
          parameters: [],
          returnType: 'boolean',
          visibility: 'public',
        },
        {
          name: 'getTransactionDetails',
          parameters: [],
          returnType: 'string',
          visibility: 'public',
        },
      ],
    },
    {
      id: 'loan',
      name: 'Loan',
      type: 'class' as const,
      attributes: [
        { name: 'loanId', type: 'string', visibility: 'private' },
        { name: 'loanType', type: 'string', visibility: 'private' },
        { name: 'principalAmount', type: 'number', visibility: 'private' },
        { name: 'interestRate', type: 'number', visibility: 'private' },
        { name: 'termMonths', type: 'number', visibility: 'private' },
        { name: 'startDate', type: 'Date', visibility: 'private' },
        { name: 'endDate', type: 'Date', visibility: 'private' },
        { name: 'monthlyPayment', type: 'number', visibility: 'private' },
        { name: 'outstandingBalance', type: 'number', visibility: 'private' },
        { name: 'loanStatus', type: 'string', visibility: 'private' },
      ],
      methods: [
        {
          name: 'calculateMonthlyPayment',
          parameters: [],
          returnType: 'number',
          visibility: 'public',
        },
        {
          name: 'makePayment',
          parameters: [{ name: 'amount', type: 'number' }],
          returnType: 'boolean',
          visibility: 'public',
        },
        { name: 'getRemainingBalance', parameters: [], returnType: 'number', visibility: 'public' },
        {
          name: 'refinanceLoan',
          parameters: [{ name: 'newInterestRate', type: 'number' }],
          returnType: 'boolean',
          visibility: 'public',
        },
      ],
    },
    {
      id: 'branch',
      name: 'Branch',
      type: 'class' as const,
      attributes: [
        { name: 'branchId', type: 'string', visibility: 'private' },
        { name: 'branchName', type: 'string', visibility: 'private' },
        { name: 'address', type: 'Address', visibility: 'private' },
        { name: 'phoneNumber', type: 'string', visibility: 'private' },
        { name: 'manager', type: 'Employee', visibility: 'private' },
        { name: 'operatingHours', type: 'string', visibility: 'private' },
      ],
      methods: [
        { name: 'openBranch', parameters: [], returnType: 'boolean', visibility: 'public' },
        { name: 'closeBranch', parameters: [], returnType: 'boolean', visibility: 'public' },
        {
          name: 'addCustomer',
          parameters: [{ name: 'customer', type: 'Customer' }],
          returnType: 'boolean',
          visibility: 'public',
        },
        { name: 'getBranchDetails', parameters: [], returnType: 'string', visibility: 'public' },
      ],
    },
    {
      id: 'employee',
      name: 'Employee',
      type: 'class' as const,
      attributes: [
        { name: 'employeeId', type: 'string', visibility: 'private' },
        { name: 'firstName', type: 'string', visibility: 'private' },
        { name: 'lastName', type: 'string', visibility: 'private' },
        { name: 'position', type: 'string', visibility: 'private' },
        { name: 'department', type: 'string', visibility: 'private' },
        { name: 'salary', type: 'number', visibility: 'private' },
        { name: 'hireDate', type: 'Date', visibility: 'private' },
        { name: 'branch', type: 'Branch', visibility: 'private' },
      ],
      methods: [
        {
          name: 'processTransaction',
          parameters: [{ name: 'transaction', type: 'Transaction' }],
          returnType: 'boolean',
          visibility: 'public',
        },
        {
          name: 'approveLoan',
          parameters: [{ name: 'loanApplication', type: 'LoanApplication' }],
          returnType: 'boolean',
          visibility: 'public',
        },
        {
          name: 'openCustomerAccount',
          parameters: [
            { name: 'customer', type: 'Customer' },
            { name: 'accountType', type: 'string' },
          ],
          returnType: 'Account',
          visibility: 'public',
        },
        { name: 'getEmployeeDetails', parameters: [], returnType: 'string', visibility: 'public' },
      ],
    },
    {
      id: 'address',
      name: 'Address',
      type: 'class' as const,
      attributes: [
        { name: 'street', type: 'string', visibility: 'private' },
        { name: 'city', type: 'string', visibility: 'private' },
        { name: 'state', type: 'string', visibility: 'private' },
        { name: 'zipCode', type: 'string', visibility: 'private' },
        { name: 'country', type: 'string', visibility: 'private' },
      ],
      methods: [
        { name: 'validateAddress', parameters: [], returnType: 'boolean', visibility: 'public' },
        { name: 'getFullAddress', parameters: [], returnType: 'string', visibility: 'public' },
        {
          name: 'updateAddress',
          parameters: [{ name: 'newAddress', type: 'Address' }],
          returnType: 'boolean',
          visibility: 'public',
        },
      ],
    },
    {
      id: 'loanApplication',
      name: 'LoanApplication',
      type: 'class' as const,
      attributes: [
        { name: 'applicationId', type: 'string', visibility: 'private' },
        { name: 'customer', type: 'Customer', visibility: 'private' },
        { name: 'loanType', type: 'string', visibility: 'private' },
        { name: 'requestedAmount', type: 'number', visibility: 'private' },
        { name: 'applicationDate', type: 'Date', visibility: 'private' },
        { name: 'applicationStatus', type: 'string', visibility: 'private' },
        { name: 'creditScore', type: 'number', visibility: 'private' },
        { name: 'income', type: 'number', visibility: 'private' },
        { name: 'approvedBy', type: 'Employee', visibility: 'private' },
        { name: 'approvalDate', type: 'Date', visibility: 'private' },
      ],
      methods: [
        { name: 'submitApplication', parameters: [], returnType: 'boolean', visibility: 'public' },
        {
          name: 'updateStatus',
          parameters: [{ name: 'status', type: 'string' }],
          returnType: 'boolean',
          visibility: 'public',
        },
        { name: 'getApprovalStatus', parameters: [], returnType: 'string', visibility: 'public' },
        { name: 'calculateLoanTerms', parameters: [], returnType: 'Loan', visibility: 'public' },
      ],
    },
  ],
  relationships: [
    {
      id: 'customer_accounts',
      from: 'customer',
      to: 'account',
      type: 'association' as const,
      multiplicity: {
        from: '1',
        to: '0..*',
      },
      name: 'owns',
    },
    {
      id: 'account_transactions',
      from: 'account',
      to: 'transaction',
      type: 'association' as const,
      multiplicity: {
        from: '1',
        to: '0..*',
      },
      name: 'has',
    },
    {
      id: 'customer_loans',
      from: 'customer',
      to: 'loan',
      type: 'association' as const,
      multiplicity: {
        from: '1',
        to: '0..*',
      },
      name: 'has',
    },
    {
      id: 'customer_loan_applications',
      from: 'customer',
      to: 'loanApplication',
      type: 'association' as const,
      multiplicity: {
        from: '1',
        to: '0..*',
      },
      name: 'submits',
    },
    {
      id: 'branch_customers',
      from: 'branch',
      to: 'customer',
      type: 'association' as const,
      multiplicity: {
        from: '1',
        to: '0..*',
      },
      name: 'serves',
    },
    {
      id: 'branch_employees',
      from: 'branch',
      to: 'employee',
      type: 'association' as const,
      multiplicity: {
        from: '1',
        to: '0..*',
      },
      name: 'employs',
    },
    {
      id: 'employee_branch',
      from: 'employee',
      to: 'branch',
      type: 'association' as const,
      multiplicity: {
        from: '1',
        to: '1',
      },
      name: 'works at',
    },
    {
      id: 'customer_address',
      from: 'customer',
      to: 'address',
      type: 'association' as const,
      multiplicity: {
        from: '1',
        to: '1',
      },
      name: 'lives at',
    },
    {
      id: 'branch_address',
      from: 'branch',
      to: 'address',
      type: 'association' as const,
      multiplicity: {
        from: '1',
        to: '1',
      },
      name: 'located at',
    },
    {
      id: 'loanApplication_approvedBy',
      from: 'loanApplication',
      to: 'employee',
      type: 'association' as const,
      multiplicity: {
        from: '1',
        to: '0..1',
      },
      name: 'approved by',
    },
    {
      id: 'loanApplication_loan',
      from: 'loanApplication',
      to: 'loan',
      type: 'association' as const,
      multiplicity: {
        from: '1',
        to: '0..1',
      },
      name: 'results in',
    },
  ],
};

console.log('🏦 Creating Bank Model...');
console.log(JSON.stringify(bankModel, null, 2));
console.log('\n✅ Bank model created successfully!');
