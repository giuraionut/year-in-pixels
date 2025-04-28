'use client';
import {
  useEditor,
  EditorContent,
  ReactNodeViewRenderer,
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
import { useEffect, useMemo, useState } from 'react';
import { Diary } from '@prisma/client';
import { debounce } from 'lodash';
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
import { saveDiary } from './actions';

const lowlight = createLowlight(all);

export default function DiaryComponent({
  diary,
  date,
}: {
  userId: string;
  diary: Diary | null;
  date: Date;
}) {
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
    autofocus: 'end',
    content: diary?.content ? JSON.parse(diary?.content) : '',
    onUpdate() {
      if (!editor) return;
      const content: JSONContent = getEditorContent();
      save(content);
    },
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [synced, setSynced] = useState<boolean>(true);

  const save = useMemo(() => {
    return debounce(async (content: JSONContent) => {
      console.log('Debounced save triggered'); // For debugging
      setSaving(true);
      setSynced(false);
      try {
        // Pass the 'diary' object available at the time debounce is *created*
        // Or fetch the latest diary state if needed, depending on requirements

        const d: Diary = {
          id: diary?.id ?? '', // Provide a default value or handle undefined
          userId: diary?.userId ?? '', // Provide a default value or handle undefined
          createdAt: date,
          content: diary?.content ?? null, // Provide a default value or handle undefined
          updatedAt: new Date(), // Provide a default value or handle undefined
        };
        const result = await saveDiary(d, content, date); // 'diary' is captured from the outer scope
        if (result.success) {
          setSynced(true);
          console.log('Save successful, synced.');
        } else {
          console.error('Save failed:', result.error);
          // Optionally reset synced to false or show error
        }
      } catch (error) {
        console.error('Error during save:', error);
        // Optionally reset synced to false or show error
      } finally {
        setSaving(false);
      }
    }, 1000); // 1000ms debounce delay
  }, [diary, setSaving, setSynced]); // Dependencies: recreate debounce if diary changes.
  // setSaving/setSynced are stable but good practice to include if used.
  // Add cleanup for the debounced function
  useEffect(() => {
    // This cleanup function runs when the component unmounts
    // or when the 'save' function instance changes (if 'diary' changes)
    return () => {
      console.log('Cancelling pending save on cleanup/change.'); // For debugging
      save.cancel();
    };
  }, [save]); // Depend on the memoized 'save' function

  const getEditorContent = () => {
    const jsonDoc: JSONContent = editor?.getJSON() ?? [];
    return jsonDoc ? sanitizeObject(jsonDoc) : {};
  };

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
      </section>
      <section className='p-5 flex flex-col w-full gap-3 '>
        {editor && (
          <div>
            <EditorToolbarComponent editor={editor} date={date} />
            <EditorBubbleMenus editor={editor} />
          </div>
        )}

        <Card className='p-3 rounded-md relative' onClick={handleClickOnCard}>
          {
            <EditorContent
              editor={editor}
              className='
               focus:outline-hidden
               focus:ring-0
               focus-visible:outline-hidden
               border-none
               shadow-none
               p-3
               rounded-md
               min-h-[150px]
               bg-background
             '
            />
          }
          {saving && (
            <div className='absolute top-2 right-2 bg-gray-500/50 text-primary rounded-md px-2 py-1 text-[.6rem] font-bold flex items-center gap-1'>
              <p>Saving</p>
              <LoadingDots size={8} />
            </div>
          )}

          {synced && !saving && (
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
