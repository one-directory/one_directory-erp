import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

// Flat surface: no border-radius, hairline border, subtle shadow
export function Card({ children, className = '', hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={`bg-white border border-[#E2DDD6] shadow-[0_1px_3px_rgba(0,0,0,0.05)] ${hoverable
          ? 'hover:border-[#CEC9C1] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-150 cursor-pointer'
          : ''
        } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

// StatCard — no icon box background, inline label, strong value hierarchy
export function StatCard({
  title,
  value,
  subtitle,
  change,
  trend = 'neutral',
  icon,
  badge,
  onClick,
  className = '',
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#E2DDD6] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] ${onClick
          ? 'cursor-pointer hover:border-[#2E6E8E]/40 hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-150'
          : ''
        } ${className}`}
    >
      {/* Label row: icon inline with title */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[#9AAAB6] shrink-0">{icon}</span>
          <span className="text-[11px] font-semibold tracking-wide uppercase text-[#6B7A87]">
            {title}
          </span>
        </div>
        {badge && (
          <span className="text-[9px] font-semibold tracking-wide uppercase px-1.5 py-0.5 border border-[#D8D2C8] text-[#6B7A87] bg-[#F0EDE6] rounded-[2px]">
            {badge}
          </span>
        )}
      </div>

      {/* Value — large, tabular, prominent */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[#1E2A32] tracking-tight font-tabular leading-none">
          {value}
        </span>
      </div>

      {(subtitle || change) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          {change && (
            <span
              className={`font-semibold ${trend === 'up'
                  ? 'text-[#2A6B55]'
                  : trend === 'down'
                    ? 'text-[#8B3A3A]'
                    : 'text-[#6B7A87]'
                }`}
            >
              {change}
            </span>
          )}
          {subtitle && <span className="text-[#9AAAB6]">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
