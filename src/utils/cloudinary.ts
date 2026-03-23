import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify Cloudinary is configured
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️ Cloudinary credentials not fully configured');
} else {
  console.log('✅ Cloudinary configured with cloud:', process.env.CLOUDINARY_CLOUD_NAME);
}

export const uploadToCloudinary = async (filePath: string, folder: string = 'neutropak') => {
  try {
    console.log('📄 Checking file:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }
    
    const stats = fs.statSync(filePath);
    console.log('✅ File exists. Size:', stats.size, 'bytes');
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
    });

    console.log('✅ Cloudinary returned:', {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      size: result.bytes,
    };
  } catch (error: any) {
    console.error('❌ Cloudinary Error:', {
      message: error.message || 'Unknown error',
      status: error.status,
      http_code: error.http_code,
      error: error.error,
    });
    
    const errorMessage = error.message || error.error?.message || JSON.stringify(error) || 'Unknown Cloudinary error';
    throw new Error(`Cloudinary upload failed: ${errorMessage}`);
  }
};

export const deleteFromCloudinary = async (public_id: string) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error: any) {
    console.error('Cloudinary Delete Error:', error);
    const errorMessage = error.message || JSON.stringify(error) || 'Unknown delete error';
    throw new Error(`Cloudinary delete failed: ${errorMessage}`);
  }
};

export default cloudinary;
