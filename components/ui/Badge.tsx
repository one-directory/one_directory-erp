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

  // Flat lozenge: no border-radius, uppercase tracked, editorial look
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-[#F0EDE6] text-[#3D4E5C] border-[#D8D2C8]',
    success: 'bg-[#EAF4EF] text-[#1E5A44] border-[#B8DDD0]',
    warning: 'bg-[#F7F0E4] text-[#6A4E22] border-[#DFC89A]',
    danger: 'bg-[#F5EAEA] text-[#7A2E2E] border-[#DDB8B8]',
    info: 'bg-[#EAF0F8] text-[#24507A] border-[#B8CEDD]',
    neutral: 'bg-[#F0EDE6] text-[#5A6470] border-[#D8D2C8]',
    purple: 'bg-[#EEE8F8] text-[#5A3E8A] border-[#CBBCE8]',
  };

  const dotStyles: Record<BadgeVariant, string> = {
    default: 'bg-[#9AAAB6]',
    success: 'bg-[#2A6B55]',
    warning: 'bg-[#7A5C2E]',
    danger: 'bg-[#8B3A3A]',
    info: 'bg-[#2E5E8E]',
    neutral: 'bg-[#9AAAB6]',
    purple: 'bg-[#7C5CC4]',
  };

  const sizeStyles = {
    // Flat, tight, uppercase tracked — editorial not pill
    xs: 'text-[9px] px-1.5 py-[2px] leading-none tracking-wide uppercase font-semibold',
    sm: 'text-[10px] px-2 py-0.5 tracking-wide uppercase font-semibold',
    md: 'text-xs px-2.5 py-1 tracking-wide uppercase font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-[2px] ${variantStyles[computedVariant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[computedVariant]}`} />}
      {children}
    </span>
  );
}
