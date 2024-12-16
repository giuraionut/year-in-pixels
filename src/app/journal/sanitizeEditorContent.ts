import { Node } from '@tiptap/pm/model';

/**
 * Recursively sanitizes content in ProseMirror JSON structure.
 * Removes empty paragraphs and nodes with no valid content.
 * @param content - The JSON content array of a ProseMirror document.
 * @returns Sanitized content array.
 */
function sanitizeContent(content: any[]): any[] {
    if (!content || !Array.isArray(content)) return [];

    return content
        .map((node) => {
            if (node.type === 'paragraph' && (!node.content || node.content.length === 0)) {
                return null; // Remove empty paragraphs
            }
            if (node.content && Array.isArray(node.content)) {
                node.content = sanitizeContent(node.content); // Recursively sanitize child nodes
            }
            return node;
        })
        .filter((node) => node !== null); // Filter out null values
}

/**
 * Sanitizes the editor's ProseMirror Node by removing invalid content.
 * @param doc - The current editor document as a ProseMirror Node.
 * @returns Sanitized ProseMirror Node.
 */
function sanitizeProseMirrorNode(doc: Node): Node {
    const json = doc.toJSON(); // Convert the current document to JSON
    json.content = sanitizeContent(json.content); // Sanitize the content recursively
    return Node.fromJSON(doc.type.schema, json); // Convert sanitized JSON back to a Node
}

/**
 * Example usage of `sanitizeProseMirrorNode`.
 */
export default function handleSanitizeContent(editor: any) {
    const doc = editor.state.doc; // Get the current document as a ProseMirror Node
    const sanitizedDoc = sanitizeProseMirrorNode(doc); // Sanitize the document

    console.log('Sanitized Document:', sanitizedDoc.toJSON());

    return sanitizedDoc;
}


