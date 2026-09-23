import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Squared corners (2px radius), professional, no rounding
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-[2px] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none tracking-wide';

  const variantStyles = {
    // Deep charcoal primary — not teal
    primary:
      'bg-[#1C2B35] hover:bg-[#253542] text-white focus:ring-[#2E6E8E]/40 border border-[#1C2B35]',
    // Warm neutral secondary
    secondary:
      'bg-[#F0EDE6] hover:bg-[#E8E3DA] text-[#1E2A32] focus:ring-slate-300 border border-[#D8D2C8]',
    // Hairline outline
    outline:
      'border border-[#C8C3BA] hover:bg-[#F0EDE6] text-[#3D4E5C] focus:ring-[#2E6E8E]/20 bg-white',
    // Danger — muted red, not vivid
    danger:
      'bg-[#8B3A3A] hover:bg-[#7A2E2E] text-white focus:ring-[#8B3A3A]/30 border border-[#8B3A3A]',
    // Ghost — no border, soft hover
    ghost:
      'hover:bg-[#F0EDE6] text-[#6B7A87] hover:text-[#1E2A32] focus:ring-slate-300 border border-transparent',
    // Success — deep green
    success:
      'bg-[#2A6B55] hover:bg-[#235A47] text-white focus:ring-[#2A6B55]/30 border border-[#2A6B55]',
  };

  const sizeStyles = {
    xs: 'text-[11px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-sm px-4 py-2.5 gap-2',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
