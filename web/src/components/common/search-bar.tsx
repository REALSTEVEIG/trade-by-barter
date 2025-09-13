import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

export function SearchBar({
  value = '',
  placeholder = 'Search for items...',
  onValueChange,
  onSearch,
  onClear,
  className,
}: SearchBarProps): React.ReactElement {
  const [internalValue, setInternalValue] = React.useState(value);

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSearch?.(internalValue);
  };

  const handleClear = (): void => {
    setInternalValue('');
    onValueChange?.('');
    onClear?.();
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-gray" />
        <input
          type="text"
          value={internalValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            'input-field w-full pl-10',
            internalValue && 'pr-10'
          )}
        />
        {internalValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 text-neutral-gray hover:text-neutral-dark"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}

export default SearchBar;