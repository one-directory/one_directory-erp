import React from 'react';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  status?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant,
  status,
  size = 'sm',
  className = '',
  dot = false,
}: BadgeProps) {
  // Determine variant automatically from status if provided
  let computedVariant: BadgeVariant = variant || 'default';

  if (status && !variant) {
    const s = status.toLowerCase();
    if (
      s.includes('available') ||
      s.includes('confirmed') ||
      s.includes('completed') ||
      s.includes('success') ||
      s.includes('active') ||
      s.includes('paid') ||
      s.includes('resolved') ||
      s.includes('accepted')
    ) {
      computedVariant = 'success';
    } else if (
      s.includes('pending') ||
      s.includes('cleaning') ||
      s.includes('inspection') ||
      s.includes('waiting') ||
      s.includes('in progress') ||
      s.includes('draft') ||
      s.includes('interested') ||
      s.includes('quotation sent')
    ) {
      computedVariant = 'warning';
    } else if (
      s.includes('overdue') ||
      s.includes('cancelled') ||
      s.includes('maintenance') ||
      s.includes('dirty') ||
      s.includes('urgent') ||
      s.includes('high') ||
      s.includes('lost') ||
      s.includes('failed') ||
      s.includes('out of service')
    ) {
      computedVariant = 'danger';
    } else if (
      s.includes('in house') ||
      s.includes('checked in') ||
      s.includes('occupied') ||
      s.includes('contacted') ||
      s.includes('viewed')
    ) {
      computedVariant = 'info';
    } else if (s.includes('vip')) {
      computedVariant = 'purple';
    } else {
      computedVariant = 'neutral';
    }
  }

  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const dotStyles: Record<BadgeVariant, string> = {
    default: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    neutral: 'bg-gray-400',
    purple: 'bg-purple-500',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 leading-none',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variantStyles[computedVariant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[computedVariant]}`} />}
      {children}
    </span>
  );
}
