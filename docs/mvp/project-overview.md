# Finance & Accounting ERP Module — MVP Overview

## Objective

Build a **Finance & Accounting module MVP** for an ERP platform that:

- complies with **basic Indonesian accounting requirements**
- supports **double-entry accounting**
- provides **core financial reports**
- can evolve toward **enterprise-level ERP features**

The MVP prioritizes **correct accounting architecture** over feature quantity.

---

# Design Principles

1. **Double-entry accounting first**
2. **Event-driven posting engine**
3. **Tax logic separated from ledger**
4. **Extensible financial dimensions**
5. **Immutable accounting records**
6. **Prepared for Indonesian tax integrations**

---

# Core MVP Modules

| Module | Purpose |
|------|------|
Chart of Accounts | Account structure for financial classification
Journal / Ledger Engine | Core accounting posting system
Accounts Receivable | Customer invoices and payment tracking
Accounts Payable | Vendor bills and expense recording
Tax Engine | VAT and withholding tax calculation
Financial Reports | Financial statements and accounting reports

---

# System Architecture

```mermaid
flowchart LR

BusinessEvent --> AccountingRuleEngine
AccountingRuleEngine --> JournalEntry
JournalEntry --> Ledger

Ledger --> TaxEngine
Ledger --> ReportingEngine

TaxEngine --> TaxReports
ReportingEngine --> FinancialStatements
````

---

# Key Data Entities

Core tables required for MVP:

* accounts
* journals
* journal_lines
* invoices
* invoice_items
* bills
* bill_items
* payments
* tax_rules
* tax_transactions

All financial records reference:

```
company_id
currency
created_at
audit_log
```

This ensures future support for:

* multi-company ERP
* multi-currency accounting
* tax audit traceability

---

# Indonesian Compliance (MVP Scope)

Minimum support:

### VAT (PPN)

* output VAT
* input VAT
* VAT report

### Withholding Tax

Initial support:

* PPh 23

Future expansion:

* PPh 21
* PPh 26
* PPh 4(2)

---

# Future Enterprise Features

Planned evolution:

| Feature                    | Phase   |
| -------------------------- | ------- |
| e-Faktur integration       | Phase 2 |
| e-Bupot reporting          | Phase 2 |
| Coretax integration        | Phase 3 |
| Multi-entity consolidation | Phase 3 |
| Treasury management        | Phase 4 |
| Budgeting & FP&A           | Phase 4 |

---

# Integration Points

ERP modules that will later integrate with the accounting engine:

* Sales
* Procurement
* Inventory
* Payroll
* Subscription Billing

All modules produce **accounting events** that are converted into journal entries.
