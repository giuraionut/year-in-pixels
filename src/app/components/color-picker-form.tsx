'use client';

import { useState } from 'react';
import { ColorPicker } from './color-picker';
type Color = {
  name: string;
  value: string;
};
export function ColorPickerForm() {
  const [color, setColor] = useState<Color>({
    name: 'Custom Color',
    value: '#000000',
  });

  return (
    <div className='space-y-2'>
      <ColorPicker color={color} onChange={setColor} />
      <input type='hidden' name='color' value={color.value} />
    </div>
  );
}
