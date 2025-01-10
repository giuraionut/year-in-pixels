'use server'
import db from '@/lib/db';

export const updateUserImage = async (userId: string, newImageUrl: string) => {
    if (!userId || !newImageUrl) {
        throw new Error("User ID and new image URL are required");
    }

    const updatedUser = await db.user.update({
        where: { id: userId },
        data: { image: newImageUrl },
    });

    return updatedUser;
};