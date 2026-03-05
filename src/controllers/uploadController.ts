import { Request, Response } from 'express';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';
import { successResponse, errorResponse } from '../utils/responseFormatter';

export const uploadImage = async (req: Request & { file?: any }, res: Response) => {
  try {
    if (!req.file) {
      errorResponse(res, 'ValidationError', 'No file provided', 400);
      return;
    }

    const folder = req.query.folder as string || 'neutropak/media';
    const result = await uploadToCloudinary(req.file.path, folder);

    successResponse(
      res,
      {
        public_id: result.public_id,
        url: result.url,
        width: result.width,
        height: result.height,
        size: result.size,
      },
      'Image uploaded successfully',
      201
    );
  } catch (error: any) {
    errorResponse(res, 'UploadError', error.message, 500);
  }
};

export const uploadMultiple = async (req: Request & { files?: any }, res: Response) => {
  try {
    if (!req.files || req.files.length === 0) {
      errorResponse(res, 'ValidationError', 'No files provided', 400);
      return;
    }

    const folder = req.query.folder as string || 'neutropak/media';
    const uploadPromises = req.files.map((file: any) =>
      uploadToCloudinary(file.path, folder)
    );

    const results = await Promise.all(uploadPromises);

    successResponse(
      res,
      results.map((result) => ({
        public_id: result.public_id,
        url: result.url,
        width: result.width,
        height: result.height,
        size: result.size,
      })),
      `${results.length} files uploaded successfully`,
      201
    );
  } catch (error: any) {
    errorResponse(res, 'UploadError', error.message, 500);
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      errorResponse(res, 'ValidationError', 'public_id is required', 400);
      return;
    }

    await deleteFromCloudinary(public_id);

    successResponse(res, { public_id }, 'Image deleted successfully');
  } catch (error: any) {
    errorResponse(res, 'DeleteError', error.message, 500);
  }
};
