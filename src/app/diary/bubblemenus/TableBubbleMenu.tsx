import { Card } from '@/components/ui/card';
import { BubbleMenu, Editor } from '@tiptap/react';
import {
  ChevronLeft,
  ChevronRight,
  TableCellsMerge,
  TableCellsSplit,
  Trash,
} from 'lucide-react';
import { useCallback } from 'react';
import type { GetReferenceClientRect } from 'tippy.js';
import { sticky } from 'tippy.js';
import { DeleteColumn } from '../../../components/icons/delete-column';
import { DeleteRow } from '@/components/icons/delete-row';
import { AddRowBefore } from '@/components/icons/add-row-before';
import { AddRowAfter } from '@/components/icons/add-row-after';

type TableBubbleMenuProps = {
  editor: Editor | null;
};

export default function TableBubbleMenu({ editor }: TableBubbleMenuProps) {
  const shouldShow = useCallback(
    () => (editor ? editor.isActive('table') : false),
    [editor]
  );

  const getReferenceClientRect: GetReferenceClientRect = () => {
    if (!editor) {
      return new DOMRect(-1000, -1000, 0, 0); // Return empty rectangle if editor is null
    }

    const {
      view,
      state: {
        selection: { from },
      },
    } = editor;

    const node = view.domAtPos(from).node as HTMLElement;
    if (!node) {
      return new DOMRect(-1000, -1000, 0, 0); // Return empty rectangle if node is not found
    }

    const tableWrapper = node.closest('.tableWrapper');
    if (!tableWrapper) {
      return new DOMRect(-1000, -1000, 0, 0); // Return empty rectangle if table wrapper is not found
    }

    const rect = tableWrapper.getBoundingClientRect();

    return rect;
  };
  if (!editor) return null;
  return (
    <BubbleMenu
      editor={editor}
      updateDelay={0}
      tippyOptions={{
        offset: [0, 8],
        popperOptions: {
          modifiers: [{ name: 'flip', enabled: false }],
        },
        maxWidth: 'auto',
        getReferenceClientRect,
        plugins: [sticky],
        sticky: 'popper',
      }}
      shouldShow={shouldShow}
    >
      <Card className='p-2 flex gap-3'>
        <button onClick={() => editor.chain().focus().addColumnBefore().run()}>
          Add column before
        </button>
        <button onClick={() => editor.chain().focus().addColumnAfter().run()}>
          Add column after
        </button>
        <button onClick={() => editor.chain().focus().deleteColumn().run()}>
          <DeleteColumn className='w-4 h-4' />
        </button>
        <button onClick={() => editor.chain().focus().addRowBefore().run()}>
          add row before
        </button>
        <button onClick={() => editor.chain().focus().addRowAfter().run()}>
          add row after
        </button>
        <button onClick={() => editor.chain().focus().deleteRow().run()}>
          <DeleteRow className='w-4 h-4' />
        </button>
        <button onClick={() => editor.chain().focus().deleteTable().run()}>
          <Trash className='w-4 h-4' />
        </button>
        <button onClick={() => editor.chain().focus().mergeCells().run()}>
          <TableCellsMerge className='w-4 h-4' />
        </button>
        <button onClick={() => editor.chain().focus().splitCell().run()}>
          <TableCellsSplit className='w-4 h-4' />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
        >
          Toggle header column
        </button>
        <button onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
          Toggle header row
        </button>
        <button onClick={() => editor.chain().focus().toggleHeaderCell().run()}>
          Toggle header cell
        </button>
        <button onClick={() => editor.chain().focus().mergeOrSplit().run()}>
          Merge or split
        </button>
        <button
          onClick={() =>
            editor.chain().focus().setCellAttribute('colspan', 2).run()
          }
        >
          Set cell attribute
        </button>
        <button onClick={() => editor.chain().focus().fixTables().run()}>
          Fix tables
        </button>
        <button onClick={() => editor.chain().focus().goToPreviousCell().run()}>
          <ChevronLeft className='w-4 h-4' />
        </button>
        <button onClick={() => editor.chain().focus().goToNextCell().run()}>
          <ChevronRight className='w-4 h-4' />
        </button>
      </Card>
    </BubbleMenu>
  );
}
