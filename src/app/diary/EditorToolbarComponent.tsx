import { Card } from '@/components/ui/card';
import ToolbarFormatting from './toolbar-modules/ToolbarFormatting';
import { Editor } from '@tiptap/react';
import ToolbarHeadings from './toolbar-modules/ToolbarHeadings';
import ToolbarLists from './toolbar-modules/ToolbarLists';
import ToolbarTable from './toolbar-modules/ToolbarTable';
import { Separator } from '@/components/ui/separator';

export default function EditorToolbarComponent({ editor }: { editor: Editor }) {
  return (
    <Card className='p-3 rounded-md'>
      <div className='flex h-5 items-center space-x-4 text-sm'>
        <ToolbarFormatting editor={editor} />
        <Separator orientation='vertical' className='text-s' />
        <ToolbarHeadings editor={editor} />
        <ToolbarLists editor={editor} />
        <ToolbarTable editor={editor} />
      </div>
    </Card>
  );
}
