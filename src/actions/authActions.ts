'use server';

import argon2 from 'argon2'; // Make sure you have installed argon2: yarn add argon2

import db from '@/lib/db'; // Assuming this is your Prisma client instance path
import { getSessionUserId, logServerError } from './actionUtils'; // Assuming these exist
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
}): Promise<ServerActionResponse<Omit<User, 'password'>>> => {
    try {
        if (!name || !email || !password) {
            // Consider more specific validation if needed
            return { success: false, error: 'Name, email, and password are required.' };
        }

        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return { success: false, error: 'Email is already in use.' };
        }

        // Hash password using argon2
        const hashedPassword = await argon2.hash(password);

        const user = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword, // Store the argon2 hash
            },
        });
        // Omit password from returned user data for security
        const { password: _, ...userData } = user;
        return { success: true, data: userData };

    } catch (error: unknown) {
        logServerError(error as Error, 'creating a new user');
        return {
            success: false,
            error: 'Failed to create user. Please try again later.',
        };
    }
};

// Set or update a user's password
export const setPassword = async ({
    email,
    currentPassword,
    newPassword,
}: {
    email: string;
    currentPassword?: string; // Optional only if no password is currently set
    newPassword: string;
}): Promise<ServerActionResponse<Omit<User, 'password'>>> => { // Return User without password
    try {
        if (!email || !newPassword) {
            return { success: false, error: 'Email and new password are required.' };
        }
        // Basic password complexity check (optional but recommended)
        if (newPassword.length < 6) { // Or use a stronger policy
            return { success: false, error: 'New password must be at least 6 characters long.' };
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return { success: false, error: 'User not found.' };
        }

        // Logic for handling current password check
        if (user.password) {
            // Password exists, currentPassword MUST be provided and match
            if (!currentPassword) {
                return { success: false, error: 'Current password is required to set a new password when one already exists.' };
            }
            // Verify current password using argon2
            const isMatch = await argon2.verify(user.password, currentPassword);
            if (!isMatch) {
                return { success: false, error: 'Current password is incorrect.' };
            }
        } else if (currentPassword) {
            // No password exists in DB, but user provided one? This is unusual/error state.
            return { success: false, error: 'Cannot verify current password as no password is set for this account.' };
        }
        // If we reach here, either:
        // 1. user.password existed and currentPassword matched.
        // 2. user.password did not exist and currentPassword was not provided (setting initial password).

        // Hash the new password using argon2
        const hashedPassword = await argon2.hash(newPassword);

        const updatedUser = await db.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        // Omit password from returned user data
        const { password: _, ...userData } = updatedUser;
        return { success: true, data: userData };

    } catch (error: unknown) {
        logServerError(error as Error, 'setting a new password');
        return {
            success: false,
            error: 'Failed to set password for user. Please try again later.',
        };
    }
};


// --- Other functions remain the same as they don't use bcrypt ---

type ConnectedProvidersProps = {
    providers: {
        provider: string;
        createdAt: Date;
    }[];
    hasPassword?: boolean;
}
export const getConnectedProviders = async (): Promise<ServerActionResponse<ConnectedProvidersProps>> => {

    try {
        // Ensure getSessionUserId returns the correct structure or handle errors
        const sessionUserIdResult = await getSessionUserId();
        if (!sessionUserIdResult.success || !sessionUserIdResult.data) {
            // Distinguish between not logged in and other errors if needed
            return { success: false, error: 'User not authenticated.' };
        }
        const userId = sessionUserIdResult.data;

        const user = await db.user.findUnique({
            where: { id: userId },
            select: { password: true }, // Only select password field
        });

        if (!user) {
            // This case might mean the session ID is stale or DB inconsistency
            logServerError(new Error(`User not found for session ID: ${userId}`), 'getConnectedProviders - user lookup');
            return { success: false, error: 'User session invalid or user not found.' };
        }

        const accounts = await db.account.findMany({
            where: { userId },
            select: {
                provider: true,
                createdAt: true, // Consider if you need createdAt here
            },
            orderBy: {
                provider: 'asc' // Optional: consistent ordering
            }
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

// Update user profile details (no password changes here)
export const updateUserProfile = async ({
    userId,
    name,
    email,
}: {
    userId: string;
    name?: string;
    email?: string;
}): Promise<ServerActionResponse<Omit<User, 'password'>>> => { // Return User without password
    try {
        if (!userId) {
            return { success: false, error: 'User ID is required.' };
        }
        // Add validation for name/email format if needed

        // If email is being updated, check if the new email is already taken
        if (email) {
            const existingUser = await db.user.findFirst({
                where: {
                    email: email,
                    id: { not: userId } // Check other users
                }
            });
            if (existingUser) {
                return { success: false, error: 'Email is already in use by another account.' };
            }
        }

        const dataToUpdate: { name?: string; email?: string } = {};
        if (name !== undefined) dataToUpdate.name = name;
        if (email !== undefined) dataToUpdate.email = email;

        if (Object.keys(dataToUpdate).length === 0) {
            return { success: false, error: 'No profile data provided for update.' };
        }

        const updatedUser = await db.user.update({
            where: { id: userId },
            data: dataToUpdate,
        });

        // Omit password from returned user data
        const { password: _, ...userData } = updatedUser;
        return { success: true, data: userData };

    } catch (error: unknown) {
        // Catch potential unique constraint errors if email check fails racing condition
        if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') { // Example for Prisma unique constraint error code
            logServerError(error as Error, 'updating user profile - unique constraint');
            return { success: false, error: 'Email is already in use.' };
        }
        logServerError(error as Error, 'updating user profile');
        return {
            success: false,
            error: 'Failed to update user profile. Please try again later.',
        };
    }
};

// Define ServerActionResponse if not already defined elsewhere
// interface ServerActionResponse<T> {
//     success: boolean;
//     data?: T;
//     error?: string;
// }