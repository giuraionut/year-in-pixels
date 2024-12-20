
export function sanitizeObject(obj: any): any {
    return structuredClone(obj);
}
