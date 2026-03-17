# Web Vitals Implementation

Complete web performance monitoring system for Acadistra.

## Features

- **Core Web Vitals Tracking**
  - CLS (Cumulative Layout Shift)
  - FID (First Input Delay)
  - FCP (First Contentful Paint)
  - LCP (Largest Contentful Paint)
  - TTFB (Time to First Byte)

- **Custom Metrics**
  - Page load times
  - User action tracking
  - API call performance

- **Backend Storage**
  - PostgreSQL database storage
  - Per-school and per-user tracking
  - Statistical analysis (P50, P75, P95)

## Architecture

### Frontend (`frontend/src/utils/webVitals.ts`)
- Collects Core Web Vitals using `web-vitals` library
- Sends metrics to backend API
- Tracks custom performance metrics

### Backend
- **Model**: `backend/internal/models/web_vitals.go`
- **Handler**: `backend/internal/handlers/web_vitals_handler.go`
- **Migration**: `backend/migrations/20260208000000_create_web_vitals_table.sql`

### API Endpoints

#### Record Web Vital
```
POST /api/v1/analytics/web-vitals
Authorization: Bearer <token>

{
  "name": "LCP",
  "value": 2500.5,
  "rating": "good",
  "delta": 100.2,
  "id": "v3-1234567890"
}
```

#### Get Statistics
```
GET /api/v1/analytics/web-vitals/stats?name=LCP
Authorization: Bearer <token>

Response:
{
  "stats": [
    {
      "name": "LCP",
      "average": 2345.67,
      "p50": 2100.0,
      "p75": 2800.0,
      "p95": 3500.0,
      "count": 1250
    }
  ]
}
```

## Deployment

### 1. Run Migration
```bash
docker exec acadistra_backend ./main migrate
```

### 2. Restart Services
```bash
docker compose -f docker-compose.prod.yml restart backend frontend caddy
```

### 3. Verify
Check browser console - no 404 errors for `/api/analytics/web-vitals`

## Monitoring

### View Stats (System Admin)
```bash
curl -H "Authorization: Bearer <token>" \
  https://acadistra.com/api/v1/analytics/web-vitals/stats
```

### Database Query
```sql
SELECT 
  name,
  AVG(value) as avg_value,
  COUNT(*) as count
FROM web_vitals
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY name;
```

## Performance Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP    | ≤2.5s | 2.5s - 4.0s | >4.0s |
| FID    | ≤100ms | 100ms - 300ms | >300ms |
| CLS    | ≤0.1 | 0.1 - 0.25 | >0.25 |
| FCP    | ≤1.8s | 1.8s - 3.0s | >3.0s |
| TTFB   | ≤800ms | 800ms - 1800ms | >1800ms |

## Custom Metrics

Track custom performance metrics:

```typescript
import { trackCustomMetric } from '@/utils/webVitals'

// Track page load
const endTracking = trackPageLoad('dashboard')
// ... page loads
endTracking()

// Track user action
const endAction = trackUserAction('submit_form')
// ... action completes
endAction()

// Track API call
const endAPI = trackAPICall('students/list')
// ... API call completes
endAPI(true) // success
```

## Privacy

- Only authenticated users' metrics are tracked
- No PII is collected
- User agent and URL are stored for debugging
- Data is isolated per school (multi-tenant)

## Disable Web Vitals

To disable tracking, comment out in `frontend/src/app/providers.tsx`:

```typescript
// initWebVitals()
```
