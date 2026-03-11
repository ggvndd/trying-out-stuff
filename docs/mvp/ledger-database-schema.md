# Finance ERP — Ledger Database Schema (MongoDB)

This document defines the core MongoDB collections used in the accounting system.

The schema is designed for:

- double-entry accounting
- financial audit compliance
- enterprise scaling
- Indonesian tax reporting

---

# Design Principles

1. **Journal entries are immutable**
2. **Journal lines enforce double-entry**
3. **Ledger is derived from journal_lines**
4. **Business documents reference journals**
5. **Every record includes company_id**

---

# Core Collections

accounts  
journals  
journal_lines  
invoices  
bills  
payments  
tax_rules  
tax_transactions  
audit_logs  

---

# accounts

```json
{
  "_id": "acct_1001",
  "company_id": "company_01",
  "code": "1100",
  "name": "Accounts Receivable",
  "type": "asset",
  "currency": "IDR",
  "parent_account_id": null,
  "is_active": true,
  "created_at": "2026-03-01T00:00:00Z"
}
````

Fields:

| Field             | Purpose                                |
| ----------------- | -------------------------------------- |
| code              | accounting code                        |
| type              | asset/liability/equity/revenue/expense |
| parent_account_id | hierarchical accounts                  |

---

# journals

```json
{
  "_id": "journal_123",
  "company_id": "company_01",
  "reference_type": "invoice",
  "reference_id": "inv_001",
  "status": "posted",
  "currency": "IDR",
  "created_by": "user_01",
  "created_at": "2026-03-01T10:00:00Z",
  "posted_at": "2026-03-01T10:00:10Z"
}
```

Journal types:

* invoice
* bill
* payment
* adjustment
* reversal

---

# journal_lines

```json
{
  "_id": "jline_1",
  "journal_id": "journal_123",
  "company_id": "company_01",
  "account_id": "acct_1100",
  "debit": 1000000,
  "credit": 0,
  "currency": "IDR",
  "cost_center_id": null,
  "project_id": null,
  "description": "Invoice #INV-001",
  "created_at": "2026-03-01T10:00:00Z"
}
```

Constraints enforced by service layer:

```
SUM(debit) == SUM(credit)
```

---

# invoices

```json
{
  "_id": "inv_001",
  "company_id": "company_01",
  "customer_id": "cust_001",
  "status": "issued",
  "currency": "IDR",
  "subtotal": 1000000,
  "vat_amount": 110000,
  "total": 1110000,
  "journal_id": "journal_123",
  "created_at": "2026-03-01T10:00:00Z"
}
```

---

# bills

```json
{
  "_id": "bill_001",
  "company_id": "company_01",
  "vendor_id": "vendor_01",
  "status": "approved",
  "subtotal": 500000,
  "vat_input": 55000,
  "total": 555000,
  "journal_id": "journal_456",
  "created_at": "2026-03-01T10:00:00Z"
}
```

---

# payments

```json
{
  "_id": "pay_001",
  "company_id": "company_01",
  "payment_type": "customer_payment",
  "reference_id": "inv_001",
  "amount": 1110000,
  "currency": "IDR",
  "journal_id": "journal_789",
  "created_at": "2026-03-02T10:00:00Z"
}
```

---

# tax_rules

```json
{
  "_id": "tax_ppn",
  "name": "PPN 11%",
  "tax_type": "vat",
  "rate": 0.11,
  "account_output": "acct_vat_payable",
  "account_input": "acct_vat_input"
}
```

---

# tax_transactions

```json
{
  "_id": "tax_txn_001",
  "reference_type": "invoice",
  "reference_id": "inv_001",
  "tax_rule_id": "tax_ppn",
  "tax_amount": 110000,
  "created_at": "2026-03-01T10:00:00Z"
}
```

---

# Index Strategy

Critical indexes:

accounts

```
company_id + code
```

journal_lines

```
journal_id
account_id
company_id
```

journals

```
reference_id
company_id
posted_at
```

---

# Future Schema Extensions

Additional enterprise dimensions:

cost_center_id
department_id
branch_id
project_id

These fields can be attached to **journal_lines** without redesigning the ledger.
