# Finance ERP MVP — API Contract (Endpoint List)

This document lists the initial API surface for the finance module.

Total expected endpoints:

~40–50 APIs.

---

# Authentication

POST /auth/login  
POST /auth/logout  
GET /auth/me

---

# Chart of Accounts

GET /accounts  
POST /accounts  
GET /accounts/{account_id}  
PUT /accounts/{account_id}  
DELETE /accounts/{account_id}

---

# Journals

POST /journals  
GET /journals  
GET /journals/{journal_id}  
POST /journals/{journal_id}/post  
POST /journals/{journal_id}/reverse

---

# Ledger

GET /ledger  
GET /ledger/account/{account_id}

---

# Invoices (Accounts Receivable)

POST /invoices  
GET /invoices  
GET /invoices/{invoice_id}  
PUT /invoices/{invoice_id}  
POST /invoices/{invoice_id}/cancel

---

# Invoice Payments

POST /invoice-payments  
GET /invoice-payments

---

# Vendor Bills (Accounts Payable)

POST /bills  
GET /bills  
GET /bills/{bill_id}  
PUT /bills/{bill_id}  
POST /bills/{bill_id}/approve

---

# Bill Payments

POST /bill-payments  
GET /bill-payments

---

# Tax Engine

POST /tax/calculate  
GET /tax/vat-report  
GET /tax/withholding-report

---

# Financial Reports

GET /reports/trial-balance  
GET /reports/balance-sheet  
GET /reports/income-statement  
GET /reports/general-ledger

---

# Accounting Period

POST /accounting/period-close  
GET /accounting/period-status

---

# Admin

GET /users  
POST /users  
PUT /users/{user_id}  
DELETE /users/{user_id}

---

# Future API Extensions

Reserved modules for future expansion:

- /efaktur
- /ebupot
- /treasury
- /budget
- /consolidation
- /tax-filing

These endpoints will integrate with **Indonesian tax systems and enterprise finance workflows**.
