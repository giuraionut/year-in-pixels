import { Card } from '@/components/ui/card';
import { BubbleMenu, Editor } from '@tiptap/react';
import {
  ChevronLeft,
  ChevronRight,
  TableCellsMerge,
  TableCellsSplit,
} from 'lucide-react';
import { useCallback } from 'react';
import type { GetReferenceClientRect } from 'tippy.js';
import { sticky } from 'tippy.js';
import {
  IconColumnInsertLeft,
  IconColumnInsertRight,
  IconColumnRemove,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconRowRemove,
  IconTableMinus,
  IconTableSpark,
} from '@tabler/icons-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

  const wrapWithTooltip = (
    button: React.ReactElement,
    tooltipText: string
  ): React.ReactElement => (
    <Tooltip>
      <TooltipTrigger asChild>{<>{button}</>}</TooltipTrigger>
      <TooltipContent sideOffset={12}>{tooltipText}</TooltipContent>
    </Tooltip>
  );

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
      <Card className='p-2 flex gap-3 rounded-md'>
        {wrapWithTooltip(
          <button
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          >
            <IconColumnInsertLeft className='w-4 h-4' />
          </button>,
          'Add Column Before'
        )}
        {wrapWithTooltip(
          <button onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <IconColumnInsertRight className='w-4 h-4' />
          </button>,
          'Add Column After'
        )}
        {wrapWithTooltip(
          <button onClick={() => editor.chain().focus().deleteColumn().run()}>
            <IconColumnRemove className='w-4 h-4' />
          </button>,
          'Delete Column'
        )}
        {wrapWithTooltip(
          <button onClick={() => editor.chain().focus().addRowBefore().run()}>
            <IconRowInsertBottom className='w-4 h-4' />
          </button>,
          'Add Row Before'
        )}
        {wrapWithTooltip(
          <button onClick={() => editor.chain().focus().addRowAfter().run()}>
            <IconRowInsertTop className='w-4 h-4' />
          </button>,
          'Add Row After'
        )}
        {wrapWithTooltip(
          <button onClick={() => editor.chain().focus().deleteRow().run()}>
            <IconRowRemove className='w-4 h-4' />
          </button>,
          'Delete Row'
        )}
        {wrapWithTooltip(
          <button onClick={() => editor.chain().focus().deleteTable().run()}>
            <IconTableMinus className='w-4 h-4' />
          </button>,
          'Delete Table'
        )}
        {wrapWithTooltip(
          <button onClick={() => editor.chain().focus().mergeCells().run()}>
            <TableCellsMerge className='w-4 h-4' />
          </button>,
          'Merge Cells'
        )}
        {wrapWithTooltip(
          <button onClick={() => editor.chain().focus().splitCell().run()}>
            <TableCellsSplit className='w-4 h-4' />
          </button>,
          'Split Cell'
        )}
        {wrapWithTooltip(
          <button onClick={() => editor.chain().focus().fixTables().run()}>
            <IconTableSpark className='w-4 h-4' />
          </button>,
          'Fix Table'
        )}
        {wrapWithTooltip(
          <button
            onClick={() => editor.chain().focus().goToPreviousCell().run()}
          >
            <ChevronLeft className='w-4 h-4' />
          </button>,
          'Go to Previous Cell'
        )}
        {wrapWithTooltip(
          <button onClick={() => editor.chain().focus().goToNextCell().run()}>
            <ChevronRight className='w-4 h-4' />
          </button>,
          'Go to Next Cell'
        )}
      </Card>
    </BubbleMenu>
  );
}
