import { SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  helperText,
  placeholder,
  className,
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={twMerge(clsx(
          'block w-full rounded-lg border text-sm text-slate-900 py-2 px-3 bg-white transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 shadow-sm',
          error
            ? 'border-rose-300 text-rose-900 focus:ring-rose-500 focus:border-rose-500'
            : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500',
          className
        ))}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
