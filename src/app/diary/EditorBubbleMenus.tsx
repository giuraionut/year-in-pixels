import { Editor } from '@tiptap/react';
import TableBubbleMenu from './bubblemenus/TableBubbleMenu';

type EditorBubbleMenusProps = {
  editor: Editor | null;
};

export default function EditorBubbleMenus({ editor }: EditorBubbleMenusProps) {
  return <TableBubbleMenu editor={editor} />;
}
