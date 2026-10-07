# Server.py Refactoring Guide

## Current State
- **File**: `/app/backend/server.py`
- **Lines**: 13,720
- **Routes**: 322 API endpoints
- **Status**: Monolithic, needs modularization

## New Structure

```
/app/backend/
├── main.py              # New entry point (future)
├── server.py            # Current monolith (to be deprecated)
├── core/
│   ├── __init__.py
│   ├── database.py      # MongoDB connection
│   ├── dependencies.py  # Auth dependencies (get_current_user)
│   └── enums.py         # All enums (UserRole, ProjectStatus, etc.)
├── models/
│   ├── __init__.py
│   ├── user.py          # User, UserSession, UserInvitation
│   ├── project.py       # Project, ProjectCreate, ProjectUpdate
│   └── lead.py          # Lead, LeadCreate, LeadStageUpdate
├── routes/
│   ├── __init__.py
│   ├── auth.py          # Authentication routes (8 routes)
│   ├── crm.py           # CRM routes (27 routes)
│   ├── cre.py           # CRE routes (13 routes) ✅ DONE
│   ├── projects.py      # Project routes (24 routes)
│   ├── procurement.py   # Procurement routes (27 routes)
│   ├── expenses.py      # Expense routes (20 routes)
│   ├── work_orders.py   # Work order routes (17 routes)
│   ├── site_engineer.py # Site engineer routes (16 routes)
│   ├── hr.py            # HR routes (13 routes)
│   ├── financial.py     # Financial routes (13 routes)
│   └── accountant.py    # Accountant routes (13 routes)
└── services/
    ├── __init__.py
    ├── email_service.py # Email notifications (Resend)
    ├── pdf_service.py   # PDF generation
    └── audit_service.py # Audit logging
```

## Migration Progress

### Phase 1: Core Infrastructure ✅
- [x] Create `/core/database.py`
- [x] Create `/core/enums.py`
- [x] Create `/core/dependencies.py`

### Phase 2: Models ✅
- [x] Create `/models/user.py`
- [x] Create `/models/project.py`
- [x] Create `/models/lead.py`

### Phase 3: Routes (In Progress)
- [x] `/routes/cre.py` - CRE routes (13 routes) ✅
- [ ] `/routes/auth.py` - Authentication (8 routes)
- [ ] `/routes/crm.py` - CRM (27 routes)
- [ ] `/routes/projects.py` - Projects (24 routes)
- [ ] `/routes/procurement.py` - Procurement (27 routes)
- [ ] `/routes/expenses.py` - Expenses (20 routes)
- [ ] `/routes/work_orders.py` - Work Orders (17 routes)
- [ ] `/routes/site_engineer.py` - Site Engineer (16 routes)
- [ ] `/routes/hr.py` - HR (13 routes)
- [ ] `/routes/financial.py` - Financial (13 routes)
- [ ] `/routes/accountant.py` - Accountant (13 routes)

### Phase 4: Services
- [ ] `/services/email_service.py`
- [ ] `/services/pdf_service.py`
- [ ] `/services/audit_service.py`

## Route Categories (server.py)

| Category | Routes | Lines (approx) | Priority |
|----------|--------|----------------|----------|
| auth | 8 | ~400 | P1 |
| crm | 27 | ~1500 | P1 |
| cre | 13 | ~600 | ✅ Done |
| projects | 24 | ~1200 | P1 |
| procurement | 27 | ~1400 | P2 |
| expenses | 20 | ~1000 | P2 |
| work-orders | 17 | ~900 | P2 |
| site-engineer | 16 | ~800 | P2 |
| hr | 13 | ~700 | P3 |
| financial | 13 | ~700 | P3 |
| accountant | 13 | ~700 | P3 |
| packages | 8 | ~400 | P3 |
| boq | 8 | ~400 | P3 |
| Others | ~135 | ~4000 | P3 |

## How to Migrate a Route Module

1. **Create the route file** in `/routes/`
2. **Copy relevant routes** from `server.py`
3. **Update imports** to use `core.*` and `models.*`
4. **Add router** to `/routes/__init__.py`
5. **Include router** in `main.py`
6. **Comment out** old routes in `server.py`
7. **Test** thoroughly
8. **Delete** commented code from `server.py`

## Important Notes

- **Don't break production**: server.py still runs. New routes are added alongside.
- **Test each migration**: Before removing from server.py, ensure new route works.
- **Keep backwards compatibility**: Use same endpoint paths.
- **Document changes**: Update this file as progress is made.

## Next Steps

1. Complete migration of high-priority routes (auth, crm, projects)
2. Update `main.py` to include new routers
3. Gradually deprecate routes in `server.py`
4. Once all routes migrated, switch entry point to `main.py`
5. Archive `server.py`

## Deploying Backend Changes

A push to `main` where every changed file is under `backend/` skips the frontend build and upload
(see `.github/workflows/deploy-production.yml`), so it deploys in about 30 seconds instead of ~2.5 minutes.
Keep backend-only fixes in their own commit/push to get the fast path.
