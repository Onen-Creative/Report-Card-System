#!/bin/bash

# Complete Database Sync Script
# Syncs all missing tables to production

echo "🔄 Syncing ALL Missing Tables to Production"
echo "=============================================="
echo ""

# Apply SQL script
echo "Creating tables: lessons, budgets, requisitions, inventory..."
docker exec -i acadistra_postgres psql -U acadistra acadistra < sync_all_tables.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All tables created successfully!"
    echo ""
    echo "Verifying tables..."
    docker exec acadistra_postgres psql -U acadistra acadistra -c "
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'lesson_records', 
            'budgets', 
            'budget_transfers', 
            'requisitions', 
            'requisition_items', 
            'requisition_approval_flows',
            'inventory_categories',
            'inventory_items',
            'inventory_transactions'
        )
        ORDER BY table_name;
    "
    
    echo ""
    echo "Next steps:"
    echo "1. Restart backend: docker compose -f docker-compose.prod.yml restart backend"
    echo "2. Test pages:"
    echo "   - Lessons: https://acadistra.com/lessons"
    echo "   - Budget: https://acadistra.com/finance/budget"
    echo "   - Requisitions: https://acadistra.com/finance/requisitions"
    echo "   - Inventory: https://acadistra.com/inventory"
else
    echo ""
    echo "❌ Failed to create tables"
    echo "Check the error messages above"
    exit 1
fi
