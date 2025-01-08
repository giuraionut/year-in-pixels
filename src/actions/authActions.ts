'use server';

import bcrypt from 'bcrypt';
import db from '@/lib/db';
import { handleServerError } from './actionUtils';

export const createUser = async ({
    name,
    email,
    password,
}: {
    name: string;
    email: string;
    password: string;
}): Promise<{ success: boolean; message: string }> => {
    try {
        // Validate input
        if (!name || !email || !password) {
            throw new Error('All fields are required');
        }

        // Check if user already exists
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return { success: false, message: 'Email is already in use' };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return { success: true, message: 'Account created successfully' };
    } catch (error) {
        handleServerError(error, 'creating a new user.');
        return { success: false, message: 'Internal server error' };
    }
};
