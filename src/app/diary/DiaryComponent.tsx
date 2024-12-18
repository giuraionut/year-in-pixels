'use client';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Card } from '@/components/ui/card';
import Code from '@tiptap/extension-code';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';
import OrderedList from '@tiptap/extension-ordered-list';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useState } from 'react';
import { Diary } from '@prisma/client';
import { debounce } from 'lodash';
import { getUserDiaries, upsertUserDiary } from '@/actions/diaryActions';
import { sanitizeObject } from './sanitizeEditorContent';
import Heading from '@tiptap/extension-heading';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import CodeBlockComponent from './CodeBlockComponent';
import EditorToolbarComponent from './EditorToolbarComponent';
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
      const content = getEditorContent();
      console.log(content);
      debouncedSaveContent(content); // Call saveContent on update
    },
  });

  const [diaries, setDiaries] = useState<Diary[]>([]);

  const saveContent = useCallback(
    async (content: any) => {
      if (!editor) return;

      const currentDiary = diaries[0] || {
        id: '', // No ID means this is a new diary
        userId: '', // Ensure userId is properly set
        createdAt: new Date(),
        content,
      };

      const updatedDiary = { ...currentDiary, content };
      const savedDiary = await upsertUserDiary(updatedDiary);

      if (savedDiary) {
        setDiaries([savedDiary]); // Update the state with the saved diary
      }
    },
    [diaries, editor]
  );

  // Persistent debounced version of saveContent
  const debouncedSaveContent = useCallback(debounce(saveContent, 1000), [
    saveContent,
  ]);
  const getEditorContent = () => {
    const jsonDoc = editor?.getJSON();
    return jsonDoc ? sanitizeObject(jsonDoc) : {};
  };

  const handleSaveContent = async () => {
    if (!editor) return;

    const content = getEditorContent();
    const diary: Diary = {
      content,
      id: '', // New diary (no id)
      userId: '', // Set userId properly
      createdAt: new Date(),
    };

    // Use upsert to create or update the diary
    const savedDiary = await upsertUserDiary(diary);
    if (savedDiary) {
      setDiaries([savedDiary]); // Update local state with the saved diary
    }
  };

  const handleUpdateContent = async () => {
    if (!editor || !diaries.length) return;

    const updatedDiary = { ...diaries[0], content: getEditorContent() };
    const savedDiary = await upsertUserDiary(updatedDiary);

    if (savedDiary) {
      setDiaries([savedDiary]);
    }
  };

  useEffect(() => {
    const fetchUserDiaries = async () => {
      const fetchedDiaries = await getUserDiaries();
      if (fetchedDiaries?.length) {
        setDiaries(fetchedDiaries);
        editor?.commands.setContent(fetchedDiaries[0].content);
      }
    };

    fetchUserDiaries();
  }, [editor]);

  function handleClickOnCard() {
    if (editor) editor.chain().focus();
  }
  return (
    <div className='p-5 flex flex-col gap-3'>
      {editor && (
        <div>
          <EditorToolbarComponent editor={editor} />
        </div>
      )}

      <Card className='p-3 rounded-md' onClick={handleClickOnCard}>
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
      </Card>

      {/* <div className='flex gap-2'>
        <Button onClick={handleSaveContent}>Save to database</Button>
        <Button onClick={handleUpdateContent}>Update</Button>
      </div> */}
    </div>
  );
}
