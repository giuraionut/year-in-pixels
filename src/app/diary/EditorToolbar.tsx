import { Card } from '@/components/ui/card';
import ToolbarFormatting from './toolbars/ToolbarFormatting';
import { Editor } from '@tiptap/react';
import ToolbarHeadings from './toolbars/ToolbarHeadings';
import ToolbarLists from './toolbars/ToolbarLists';
import ToolbarTable from './toolbars/ToolbarTable';
import ToolbarCalendar from './toolbars/ToolbarCalendar';

type EditorToolbarComponentProps = {
  editor: Editor;
  date: Date;
};

export default function EditorToolbarComponent({
  editor,
  date,
}: EditorToolbarComponentProps) {
  return (
    <Card className='p-2 flex flex-row flex-wrap gap-4 text-sm items-center rounded-md '>
      <ToolbarFormatting editor={editor} />
      <ToolbarHeadings editor={editor} />
      <ToolbarLists editor={editor} />
      <ToolbarTable editor={editor} />
      <ToolbarCalendar dateProp={date} className='md:ml-auto' />
    </Card>
  );
}
