import { JSONContent } from "@tiptap/react";

export function sanitizeObject(obj: JSONContent) {
    return structuredClone(obj);
}
