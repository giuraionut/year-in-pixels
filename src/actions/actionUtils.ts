

import { authOptions } from "@/lib/auth";
import { format } from "date-fns";
import { getServerSession } from "next-auth";

export const getSessionUserId = async (): Promise<ServerActionResponse<string>> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            console.error("Unauthorized: User is not authenticated");
            throw new Error("Unauthorized");
        }
        return { success: true, data: session.user.id };
    }
    catch (error: unknown) {
        logServerError(error as Error, 'fetching user session id');
        return {
            success: false,
            error: 'Failed to fetch user session id. Please try again later.',
        };
    }

};

export const normalizeDate = (date: Date | string): Date => {
    const parsedDate = new Date(date);
    return new Date(format(parsedDate, "yyyy-MM-dd"));
};

export const logServerError = (error: Error, context: string): void => {
    console.error(`Error in ${context}:`, error.message);
    if (process.env.NODE_ENV === 'development') {
        console.error(`Stack trace:\n`, error.stack);
    }
};
