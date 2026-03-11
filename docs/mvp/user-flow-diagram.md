# User Flow Diagram — Finance ERP MVP

This diagram illustrates the primary user flows within the MVP accounting system.

```mermaid
flowchart TD

Login --> Dashboard

Dashboard --> CreateInvoice
Dashboard --> CreateBill
Dashboard --> RecordPayment
Dashboard --> ManualJournal
Dashboard --> FinancialReports

CreateInvoice --> CalculateVAT
CalculateVAT --> GenerateARJournal
GenerateARJournal --> SaveInvoice

CreateBill --> CalculateInputVAT
CalculateInputVAT --> GenerateAPJournal
GenerateAPJournal --> SaveBill

RecordPayment --> MatchInvoiceOrBill
MatchInvoiceOrBill --> GenerateCashJournal
GenerateCashJournal --> UpdateLedger

ManualJournal --> ValidateDoubleEntry
ValidateDoubleEntry --> PostLedger

FinancialReports --> GenerateStatements
GenerateStatements --> DisplayReports
````

---

# Flow Descriptions

## Invoice Flow

1. Accountant creates invoice
2. System calculates VAT
3. Accounting engine generates journal entry
4. Ledger updated

Accounting result:

```
DR Accounts Receivable
CR Revenue
CR VAT Payable
```

---

## Vendor Bill Flow

1. Accountant records vendor bill
2. VAT input calculated
3. Journal entry generated

Accounting result:

```
DR Expense
DR VAT Input
CR Accounts Payable
```

---

## Payment Flow

1. Accountant records payment
2. System matches invoice or bill
3. Journal entry posted

---

## Reporting Flow

Reports read data from:

* journal entries
* ledger aggregation
* tax transactions