'use client';
import {
  useEditor,
  EditorContent,
  ReactNodeViewRenderer,
  Content,
  JSONContent,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Card } from '@/components/ui/card';
import Code from '@tiptap/extension-code';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';
import OrderedList from '@tiptap/extension-ordered-list';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Diary } from '@prisma/client';
import { debounce } from 'lodash';
import { getUserDiaryByDate, upsertUserDiary } from '@/actions/diaryActions';
import { sanitizeObject } from './sanitize-editor-content';
import Heading from '@tiptap/extension-heading';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import CodeBlockComponent from './extensions/CodeBlockExtension';
import EditorToolbarComponent from './EditorToolbar';
import { LoadingDots } from '@/components/icons/loading-dots';
import EditorBubbleMenus from './EditorBubbleMenus';
const lowlight = createLowlight(all);

export default function DiaryComponent() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        codeBlock: false,
        bulletList: false,
        orderedList: false,
        code: false,
        heading: false,
        dropcursor: { width: 2, class: 'ProseMirror-dropcursor border' },
      }),
      Placeholder.configure({ placeholder: 'Type your description here...' }),
      Code.configure({
        HTMLAttributes: {
          class: 'rounded code-line',
        },
      }),
      Underline,
      BulletList.configure({
        HTMLAttributes: { class: 'list-disc p-0.5 pl-2 ml-4' },
        itemTypeName: 'listItem',
        keepMarks: true,
        keepAttributes: true,
      }),
      OrderedList.configure({
        HTMLAttributes: { class: 'list-decimal p-0.5 pl-2 ml-4' },
        itemTypeName: 'listItem',
        keepMarks: true,
        keepAttributes: true,
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded code-block',
        },
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      HorizontalRule,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    autofocus: true,
    onUpdate() {
      if (!editor) return;
      const content: JSONContent = getEditorContent();
      console.log(content);
      debouncedSaveContent(content); // Call saveContent on update
    },
  });

  const [diary, setDiary] = useState<Diary | undefined>();
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);

  const saveContent = useCallback(
    async (content: JSONContent) => {
      console.log('Saving content', content);
      if (!editor) return;

      const currentDiary = diary || {
        id: '', // No ID means this is a new diary
        userId: '', // Ensure userId is properly set
        createdAt: new Date(),
        content,
        diaryDate: date,
      };

      const updatedDiary = { ...currentDiary, content };
      const savedDiary = await upsertUserDiary(updatedDiary);

      if (savedDiary) {
        setDiary(savedDiary); // Update the state with the saved diary
      }
    },
    [diary, editor, date]
  );

  const debouncedSaveContent = useMemo(
    () => debounce(saveContent, 1000),
    [saveContent]
  );

  const getEditorContent = () => {
    const jsonDoc: JSONContent = editor?.getJSON() ?? [];
    return jsonDoc ? sanitizeObject(jsonDoc) : {};
  };

  useEffect(() => {
    const fetchUserDiary = async () => {
      const fetchedDiary = await getUserDiaryByDate(date);
      if (fetchedDiary) {
        setDiary(fetchedDiary);
        editor?.commands.setContent(fetchedDiary.content as Content);
      } else {
        setDiary(undefined);
        editor?.commands.clearContent();
      }
      setLoading(false);
    };

    fetchUserDiary();
  }, [editor, date]);

  function handleClickOnCard() {
    if (editor) editor.chain().focus();
  }

  return (
    <div className='p-5 flex flex-col gap-3'>
      {editor && (
        <div>
          <EditorToolbarComponent
            editor={editor}
            date={date}
            setDate={setDate}
          />
          <EditorBubbleMenus editor={editor} />
        </div>
      )}

      <Card className='p-3 rounded-md' onClick={handleClickOnCard}>
        {loading ? (
          <LoadingDots />
        ) : (
          <EditorContent
            editor={editor}
            className='
               focus:outline-none
               focus:ring-0
               focus-visible:outline-none
               border-none
               shadow-none
               p-3
               rounded-md
               min-h-[150px]
               bg-background
             '
          />
        )}
      </Card>
    </div>
  );
}
