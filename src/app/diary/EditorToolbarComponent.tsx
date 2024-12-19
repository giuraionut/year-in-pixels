import { Card } from '@/components/ui/card';
import ToolbarFormatting from './toolbar-modules/ToolbarFormatting';
import { Editor } from '@tiptap/react';
import ToolbarHeadings from './toolbar-modules/ToolbarHeadings';
import ToolbarLists from './toolbar-modules/ToolbarLists';
import ToolbarTable from './toolbar-modules/ToolbarTable';
import { Separator } from '@/components/ui/separator';
import ToolbarCalendar from './toolbar-modules/ToolbarCalendar';

type EditorToolbarComponentProps = {
  editor: Editor;
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
};

export default function EditorToolbarComponent({
  editor,
  date,
  setDate,
}: EditorToolbarComponentProps) {
  return (
    <Card className='p-2 flex flex-wrap gap-4 text-sm items-center'>
      <ToolbarFormatting editor={editor} />
      <ToolbarHeadings editor={editor} />
      <ToolbarLists editor={editor} />
      <ToolbarTable editor={editor} />

      <ToolbarCalendar date={date} setDate={setDate} className='ml-auto ' />
    </Card>
  );
}
