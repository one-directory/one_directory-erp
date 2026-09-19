import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({ children, className = '', hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 shadow-xs ${
        hoverable ? 'hover:shadow-md hover:border-slate-300 transition-all duration-150' : ''
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
      className={`bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-teal-400 hover:shadow-md transition-all' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs sm:text-sm font-medium text-slate-500 line-clamp-1">{title}</span>
        <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>

      <div className="mt-2">
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-tabular">
            {value}
          </span>
          {badge && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {badge}
            </span>
          )}
        </div>

        {(subtitle || change) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            {change && (
              <span
                className={`font-semibold ${
                  trend === 'up'
                    ? 'text-emerald-600'
                    : trend === 'down'
                    ? 'text-rose-600'
                    : 'text-slate-500'
                }`}
              >
                {change}
              </span>
            )}
            {subtitle && <span className="text-slate-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
