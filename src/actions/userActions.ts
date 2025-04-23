'use server'
import db from '@/lib/db';
import { User } from '@prisma/client';
import { logServerError } from './actionUtils';

export const updateUserImage = async (userId: string, newImageUrl: string): Promise<ServerActionResponse<User>> => {

    try {
        const updatedUser = await db.user.update({
            where: { id: userId },
            data: { image: newImageUrl },
        });
        return { success: true, data: updatedUser };
    }
    catch (error: unknown) {
        logServerError(error as Error, 'updating user profile picture');
        return {
            success: false,
            error: 'Failed to update user profile picture. Please try again later.',
        };
    }

};