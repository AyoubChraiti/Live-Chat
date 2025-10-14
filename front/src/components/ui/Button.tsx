import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = 'font-semibold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-valo-red text-white hover:bg-valo-red-dark border-2 border-valo-red hover:border-valo-red-light active:scale-95 shadow-lg hover:shadow-valo',
    secondary: 'bg-transparent border-2 border-valo-blue text-valo-blue hover:bg-valo-blue hover:text-valo-dark-bg active:scale-95',
    danger: 'bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white active:scale-95',
    ghost: 'bg-valo-dark-bg-tertiary border-2 border-valo-dark-border text-gray-300 hover:border-valo-red hover:text-valo-red',
    icon: 'bg-valo-dark-bg-tertiary border-2 border-valo-dark-border text-gray-300 hover:border-valo-red hover:text-valo-red hover:bg-valo-dark-bg-secondary',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  const iconSizes = {
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
  };

  const sizeClass = variant === 'icon' ? iconSizes[size] : sizes[size];

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
};
