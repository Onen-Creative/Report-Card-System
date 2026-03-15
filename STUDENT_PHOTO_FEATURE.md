# Student Photo Feature Implementation

## Overview
Added comprehensive student photo upload, display, and optimization functionality across the entire system.

## Features Implemented

### 1. Photo Upload on Forms
- **Create Student Form** (`/students/register/page.tsx`)
  - Optional photo upload field with preview
  - Shows preview before submission
  - Uploads photo before creating student record
  
- **Edit Student Form** (`/students/[id]/edit/page.tsx`)
  - Shows existing photo if available
  - Allows uploading new photo to replace existing one
  - Maintains existing photo if no new photo uploaded

### 2. Photo Display

#### Students List (`/students/page.tsx`)
- Displays student photos as circular avatars in the table
- Falls back to gradient avatar with initials if no photo exists
- Photo URL added to Student interface

#### Student Detail Page (`/students/[id]/page.tsx`)
- Large circular photo in header (96x96px)
- Falls back to gradient avatar with initials
- Photo displayed prominently next to student name

#### Report Cards
- **ReportCardTemplate** - Photo in top right corner (60x60px)
- **PrimaryReportCard** - Photo in header next to school logo (55x55px)
- All report cards show student photo or gradient avatar fallback
- Photos properly sized for printing

### 3. Backend Implementation

#### Image Optimization (`backend/internal/utils/image.go`)
```go
// OptimizeStudentPhoto - Resizes and compresses images
- Resizes to max width of 400px (maintains aspect ratio)
- Converts all formats to JPEG
- Compresses with 85% quality
- Uses Lanczos3 algorithm for high-quality resizing

// CreateThumbnail - Creates square thumbnails
- Creates 150x150px square thumbnail
- Compresses with 80% quality
- Smart cropping to maintain subject
```

#### Upload Handler (`backend/internal/handlers/upload_handler.go`)
```go
// UploadStudentPhoto endpoint
- Validates file type (JPG, JPEG, PNG only)
- Validates file size (max 10MB)
- Optimizes image automatically
- Creates thumbnail
- Saves both versions
- Returns URLs and space savings statistics
```

#### Routes (`backend/cmd/api/main.go`)
- Added `/api/v1/upload/student-photo` endpoint
- Added `/photos` static file serving route
- Protected with authentication middleware

### 4. Database Schema
Student model already has `photo_url` field:
```go
PhotoURL string `gorm:"type:varchar(500)" json:"photo_url"`
```

## Optimization Results

### Storage Efficiency
- **Original photo**: ~3MB (typical phone photo)
- **Optimized photo**: ~75KB (400px width, 85% quality)
- **Thumbnail**: ~15KB (150x150px, 80% quality)
- **Space saved**: 97.5% reduction

### Capacity
With 50GB storage:
- Can store photos for **15-20 schools**
- Approximately **7,500-10,000 students**
- Total storage: <1GB for all photos

## Technical Details

### Image Processing
- **Library**: `github.com/nfnt/resize`
- **Algorithm**: Lanczos3 (high-quality interpolation)
- **Format**: JPEG (better compression than PNG for photos)
- **Quality**: 85% (optimal balance between size and quality)

### File Structure
```
public/
  photos/
    {uuid}.jpg          # Optimized photo (400px max width)
    thumbs/
      {uuid}.jpg        # Thumbnail (150x150px)
```

### API Response
```json
{
  "photo_url": "/photos/{uuid}.jpg",
  "thumbnail_url": "/photos/thumbs/{uuid}.jpg",
  "original_size": 3145728,
  "optimized_size": 76800,
  "saved_percent": "97.6%"
}
```

## Usage

### Frontend Upload
```typescript
const formData = new FormData()
formData.append('photo', photoFile)

const res = await fetch(`${API_URL}/upload/student-photo`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
})

const result = await res.json()
// result.photo_url contains the URL to use
```

### Display Photo
```tsx
{student.photo_url ? (
  <img 
    src={student.photo_url.startsWith('http') 
      ? student.photo_url 
      : `http://localhost:8080${student.photo_url}`
    }
    alt="Student"
    className="w-24 h-24 rounded-full object-cover"
  />
) : (
  <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center">
    <span className="text-2xl font-bold text-white">
      {student.first_name[0]}{student.last_name[0]}
    </span>
  </div>
)}
```

## Files Modified

### Frontend
1. `/frontend/src/app/students/register/page.tsx` - Added photo upload
2. `/frontend/src/app/students/[id]/edit/page.tsx` - Added photo upload
3. `/frontend/src/app/students/page.tsx` - Display photos in list
4. `/frontend/src/app/students/[id]/page.tsx` - Display photo in detail page
5. `/frontend/src/components/ReportCard/ReportCardTemplate.tsx` - Display photo on report card
6. `/frontend/src/components/ReportCard/PrimaryReportCard.tsx` - Display photo on report card

### Backend
1. `/backend/internal/utils/image.go` - Image optimization utilities (NEW)
2. `/backend/internal/handlers/upload_handler.go` - Photo upload endpoint
3. `/backend/cmd/api/main.go` - Route registration
4. `/backend/internal/models/models.go` - Already had photo_url field

## Benefits

1. **Professional Appearance**: Photos on report cards and student profiles
2. **Easy Identification**: Visual recognition in student lists
3. **Storage Efficient**: 97.5% space savings through optimization
4. **Fast Loading**: Small file sizes load quickly even on slow connections
5. **Automatic**: No manual intervention needed for optimization
6. **Quality Preserved**: 85% quality maintains visual fidelity
7. **Scalable**: Can handle thousands of students on modest hardware

## Future Enhancements

1. Bulk photo upload via Excel import
2. Photo cropping tool in UI
3. Multiple photo versions (ID card size, etc.)
4. Photo approval workflow
5. Automatic face detection and centering
6. Photo history/versioning
