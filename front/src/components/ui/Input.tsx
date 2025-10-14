import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold mb-2 uppercase tracking-wide text-gray-300 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 
          bg-valo-dark-bg-secondary dark:bg-valo-dark-bg-tertiary
          border-2 border-valo-dark-border dark:border-valo-dark-border
          text-white placeholder-gray-400
          focus:outline-none focus:border-valo-red focus:shadow-valo
          transition-all duration-200
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
