'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { ListBulletIcon } from '@radix-ui/react-icons';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Code,
  Eraser,
  Italic,
  Ellipsis,
  Strikethrough,
  UnderlineIcon,
  List,
  ListOrdered,
  Code2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
const Toolbar = ({ editor }: { editor: Editor }) => {
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);
  const [isStrikethroughActive, setIsStrikethroughActive] = useState(false);
  const [isCodeActive, setIsCodeActive] = useState(false);
  const [isBulletListActive, setIsBulletListActive] = useState(false);
  const [isOrderedListActive, setIsOrderedListActive] = useState(false);
  const [isCodeBlockActive, setIsCodeBlockActive] = useState(false);
  useEffect(() => {
    if (!editor) return;

    const updateToolbarState = () => {
      setIsBoldActive(editor.isActive('bold'));
      setIsItalicActive(editor.isActive('italic'));
      setIsUnderlineActive(editor.isActive('underline'));
      setIsStrikethroughActive(editor.isActive('strike'));
      setIsBulletListActive(editor.isActive('bulletList'));
      setIsOrderedListActive(editor.isActive('orderedList'));
      setIsCodeActive(editor.isActive('code'));
      setIsCodeBlockActive(editor.isActive('codeBlock'));
    };

    editor.on('update', updateToolbarState);
    editor.on('selectionUpdate', updateToolbarState);

    return () => {
      editor.off('update', updateToolbarState);
      editor.off('selectionUpdate', updateToolbarState);
    };
  }, [editor]);

  const handleBold = () => {
    editor.chain().focus().toggleBold().run();
  };

  const handleItalic = () => {
    editor.chain().focus().toggleItalic().run();
  };

  const handleStrikethrough = () => {
    editor.chain().focus().toggleStrike().run();
  };

  const handleUnderline = () => {
    editor.chain().focus().toggleUnderline().run();
  };

  const handleCode = () => {
    editor.chain().focus().toggleCode().run();
  };

  const handleClearFormatting = () => {
    editor.chain().focus().unsetAllMarks().run();
  };

  const handleOrderedList = () => {
    editor.chain().focus().toggleOrderedList().run();
  };
  const handleBulletList = () => {
    editor.chain().focus().toggleBulletList().run();
  };
  const handleCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };
  return (
    <div className='flex h-5 items-center space-x-4 text-sm'>
      <Toggle
        value='bold'
        aria-label='Toggle bold'
        onClick={handleBold}
        pressed={isBoldActive}
      >
        <Bold className='h-4 w-4' />
      </Toggle>

      <Toggle
        value='italic'
        aria-label='Toggle italic'
        onClick={handleItalic}
        pressed={isItalicActive}
      >
        <Italic className='h-4 w-4' />
      </Toggle>
      <Toggle
        value='underline'
        aria-label='Toggle underline'
        onClick={handleUnderline}
        pressed={isUnderlineActive}
      >
        <UnderlineIcon className='h-4 w-4' />
      </Toggle>
      <Separator orientation='vertical' className='text-s' />
      {/* Lists */}
      <Popover>
        <PopoverTrigger asChild>
          <Toggle
            value='lists'
            aria-label='Lists'
            className={cn('', {
              'bg-accent': isBulletListActive || isOrderedListActive,
            })}
          >
            <List className='h-4 w-4' />
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className='w-full'>
          <Toggle
            value='orderedlist'
            aria-label='Toggle ordered list'
            className='flex justify-between w-full'
            onClick={handleOrderedList}
            pressed={isOrderedListActive}
          >
            Ordered List
            <ListOrdered className='h-4 w-4' />
          </Toggle>
          <Toggle
            value='bulletlist'
            aria-label='Toggle bullet list'
            className='flex justify-between w-full'
            onClick={handleBulletList}
            pressed={isBulletListActive}
          >
            Bullet List
            <ListBulletIcon className='h-4 w-4' />
          </Toggle>
        </PopoverContent>
      </Popover>
      {/* More formatting options */}
      <Popover>
        <PopoverTrigger asChild>
          <Toggle
            value='more-formatting-options'
            aria-label='More formatting options'
            className={cn('', {
              'bg-accent': isStrikethroughActive || isCodeActive,
            })}
          >
            <Ellipsis className='h-4 w-4' />
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className='w-full'>
          <Toggle
            value='strikethrough'
            aria-label='Toggle strikethrough'
            className={cn('flex justify-between w-full', {
              'bg-accent': isStrikethroughActive,
            })}
            onClick={handleStrikethrough}
          >
            Strikethrough
            <Strikethrough className='h-4 w-4' />
          </Toggle>

          <Toggle
            value='codeline'
            aria-label='Toggle code line'
            className={cn('flex justify-between w-full', {
              'bg-accent': isCodeActive,
            })}
            onClick={handleCode}
          >
            Code Line
            <Code className='h-4 w-4' />
          </Toggle>
          <Toggle
            value='codeblock'
            aria-label='Toggle codeblock'
            onClick={handleCodeBlock}
            className={cn('flex justify-between w-full', {
              'bg-accent': isCodeActive,
            })}
          >
            Code Block
            <Code2 className='h-4 w-4' />
          </Toggle>

          <Toggle
            value='clear-format'
            aria-label='Toggle clear format'
            className='flex justify-between w-full'
            onClick={handleClearFormatting}
          >
            Clear Formatting
            <Eraser className='h-4 w-4' />
          </Toggle>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Toolbar;
