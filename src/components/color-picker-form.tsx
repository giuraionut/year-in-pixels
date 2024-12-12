'use client';

import { useState } from 'react';
import { ColorPicker } from './color-picker';
type Color = {
  name: string;
  value: string;
};
export function ColorPickerForm({ defaultColor }: { defaultColor?: Color }) {
  const [color, setColor] = useState<Color>(
    defaultColor
      ? defaultColor
      : {
          name: 'Custom Color',
          value: '#000000',
        }
  );

  return (
    <div className='space-y-2'>
      <ColorPicker color={color} onChange={setColor} />
      <input type='hidden' name='color' value={JSON.stringify(color)} />
    </div>
  );
}
