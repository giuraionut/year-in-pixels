import { Color } from '@/app/moods/mood';
import { ColorPicker } from '@/components/color-picker';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type ColorPickerFormProps = {
  value: { name: string; value: string };
  onChange: (color: { name: string; value: string }) => void;
  className: string;
  defaultColor?: Color;
};

export default function ColorPickerForm({
  value,
  onChange,
  className,
  defaultColor,
}: ColorPickerFormProps) {
  return (
    <div className={cn('', className)}>
      <ColorPicker color={defaultColor} onChange={onChange} />

      <Input
        type='color'
        value={value.value}
        onChange={(e) => onChange({ name: value.name, value: e.target.value })}
        className='sr-only'
        aria-label='Select custom color'
      />
    </div>
  );
}
