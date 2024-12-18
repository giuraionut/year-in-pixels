
export function sanitizeObject(obj: any): any {
    return structuredClone(obj);
    // if (typeof obj !== "object" || obj === null) return obj; // Base case for recursion

    // if (Array.isArray(obj)) {
    //     return obj.map(sanitizeObject); // Handle arrays
    // }

    // const sanitized: any = {};
    // for (const key in obj) {
    //     if (Object.prototype.hasOwnProperty.call(obj, key)) {
    //         const value = obj[key];
    //         if (typeof value !== "function" && typeof value !== "symbol") {
    //             sanitized[key] = sanitizeObject(value); // Recurse for nested objects
    //         }
    //     }
    // }
    // return sanitized;
}
