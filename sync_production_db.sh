#!/bin/bash

# Script to sync production database with development structure

echo "🔄 Syncing Production Database with Development"
echo "=============================================="
echo ""

# Apply to production database
echo "Creating lesson_records table..."

docker exec -i acadistra_postgres psql -U acadistra acadistra << 'EOF'
-- Create lesson_records table (matching development structure exactly)
CREATE TABLE IF NOT EXISTS lesson_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id VARCHAR(36) NOT NULL,
    class_id VARCHAR(36) NOT NULL,
    subject_id VARCHAR(36) NOT NULL,
    teacher_id UUID NOT NULL,
    lesson_date DATE NOT NULL,
    lesson_time TIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 40,
    topic VARCHAR(500) NOT NULL,
    sub_topic VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    reason_missed TEXT,
    notes TEXT,
    recorded_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT lesson_records_status_check CHECK (status IN ('completed', 'missed'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lesson_records_school ON lesson_records(school_id);
CREATE INDEX IF NOT EXISTS idx_lesson_records_class ON lesson_records(class_id);
CREATE INDEX IF NOT EXISTS idx_lesson_records_subject ON lesson_records(subject_id);
CREATE INDEX IF NOT EXISTS idx_lesson_records_teacher ON lesson_records(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lesson_records_date ON lesson_records(lesson_date);
CREATE INDEX IF NOT EXISTS idx_lesson_records_status ON lesson_records(status);
CREATE INDEX IF NOT EXISTS idx_lesson_records_school_date ON lesson_records(school_id, lesson_date);

SELECT 'lesson_records table created successfully' AS status;
EOF

echo ""
echo "✅ Database sync completed!"
echo ""
echo "Next steps:"
echo "1. Restart backend: docker compose -f docker-compose.prod.yml restart backend"
echo "2. Test lessons page: https://acadistra.com/lessons"
