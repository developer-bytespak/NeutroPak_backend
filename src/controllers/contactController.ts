import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse } from '../utils/responseFormatter';
import { CreateContactInput } from '../utils/validators';

/**
 * Create a new contact submission
 * POST /api/contact
 */
export const createContact = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message }: CreateContactInput = req.body;

    // Create contact in database
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        message,
      },
    });

    successResponse(
      res,
      {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        message: contact.message,
        createdAt: contact.createdAt,
      },
      'Contact submission received successfully',
      201
    );
  } catch (error: any) {
    errorResponse(res, 'InternalServerError', error.message, 500);
  }
};

/**
 * Get all contact submissions (Admin only)
 * GET /api/contact
 */
export const getAllContacts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, email, startDate, endDate } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Build filters
    const where: any = {};

    if (email) {
      where.email = {
        contains: email,
        mode: 'insensitive',
      };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    // Fetch total count and contacts
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.contact.count({ where }),
    ]);

    successResponse(
      res,
      {
        contacts,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
      'Contacts retrieved successfully',
      200
    );
  } catch (error: any) {
    errorResponse(res, 'InternalServerError', error.message, 500);
  }
};

/**
 * Get a single contact submission by ID (Admin only)
 * GET /api/contact/:id
 */
export const getContactById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!contact) {
      errorResponse(res, 'NotFoundError', 'Contact not found', 404);
      return;
    }

    successResponse(res, contact, 'Contact retrieved successfully', 200);
  } catch (error: any) {
    errorResponse(res, 'InternalServerError', error.message, 500);
  }
};

/**
 * Delete a contact submission (Admin only)
 * DELETE /api/contact/:id
 */
export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!contact) {
      errorResponse(res, 'NotFoundError', 'Contact not found', 404);
      return;
    }

    await prisma.contact.delete({
      where: { id: parseInt(id, 10) },
    });

    successResponse(res, null, 'Contact deleted successfully', 200);
  } catch (error: any) {
    errorResponse(res, 'InternalServerError', error.message, 500);
  }
};
