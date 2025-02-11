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
import { format } from 'date-fns';
import { Check } from 'lucide-react'; // Import the Check icon

const lowlight = createLowlight(all);

export default function DiaryComponent() {
  const editor = useEditor({
    immediatelyRender: true,
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
      debouncedSaveContent(content); // Call saveContent on update
    },
  });

  const [diary, setDiary] = useState<Diary | undefined>();
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false); // Track saving state
  const [synced, setSynced] = useState<boolean>(true); // Track sync state

  const saveContent = useCallback(
    async (content: JSONContent) => {
      if (!editor) return;
      setSaving(true); // Set saving to true before saving
      setSynced(false); // Reset synced state while saving

      try {
        const currentDiary = diary || {
          id: '', // No ID means this is a new diary
          userId: '', // Ensure userId is properly set
          createdAt: new Date(),
          content,
          diaryDate: date,
        };

        const updatedDiary = {
          ...currentDiary,
          content,
        };

        const savedDiary = await upsertUserDiary(updatedDiary);

        if (savedDiary) {
          setDiary({
            ...savedDiary,
            content: savedDiary.content ? JSON.parse(savedDiary.content) : null,
          });
          setSynced(true); // Set synced to true after successfully saving
        }
      } finally {
        setSaving(false); // Set saving to false after saving, regardless of success or failure
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
      setLoading(true); // Set loading to true before fetching data
      try {
        const fetchedDiary = await getUserDiaryByDate(date);
        if (fetchedDiary) {
          try {
            const content = fetchedDiary.content;
            const parsedContent = content ? JSON.parse(content) : {};

            setDiary({ ...fetchedDiary, content: parsedContent });

            if (editor) {
              editor.commands.setContent(parsedContent as Content);
            }
          } catch (error) {
            console.error('Error parsing or setting content:', error);
          }
        } else {
          setDiary(undefined);
          editor?.commands.clearContent();
        }
        setSynced(true); // Initially consider the content synced after loading
      } finally {
        setLoading(false); // Set loading to false after fetching data, regardless of success or failure
      }
    };

    fetchUserDiary();
  }, [editor, date]);

  function handleClickOnCard() {
    if (editor) editor.chain().focus();
  }

  return (
    <div className='relative flex flex-col items-start gap-2'>
      <section className='container px-6 flex mx-auto flex-wrap gap-6 border-b border-border/40 py-8 dark:border-border md:py-10 lg:py-12'>
        <div>
          <h1 className='text-2xl font-bold leading-tight tracking-tighter md:text-3xl lg:leading-[1.1]'>
            Diary
          </h1>
          <small className='text-xs leading-3'>{format(date, 'PPP')}</small>
        </div>
        {loading && (
          <div className='container px-6 py-6 mx-auto flex flex-col justify-between gap-6 max-w-[800px]'>
            <LoadingDots />
          </div>
        )}
      </section>
      <section className='p-5 flex flex-col w-full gap-3 '>
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

        <Card className='p-3 rounded-md relative' onClick={handleClickOnCard}>
          {loading ? (
            <div className='flex items-center justify-center min-h-[150px]'>
              <LoadingDots />
            </div>
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

          {/* Saving indicator in the corner */}

          {!loading && saving && (
            <div className='absolute top-2 right-2 bg-gray-500/50 text-primary rounded-md px-2 py-1 text-[.6rem] font-bold flex items-center gap-1'>
              <p>Saving</p>
              <LoadingDots size={8} />
            </div>
          )}

          {/* Synced indicator in the corner */}
          {!loading && synced && !saving && (
            <div className='absolute top-2 right-2 bg-green-500/50 text-primary rounded-md px-2 py-1 text-[.6rem] font-bold flex items-center'>
              <Check className='h-4 w-4 mr-1' />
              Synced
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
