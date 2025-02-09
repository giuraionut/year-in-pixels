'use server';
import db from "@/lib/db";

type CollectionInfo = { name: string };
type BackupData = Record<string, unknown[]>;

type ListCollectionsResult = {
    cursor?: {
        firstBatch?: CollectionInfo[];
    };
};

type BackupResponse = {
    success: boolean;
    fileContent?: string;
    message?: string;
};

export const backupDatabase = async (): Promise<BackupResponse> => {
    try {
        // List all collections in the database
        const collectionsResult = await db.$runCommandRaw({ listCollections: 1 }) as ListCollectionsResult;

        // Validate result structure
        if (!collectionsResult?.cursor?.firstBatch) {
            console.error("Failed to retrieve collections.");
            return { success: false, message: "Failed to retrieve collections." };
        }

        const collections: CollectionInfo[] = collectionsResult.cursor.firstBatch;

        console.log("Collections in the database:");
        collections.forEach((collection) => console.log(`- ${collection.name}`));

        // Fetch contents of each collection
        const data: BackupData = {};
        for (const collection of collections) {
            const collectionName = collection.name;
            const model = db[collectionName as keyof typeof db];

            if (model && typeof model === "object" && "findMany" in model) {
                const documents = await (model as { findMany: () => Promise<unknown[]> }).findMany();
                data[collectionName] = documents;
            } else {
                console.warn(`Model '${collectionName}' is not available in Prisma schema or does not support findMany.`);
            }
        }

        // Prepare backup data as a JSON string
        const fileContent = JSON.stringify(data, null, 2);

        return { success: true, fileContent };
    } catch (error) {
        console.error("Error during database backup:", error);
        return { success: false, message: "Internal server error during database backup." };
    }
};
