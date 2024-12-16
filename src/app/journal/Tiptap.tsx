'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Toolbar from './Toolbar';
import { Card } from '@/components/ui/card';
import Code from '@tiptap/extension-code';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import CodeBlock from '@tiptap/extension-code-block';
import OrderedList from '@tiptap/extension-ordered-list';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import handleSanitizeContent from './sanitizeEditorContent';
const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        codeBlock: false,
        paragraph: { HTMLAttributes: { class: 'text-node' } },
        heading: { HTMLAttributes: { class: 'heading-node' } },
        blockquote: { HTMLAttributes: { class: 'block-node' } },
        bulletList: { HTMLAttributes: { class: 'list-node' } },
        orderedList: { HTMLAttributes: { class: 'list-node' } },
        code: { HTMLAttributes: { class: 'inline', spellcheck: 'false' } },
        dropcursor: { width: 2, class: 'ProseMirror-dropcursor border' },
      }),
      Placeholder.configure({ placeholder: 'Type your description here...' }),
      Code.configure({
        HTMLAttributes: {
          class:
            'relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold bg-slate-300',
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
      CodeBlock.configure({
        defaultLanguage: 'plaintext',
        exitOnTripleEnter: false,
        languageClassPrefix: 'language-',
        HTMLAttributes: {
          class:
            'relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold bg-slate-300',
        },
      }),
    ],
    // content:
    //   '<p>Hello World! 🌎️</p> <code>Hello</code> <strike>test</strike> <b>test</b>',
    autofocus: true,
  });

  function handleGetContent() {
    if (editor) {
      const sanitizedDoc = handleSanitizeContent(editor);
    }
  }
  const [sanitizedContent, setSanitizedContent] = useState<string>('');

  return (
    <div className='p-5 flex flex-col gap-3'>
      {editor && (
        <div>
          <Toolbar editor={editor} />
        </div>
      )}
      <Card className='p-3 rounded-md'>
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
      <Button onClick={handleGetContent}> Get Content</Button>
    </div>
  );
};

export default Tiptap;
