# Use Case Diagram — Finance ERP MVP

This diagram shows actors interacting with the accounting system.

```mermaid
flowchart LR

Accountant((Accountant))
FinanceManager((Finance Manager))
Admin((System Admin))

System[Finance ERP System]

Accountant --> CreateInvoice
Accountant --> RecordVendorBill
Accountant --> RecordPayment
Accountant --> CreateJournal

FinanceManager --> ViewReports
FinanceManager --> ClosePeriod

Admin --> ManageAccounts
Admin --> ManageTaxRules
Admin --> ManageUsers

CreateInvoice --> System
RecordVendorBill --> System
RecordPayment --> System
CreateJournal --> System

ViewReports --> System
ClosePeriod --> System

ManageAccounts --> System
ManageTaxRules --> System
ManageUsers --> System
````

---

# Key Use Cases

## Create Invoice

Actor: Accountant

Steps:

1. input customer details
2. add invoice items
3. system calculates VAT
4. accounting entry generated

---

## Record Vendor Bill

Actor: Accountant

Steps:

1. input vendor bill
2. classify expense
3. system generates AP journal entry

---

## Record Payment

Actor: Accountant

Steps:

1. select invoice or bill
2. record payment
3. system posts cash journal

---

## View Financial Reports

Actor: Finance Manager

Steps:

1. select reporting period
2. system aggregates ledger
3. financial statements generated
