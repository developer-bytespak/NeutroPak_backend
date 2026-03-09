import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath: string, folder: string = 'neutropak') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      size: result.bytes,
    };
  } catch (error: any) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

export const deleteFromCloudinary = async (public_id: string) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error: any) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

export default cloudinary;
