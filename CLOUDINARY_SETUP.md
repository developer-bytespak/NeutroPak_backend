# Cloudinary Setup Guide

This guide covers how to set up and use Cloudinary for media/image storage in the NeutroPak backend.

## 1. Get Cloudinary Credentials

1. **Sign up / Log in** to [Cloudinary](https://cloudinary.com/)
2. Navigate to your **Dashboard**
3. Find your credentials:
   - **Cloud Name** - Your unique cloud identifier
   - **API Key** - Your public API key
   - **API Secret** - Your private API secret (keep this secure)

## 2. Configure Environment Variables

Add the following to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Replace the values with your actual Cloudinary credentials.

## 3. API Endpoints

All upload endpoints require authentication. Include your JWT token in the `Authorization` header.

### Upload Single Image
**POST** `/api/upload/image`

**Query Parameters:**
- `folder` (optional) - Destination folder in Cloudinary (default: `neutropak/media`)

**Request:**
- Use `FormData` with field name: `file`
- Supported types: JPEG, PNG, GIF, WebP, SVG, PDF, MP4, WebM
- Max file size: 50MB

**Example:**
```bash
curl -X POST http://localhost:3001/api/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@image.jpg" \
  -F "folder=neutropak/products"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "public_id": "neutropak/products/xyz123",
    "url": "https://res.cloudinary.com/...",
    "width": 1200,
    "height": 800,
    "size": 245000
  },
  "message": "Image uploaded successfully",
  "statusCode": 201
}
```

### Upload Multiple Images
**POST** `/api/upload/multiple`

**Query Parameters:**
- `folder` (optional) - Destination folder in Cloudinary (default: `neutropak/media`)

**Request:**
- Use `FormData` with field name: `files` (can include up to 10 files)

**Example:**
```bash
curl -X POST http://localhost:3001/api/upload/multiple \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@image1.jpg" \
  -F "files=@image2.png" \
  -F "folder=neutropak/products"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "public_id": "neutropak/products/xyz123",
      "url": "https://res.cloudinary.com/...",
      "width": 1200,
      "height": 800,
      "size": 245000
    }
  ],
  "message": "2 files uploaded successfully",
  "statusCode": 201
}
```

### Delete Image
**DELETE** `/api/upload/image`

**Request Body:**
```json
{
  "public_id": "neutropak/products/xyz123"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3001/api/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"public_id":"neutropak/products/xyz123"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "public_id": "neutropak/products/xyz123"
  },
  "message": "Image deleted successfully",
  "statusCode": 200
}
```

## 4. Using with Products

When creating or updating products, include the image URL returned from the upload endpoint:

**Create Product with Cloudinary Image:**
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "category": "supplements",
    "stock": 10,
    "imageUrl": "https://res.cloudinary.com/.../image.jpg"
  }'
```

## 5. Frontend Integration (Next.js)

### Upload from React Component

```typescript
const uploadImage = async (file: File, folder: string = 'neutropak/products') => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/upload/image?folder=${folder}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.data.url; // Returns the Cloudinary URL
};

// Usage
const file = event.target.files[0];
const imageUrl = await uploadImage(file);
```

## 6. Security Notes

- **API Secret**: Never expose this in frontend code or client-side requests
- **Authentication**: All upload endpoints require valid JWT tokens
- **File Types**: Validation is performed both client and server-side
- **Cleanup**: Temporary files are automatically deleted after upload
- **Rate Limiting**: Consider adding rate limiting for production

## 7. Troubleshooting

**Error: "Cloudinary credentials not configured"**
- Verify all three env variables are set correctly
- Restart the server after changing env variables

**Error: "Invalid file type"**
- Check that your file is one of the supported types
- Verify file size is under 50MB

**Error: "Upload failed"**
- Check Cloudinary account quota
- Verify internet connection
- Check server logs for detailed error message

## 8. Advanced Usage

### Custom Transformations
Cloudinary supports URL-based transformations. Examples:

```
// Resize to 300x300
https://res.cloudinary.com/cloud/image/upload/w_300,h_300/image.jpg

// Quality optimization
https://res.cloudinary.com/cloud/image/upload/q_80/image.jpg

// Format conversion (WebP)
https://res.cloudinary.com/cloud/image/upload/f_webp/image.jpg

// Combine multiple transformations
https://res.cloudinary.com/cloud/image/upload/w_300,h_300,q_80,f_webp/image.jpg
```

For more transformations, visit [Cloudinary Transformation Documentation](https://cloudinary.com/documentation/image_transformation_reference)
