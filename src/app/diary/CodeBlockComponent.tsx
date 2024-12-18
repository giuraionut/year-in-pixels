import React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectLabel,
} from '@/components/ui/select';
import './styles.css';

export default function CodeBlockComponent({
  node: {
    attrs: { language: defaultLanguage },
  },
  updateAttributes,
  extension,
}: CodeBlockComponentProps) {
  return (
    <NodeViewWrapper className='code-block'>
      <Select
        defaultValue={defaultLanguage}
        onValueChange={(value) => updateAttributes({ language: value })}
      >
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='Select Language' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Languages</SelectLabel>
          </SelectGroup>
          <SelectItem value='null'>auto</SelectItem>
          {extension.options.lowlight.listLanguages().map((lang, index) => (
            <SelectItem key={index} value={lang}>
              {lang}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <pre>
        <NodeViewContent as='code' />
      </pre>
    </NodeViewWrapper>
  );
}
