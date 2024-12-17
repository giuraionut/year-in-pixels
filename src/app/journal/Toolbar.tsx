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
  Heading1,
  Heading,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Table,
  Trash,
  ListTodo,
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
  const [isTaskListActive, setIsTaskListActive] = useState(false);
  const [isHeadingOneActive, setIsHeadingOneActive] = useState(false);
  const [isHeadingTwoActive, setIsHeadingTwoActive] = useState(false);
  const [isHeadingThreeActive, setIsHeadingThreeActive] = useState(false);
  const [isHeadingFourActive, setIsHeadingFourActive] = useState(false);
  const [isHeadingFiveActive, setIsHeadingFiveActive] = useState(false);
  const [isHeadingSixActive, setIsHeadingSixActive] = useState(false);

  const [isCodeBlockLowLightActive, setIsCodeBlocLowLightkActive] =
    useState(false);
  useEffect(() => {
    if (!editor) return;

    const updateToolbarState = () => {
      setIsBoldActive(editor.isActive('bold'));
      setIsItalicActive(editor.isActive('italic'));
      setIsUnderlineActive(editor.isActive('underline'));
      setIsStrikethroughActive(editor.isActive('strike'));
      setIsBulletListActive(editor.isActive('bulletList'));
      setIsOrderedListActive(editor.isActive('orderedList'));
      setIsTaskListActive(editor.isActive('taskList'));
      setIsCodeActive(editor.isActive('code'));
      setIsCodeBlocLowLightkActive(editor.isActive('codeBlock'));
      setIsHeadingOneActive(editor.isActive('heading', { level: 1 }));
      setIsHeadingTwoActive(editor.isActive('heading', { level: 2 }));
      setIsHeadingThreeActive(editor.isActive('heading', { level: 3 }));
      setIsHeadingFourActive(editor.isActive('heading', { level: 4 }));
      setIsHeadingFiveActive(editor.isActive('heading', { level: 5 }));
      setIsHeadingSixActive(editor.isActive('heading', { level: 6 }));
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

  const handleHeadingOne = () => {
    editor.chain().focus().toggleHeading({ level: 1 }).run();
  };

  const handleHeadingTwo = () => {
    editor.chain().focus().toggleHeading({ level: 2 }).run();
  };

  const handleHeadingThree = () => {
    editor.chain().focus().toggleHeading({ level: 3 }).run();
  };

  const handleHeadingFour = () => {
    editor.chain().focus().toggleHeading({ level: 4 }).run();
  };

  const handleHeadingFive = () => {
    editor.chain().focus().toggleHeading({ level: 5 }).run();
  };

  const handleHeadingSix = () => {
    editor.chain().focus().toggleHeading({ level: 6 }).run();
  };

  const handleCreateTable = (rows: number, cols: number) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
  };

  const handleDeleteTable = () => {
    editor.chain().focus().deleteTable().run();
  };

  const handleTaskList = () => {
    editor.chain().focus().toggleTaskList().run();
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
              'bg-accent':
                isBulletListActive || isOrderedListActive || isTaskListActive,
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
          <Toggle
            value='tasklist'
            aria-label='Toggle task list'
            className='flex justify-between w-full'
            onClick={handleTaskList}
            pressed={isTaskListActive}
          >
            Todo List
            <ListTodo className='h-4 w-4' />
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
              'bg-accent':
                isStrikethroughActive ||
                isCodeActive ||
                isCodeBlockLowLightActive,
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
              'bg-accent': isCodeBlockLowLightActive,
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
      {/* Headings */}
      <Popover>
        <PopoverTrigger asChild>
          <Toggle
            value='headings'
            aria-label='Headings'
            className={cn('', {
              'bg-accent':
                isHeadingOneActive ||
                isHeadingTwoActive ||
                isHeadingThreeActive ||
                isHeadingFourActive ||
                isHeadingFiveActive ||
                isHeadingSixActive,
            })}
          >
            <Heading className='h-4 w-4' />
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className='w-full'>
          <Toggle
            value='heading1'
            aria-label='Toggle heading 1'
            className={cn('flex justify-between w-full', {
              'bg-accent': isHeadingOneActive,
            })}
            onClick={handleHeadingOne}
          >
            Heading 1
            <Heading1 className='h-4 w-4' />
          </Toggle>

          <Toggle
            value='heading2'
            aria-label='Toggle heading 2'
            className={cn('flex justify-between w-full', {
              'bg-accent': isHeadingTwoActive,
            })}
            onClick={handleHeadingTwo}
          >
            Heading 2
            <Heading2 className='h-4 w-4' />
          </Toggle>

          <Toggle
            value='heading3'
            aria-label='Toggle heading 3'
            className={cn('flex justify-between w-full', {
              'bg-accent': isHeadingThreeActive,
            })}
            onClick={handleHeadingThree}
          >
            Heading 3
            <Heading3 className='h-4 w-4' />
          </Toggle>

          <Toggle
            value='heading4'
            aria-label='Toggle heading 4'
            className={cn('flex justify-between w-full', {
              'bg-accent': isHeadingFourActive,
            })}
            onClick={handleHeadingFour}
          >
            Heading 4
            <Heading4 className='h-4 w-4' />
          </Toggle>

          <Toggle
            value='heading5'
            aria-label='Toggle heading 5'
            className={cn('flex justify-between w-full', {
              'bg-accent': isHeadingFiveActive,
            })}
            onClick={handleHeadingFive}
          >
            Heading 5
            <Heading5 className='h-4 w-4' />
          </Toggle>

          <Toggle
            value='heading6'
            aria-label='Toggle heading 6'
            className={cn('flex justify-between w-full', {
              'bg-accent': isHeadingSixActive,
            })}
            onClick={handleHeadingSix}
          >
            Heading 6
            <Heading6 className='h-4 w-4' />
          </Toggle>
        </PopoverContent>
      </Popover>
      {/* Table */}

      <Popover>
        <PopoverTrigger asChild>
          <Toggle value='table' aria-label='Insert table'>
            <Table className='h-4 w-4' />
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className='w-full'>
          <Toggle
            value='table-3x3'
            aria-label='Create 3x3 table'
            className='flex justify-between w-full'
            onClick={() => handleCreateTable(3, 3)}
          >
            Table <span>3x3</span>
          </Toggle>
          <Toggle
            value='table-4x4'
            aria-label='Create 4x4 table'
            className='flex justify-between w-full'
            onClick={() => handleCreateTable(4, 4)}
          >
            Table <span>4x4</span>
          </Toggle>
          <Toggle
            value='table-5x5'
            aria-label='Create 5x5 table'
            className='flex justify-between w-full'
            onClick={() => handleCreateTable(5, 5)}
          >
            Table <span>5x5</span>
          </Toggle>
          <Toggle
            value='delete-table'
            aria-label='Delete table'
            className='flex justify-between w-full'
            onClick={handleDeleteTable}
          >
            Delete
            <Trash className='h-4 w-4'></Trash>
          </Toggle>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Toolbar;
