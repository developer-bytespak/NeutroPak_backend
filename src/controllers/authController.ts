import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse } from '../utils/responseFormatter';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { LoginInput, RefreshTokenInput } from '../utils/validators';

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginInput = req.body;

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== 'admin') {
      errorResponse(res, 'AuthenticationError', 'Invalid email or password', 401);
      return;
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      errorResponse(res, 'AuthenticationError', 'Invalid email or password', 401);
      return;
    }

    // Generate tokens
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    successResponse(
      res,
      {
        accessToken,
        refreshToken,
        expiresIn: 604800, // 7 days in seconds
        tokenType: 'Bearer',
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
      'Login successful',
      200
    );
  } catch (error: any) {
    errorResponse(res, 'InternalServerError', error.message, 500);
  }
};

export const logoutAdmin = (req: Request, res: Response) => {
  try {
    // Since we're using stateless JWT, just send success message
    // Frontend should clear tokens from localStorage
    successResponse(res, null, 'Logout successful. Please clear your tokens.', 200);
  } catch (error: any) {
    errorResponse(res, 'InternalServerError', error.message, 500);
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken }: RefreshTokenInput = req.body;

    const decoded = verifyRefreshToken(refreshToken);

    // Generate new access token
    const payload = { id: decoded.id, email: decoded.email, role: decoded.role };
    const newAccessToken = generateAccessToken(payload);

    successResponse(
      res,
      {
        accessToken: newAccessToken,
        expiresIn: 604800,
        tokenType: 'Bearer',
      },
      'Access token refreshed successfully',
      200
    );
  } catch (error: any) {
    errorResponse(res, 'AuthenticationError', 'Invalid or expired refresh token', 401);
  }
};
