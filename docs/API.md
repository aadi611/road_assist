# CivicReport API Documentation

## Overview
The CivicReport API is a RESTful service that enables citizens to report civic infrastructure issues through a mobile application. The system uses AI-powered analysis and automated workflows to process reports and engage with government officials.

## Base URL
```
https://api.civicreport.com/v1
```

## Authentication
All API requests require authentication using JWT Bearer tokens obtained through Firebase Authentication.

```http
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting
- **Rate Limit**: 100 requests per minute per user
- **Burst Limit**: 20 requests per 10 seconds
- **Headers**: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Endpoints

### Authentication

#### POST /auth/login
Authenticate user with phone number and OTP.

**Request Body:**
```json
{
  "phone_number": "+1234567890",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "phone_number": "+1234567890",
      "is_verified": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout
Logout user and invalidate tokens.

### Reports

#### POST /reports
Submit a new infrastructure report with image.

**Content-Type:** `multipart/form-data`

**Request:**
```
image: File (required)
location: {
  "latitude": 40.7128,
  "longitude": -74.0060
}
timestamp: "2024-01-01T12:00:00Z"
user_notes: "Large pothole blocking traffic" (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report_id": "uuid",
    "status": "submitted",
    "estimated_processing_time": "2-5 minutes"
  }
}
```

#### GET /reports/{id}
Get detailed report status and results.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "completed",
    "issue_type": "pothole",
    "severity": "high",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "address": {
      "formatted": "123 Main St, New York, NY 10001",
      "components": {
        "street_number": "123",
        "route": "Main St",
        "locality": "New York",
        "administrative_area_level_1": "NY"
      }
    },
    "description": "Large pothole observed on Main Street requiring immediate attention for public safety.",
    "ai_analysis": {
      "confidence": 0.95,
      "urgency_score": 8,
      "details": {
        "size": "large",
        "condition": "severe damage",
        "safety_hazard": true
      }
    },
    "progress": {
      "current_step": "completed",
      "completed_steps": [
        "location_processing",
        "ai_analysis",
        "official_identification",
        "certificate_generation",
        "social_posting"
      ],
      "estimated_completion": "2024-01-01T12:05:00Z"
    },
    "results": {
      "certificate_url": "https://certificates.civicreport.com/uuid.pdf",
      "tweet_url": "https://twitter.com/user/status/123456789",
      "officials_contacted": [
        {
          "name": "John Smith",
          "position": "Ward Councillor",
          "twitter_handle": "@johnsmith_ward"
        }
      ]
    },
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:05:00Z"
  }
}
```

#### GET /reports
List user's reports with pagination and filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by status (`submitted`, `processing`, `completed`, `failed`)
- `issue_type`: Filter by issue type
- `sort`: Sort field (`created_at`, `updated_at`, `severity`)
- `order`: Sort order (`asc`, `desc`)

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "uuid",
        "status": "completed",
        "issue_type": "pothole",
        "severity": "high",
        "description": "Large pothole...",
        "created_at": "2024-01-01T12:00:00Z",
        "certificate_url": "https://certificates.civicreport.com/uuid.pdf"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### PATCH /reports/{id}
Update report (user notes only).

**Request Body:**
```json
{
  "user_notes": "Updated description of the issue"
}
```

#### DELETE /reports/{id}
Delete a report (only if not yet processed).

### Public Verification

#### GET /verify/{report_id}
Publicly verify report authenticity (no authentication required).

**Response:**
```json
{
  "success": true,
  "data": {
    "report": {
      "id": "uuid",
      "location": "123 Main St, New York, NY",
      "issue_type": "pothole",
      "severity": "high",
      "timestamp": "2024-01-01T12:00:00Z",
      "status": "completed"
    },
    "certificate_url": "https://certificates.civicreport.com/uuid.pdf",
    "is_valid": true,
    "verification_hash": "sha256hash"
  }
}
```

### Health Checks

#### GET /health/live
Liveness probe for Kubernetes.

#### GET /health/ready
Readiness probe for Kubernetes.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "external_apis": "ok"
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "phone_number",
      "issue": "Invalid phone number format"
    },
    "request_id": "uuid",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_IMAGE` | 400 | Image format not supported or corrupted |
| `LOCATION_REQUIRED` | 400 | Valid GPS coordinates are required |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests, please try again later |
| `UNAUTHORIZED` | 401 | Invalid or expired authentication token |
| `FORBIDDEN` | 403 | Access denied for this resource |
| `NOT_FOUND` | 404 | Resource not found |
| `PROCESSING_FAILED` | 500 | Report processing failed, please retry |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## WebSocket Events (Optional)

For real-time updates, connect to:
```
wss://api.civicreport.com/v1/reports/{report_id}/events
```

### Event Types

```javascript
// Report status update
{
  "type": "status_update",
  "data": {
    "report_id": "uuid",
    "status": "processing",
    "step": "ai_analysis",
    "progress": 45
  }
}

// Processing complete
{
  "type": "processing_complete",
  "data": {
    "report_id": "uuid",
    "certificate_url": "https://...",
    "tweet_url": "https://..."
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @civicreport/api-client
```

```typescript
import { CivicReportClient } from '@civicreport/api-client';

const client = new CivicReportClient({
  baseUrl: 'https://api.civicreport.com/v1',
  apiKey: 'your-api-key'
});

const report = await client.reports.create({
  image: file,
  location: { latitude: 40.7128, longitude: -74.0060 }
});
```

## Postman Collection

Download our Postman collection: [CivicReport API.postman_collection.json](./postman/CivicReport_API.postman_collection.json)

## Testing

### Test Environment
```
Base URL: https://api-staging.civicreport.com/v1
```

### Test Credentials
```
Phone: +1234567890
OTP: 123456 (for testing only)
```

## Support

For API support, please contact:
- **Email**: api-support@civicreport.com
- **Documentation**: https://docs.civicreport.com
- **Status Page**: https://status.civicreport.com
