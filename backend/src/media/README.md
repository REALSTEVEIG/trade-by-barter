# TradeByBarter Media Upload Pipeline

## Overview
This module provides a comprehensive media management system for the TradeByBarter Nigerian barter marketplace, featuring advanced upload capabilities, multi-provider storage, and Nigerian network optimizations.

## Features Implemented

### Core Infrastructure
- **Enhanced Media Schema**: Comprehensive database model with processing status, variants, and Nigerian context
- **Multi-Provider Storage**: Abstracted storage system supporting Local, S3, and extensible to Cloudinary/Azure
- **Storage Provider Factory**: Intelligent provider selection based on file type, size, and region
- **Comprehensive DTOs**: Type-safe data transfer objects for all operations

###  Upload Capabilities
- **Single File Upload**: `/api/v1/media/upload/single`
- **Multiple File Upload**: `/api/v1/media/upload/multiple`
- **File Validation**: Size limits, MIME type checking, and integrity validation
- **Storage Quota Management**: Per-user storage limits with automatic tracking

###  Media Management
- **Media Retrieval**: Get media details with access tracking
- **User Media Listing**: Paginated listing with filtering
- **Storage Statistics**: User quota and usage tracking
- **Media Deletion**: Secure deletion with storage cleanup

###  Nigerian Context Optimizations
- **Regional Storage Selection**: Lagos, Abuja, Port Harcourt optimizations
- **Bandwidth Optimization**: Configurable compression levels
- **Quality Variants**: Multiple quality levels for different network conditions
- **Upload Region Tracking**: Geographic performance monitoring

## API Endpoints

### Upload Endpoints
```typescript
POST /api/v1/media/upload/single
POST /api/v1/media/upload/multiple
POST /api/v1/media/upload/chunk        // Placeholder for chunked upload
```

### Management Endpoints
```typescript
GET    /api/v1/media/:id               // Get media details
DELETE /api/v1/media/:id               // Delete media
GET    /api/v1/media/my/files          // Current user's media
GET    /api/v1/media/my/storage        // Storage statistics
```

### Processing Endpoints (Placeholders)
```typescript
POST /api/v1/media/:id/process         // Trigger processing
POST /api/v1/media/:id/thumbnail       // Generate thumbnail
POST /api/v1/media/:id/watermark       // Add watermark
POST /api/v1/media/:id/moderate        // Content moderation
```

## Storage Providers

### Local Storage Provider
- Development-friendly file storage
- Automatic directory management
- Cleanup utilities for empty directories
- Storage statistics tracking

### S3 Storage Provider (Mock)
- AWS S3 compatible interface
- Simulated network delays and failures
- Multipart upload support preparation
- Signed URL generation

### Storage Provider Factory
- Intelligent provider selection
- File type-based routing
- Regional optimization for Nigeria
- Load balancing capabilities
- Health monitoring

## Data Models

### Media Entity
```typescript
interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  category: MediaCategory;
  entityType: MediaEntityType;
  status: MediaStatus;
  storageProvider: StorageProvider;
  variants: MediaVariant[];
  // ... extensive metadata
}
```

### Storage Quota
```typescript
interface UserStorageQuota {
  userId: string;
  totalQuota: bigint;
  usedStorage: bigint;
  mediaCount: number;
  isPremium: boolean;
  // ... usage tracking
}
```

## Configuration

### Environment Variables
```bash
# Storage Configuration
MEDIA_DEFAULT_PROVIDER=local
MEDIA_LOCAL_PATH=uploads/media
MEDIA_PUBLIC_URL=http://localhost:4000

# AWS S3 Configuration
AWS_S3_BUCKET=tradebybarter-media
AWS_S3_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# File Limits
MEDIA_MAX_FILE_SIZE=52428800  # 50MB
MEDIA_ALLOWED_TYPES=image/jpeg,image/png,video/mp4,audio/mp3
```

### Provider Configuration
```typescript
// Regional optimization
MEDIA_REGION_CONFIG={
  "lagos": "s3",
  "abuja": "s3", 
  "port-harcourt": "local"
}

// File type routing
MEDIA_PROVIDER_CONFIG={
  "images": "cloudinary",
  "videos": "s3",
  "documents": "local"
}
```

## Usage Examples

### Single File Upload
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('entityType', 'LISTING');
formData.append('category', 'LISTING_IMAGE');
formData.append('uploadRegion', 'lagos');

const response = await fetch('/api/v1/media/upload/single', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### Get User Media
```typescript
const media = await fetch('/api/v1/media/my/files?page=1&limit=20', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Nigerian Network Optimizations

### Bandwidth Considerations
- **Low Quality**: 400px width, 60% quality
- **Medium Quality**: 800px width, 75% quality  
- **High Quality**: 1200px width, 85% quality

### Regional Performance
- **Lagos**: S3 with CDN optimization
- **Abuja**: Balanced local/cloud storage
- **Port Harcourt**: Local storage priority
- **Other Regions**: Automatic fallback

### Compression Levels
- **NONE**: Original file
- **LOW**: Minimal compression
- **MEDIUM**: Balanced quality/size
- **HIGH**: Aggressive compression
- **MAXIMUM**: Smallest file size

## Security Features

### File Validation
- MIME type verification
- Magic number checking
- File size limits
- Virus scanning (placeholder)

### Access Control
- User-based ownership
- Entity-level permissions
- Secure URL generation
- Access tracking

### Content Moderation
- NSFW detection (placeholder)
- Content flagging system
- Manual review workflow
- Automated compliance

## Performance Features

### Caching Strategy
- CDN integration for static assets
- Regional edge caching
- Intelligent cache invalidation
- Bandwidth optimization

### Processing Queue
- Background processing jobs
- Priority-based queuing
- Retry mechanisms
- Progress tracking

## Monitoring & Analytics

### Usage Tracking
- Upload success/failure rates
- Storage usage by user/region
- Popular file types
- Performance metrics

### Health Monitoring
- Provider availability
- Response times
- Error rates
- Capacity planning

## Future Enhancements

###  Planned Features
- **Chunked Upload**: Resume interrupted uploads
- **Background Processing**: BullMQ integration
- **Advanced Processing**: Sharp/FFmpeg integration
- **Content Moderation**: AI-powered detection
- **Analytics Dashboard**: Real-time insights
- **Backup & Recovery**: Multi-region replication

###  Nigerian Market Features
- **Mobile Money Integration**: Payment for premium storage
- **Offline Sync**: Progressive upload capabilities
- **Data Savings Mode**: Ultra-compressed variants
- **Local CDN**: Nigerian data center integration

## Testing

### Unit Tests
```bash
npm run test media
```

### Integration Tests
```bash
npm run test:e2e media
```

### Load Testing
```bash
# Test upload performance
npm run test:load upload
```

## Deployment

### Production Setup
1. Configure storage providers
2. Set up CDN distribution
3. Configure regional routing
4. Enable monitoring
5. Set up backup policies

### Scaling Considerations
- Horizontal scaling with multiple providers
- Regional distribution for Nigerian users
- Queue-based processing for large files
- Caching strategy for popular content

## Support

For technical support or feature requests, please contact the TradeByBarter development team.