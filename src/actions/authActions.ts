'use server';

import bcrypt from 'bcrypt';
import db from '@/lib/db';
import { getSessionUserId, logServerError } from './actionUtils';
import { User } from '@prisma/client';

// Create a new user
export const createUser = async ({
    name,
    email,
    password,
}: {
    name: string;
    email: string;
    password: string;
}): Promise<ServerActionResponse<User>> => {
    try {
        if (!name || !email || !password) {
            throw new Error('All fields are required');
        }

        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return { success: false, error: 'Email is already in use' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return { success: true, data: user };
    } catch (error: unknown) {
        logServerError(error as Error, 'creating a new user');
        return {
            success: false,
            error: 'Failed to create user. Please try again later.',
        };
    }
};

export const setPassword = async ({
    email,
    currentPassword,
    newPassword,
}: {
    email: string;
    currentPassword?: string;
    newPassword: string;
}): Promise<ServerActionResponse<User>> => {
    try {
        if (!email || !newPassword) {
            throw new Error('Email and new password are required!');
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return { success: false, error: 'User not found.' };
        }
        if (currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password || '');
            if (!isMatch) {
                return { success: false, error: 'Current password is incorrect.' };
            }
        } else if (user.password) {
            return { success: false, error: 'Current password is required to set a new password.' };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await db.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        return { success: true, data: updatedUser };
    } catch (error) {
        logServerError(error as Error, 'setting a new password');
        return {
            success: false,
            error: 'Failed to set password for user. Please try again later.',
        };
    }
};

type ConnectedProvidersProps = {
    providers: {
        provider: string;
        createdAt: Date;
    }[];
    hasPassword?: boolean;
}
export const getConnectedProviders = async (): Promise<ServerActionResponse<ConnectedProvidersProps>> => {

    try {
        const fetchUserId = await getSessionUserId();
        if (!fetchUserId.success) {
            return { success: false, error: 'User not authenticated.' };
        }
        const userId = fetchUserId.data;
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });

        if (!user) {
            return { success: false, error: 'User not found.' };
        }

        const accounts = await db.account.findMany({
            where: { userId },
            select: {
                provider: true,
                createdAt: true,
            },
        });

        return { success: true, data: { providers: accounts, hasPassword: !!user.password } };

    } catch (error: unknown) {
        logServerError(error as Error, 'retrieving connected providers');
        return {
            success: false,
            error: 'Failed to fetch connected providers. Please try again later.',
        };
    }
};

// Update user profile details
export const updateUserProfile = async ({
    userId,
    name,
    email,
}: {
    userId: string;
    name?: string;
    email?: string;
}): Promise<ServerActionResponse<User>> => {
    try {
        if (!userId) {
            throw new Error('User ID is required.');
        }

        const updatedUser = await db.user.update({
            where: { id: userId },
            data: {
                name,
                email,
            },
        });

        if (!updatedUser) {
            return { success: false, error: 'Failed to update user profile.' };
        }

        return { success: true, data: updatedUser };
    } catch (error: unknown) {
        logServerError(error as Error, 'updating user profile');
        return {
            success: false,
            error: 'Failed to update user profile. Please try again later.',
        };
    }
};

