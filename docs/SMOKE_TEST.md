# Invento — Smoke Test Checklist

## Pre-Demo Setup
- [ ] Backend running: uvicorn main:app --reload
- [ ] Frontend running: npm run dev
- [ ] Backend health: http://127.0.0.1:8000/health returns {"status":"ok"}
- [ ] Frontend loads: http://localhost:3000 shows login page
- [ ] Seed data loaded: 6 products, 3 warehouses visible

## Demo Path Checklist

### 1. Login
- [ ] Login page loads
- [ ] Enter any email/password
- [ ] Redirects to /dashboard

### 2. Dashboard
- [ ] 6 KPI cards visible with gradient icons
- [ ] Weekly chart renders
- [ ] Recent activity table shows rows

### 3. Products
- [ ] Products page loads with 6 rows
- [ ] Search filters rows
- [ ] "+ Add Product" opens drawer
- [ ] Table shows status badges (Healthy / Low Stock / Out of Stock)

### 4. Receipts
- [ ] Receipts page loads
- [ ] Table shows receipts
- [ ] "+ New Receipt" opens drawer

### 5. Transfers
- [ ] Transfers page loads
- [ ] Table shows From → To columns
- [ ] "+ New Transfer" drawer shows before/after preview

### 6. Deliveries
- [ ] Deliveries page loads
- [ ] Table shows customer + source
- [ ] Drawer shows available stock warning

### 7. Adjustments
- [ ] Adjustments page loads
- [ ] Table shows system vs counted diff
- [ ] Drawer shows live difference calc

### 8. Move History
- [ ] History page loads with audit table
- [ ] Operation pills are colored
- [ ] Click row opens detail drawer

### 9. Settings / Warehouses
- [ ] Page shows warehouse cards
- [ ] Nested locations visible
- [ ] "+ Add Warehouse" drawer opens

### 10. Theme
- [ ] Click moon icon in topbar → dark mode
- [ ] Click sun icon → light mode
- [ ] Refresh → theme persists

### 11. Responsive
- [ ] Shrink browser to 768px → hamburger menu appears
- [ ] Click hamburger → sidebar slides in
- [ ] Tables scroll horizontally

## Known Issues
- (List any issues found during testing)

## Demo Video Timestamps
- 0:00 — Intro (Welcome back dashboard)
- 0:15 — Products overview
- 0:35 — Receipts + stock increase
- 0:55 — Transfers + location change
- 1:15 — Delivery + stock decrease
- 1:35 — Adjustment + physical count
- 1:55 — Move History (audit trail)
- 2:15 — Dark mode toggle + close
