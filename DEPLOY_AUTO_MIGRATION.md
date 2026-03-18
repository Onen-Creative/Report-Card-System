# Deploy Updated Code with Auto-Migration

## What Changed

✅ Added missing tables to AutoMigrate:
- LessonRecord
- Budget, BudgetTransfer
- Requisition, RequisitionItem, RequisitionApprovalFlow
- InventoryCategory, InventoryItem, InventoryTransaction

Now these tables will be created automatically when the backend starts!

## Deploy to Production

### Step 1: Upload Changes to Server

**From your local machine:**

```bash
cd "/home/od/workspace/programming/school management system"

# Upload the updated database.go file
scp backend/internal/database/database.go root@185.208.207.16:/opt/acadistra/backend/internal/database/
```

### Step 2: Rebuild and Restart Backend

**SSH to your server:**

```bash
ssh root@185.208.207.16
cd /opt/acadistra

# Rebuild backend (this compiles the new code)
docker compose -f docker-compose.prod.yml build --no-cache backend

# Restart backend
docker compose -f docker-compose.prod.yml up -d backend

# Watch logs to see migration happen
docker compose -f docker-compose.prod.yml logs -f backend
```

You should see output like:
```
Running migrations...
Database connection successful
Migration completed successfully
Server starting on :8080
```

### Step 3: Verify Tables Were Created

```bash
# Check if tables exist
docker exec acadistra_postgres psql -U acadistra acadistra -c "\dt" | grep -E "(lesson|budget|requisition|inventory)"
```

You should see all 9 tables listed!

### Step 4: Test Your Application

Open browser and test:
- https://acadistra.com/lessons ✅
- https://acadistra.com/finance/budget ✅
- https://acadistra.com/finance/requisitions ✅
- https://acadistra.com/inventory ✅

All 500 errors should be gone!

---

## Future Deployments

From now on, whenever you add a new model:

1. Create the model file in `backend/internal/models/`
2. Add it to `AutoMigrate()` in `backend/internal/database/database.go`
3. Deploy and restart backend
4. Tables are created automatically! ✅

No more manual SQL scripts needed!

---

## Alternative: Use Git (If You Have a Repository)

```bash
# On local machine
cd "/home/od/workspace/programming/school management system"
git add backend/internal/database/database.go
git commit -m "Add missing tables to auto-migration"
git push origin main

# On server
ssh root@185.208.207.16
cd /opt/acadistra
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build backend
```

---

## Rollback (If Something Goes Wrong)

```bash
# Stop backend
docker compose -f docker-compose.prod.yml stop backend

# Restore previous version
git checkout HEAD~1 backend/internal/database/database.go

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build backend
```
