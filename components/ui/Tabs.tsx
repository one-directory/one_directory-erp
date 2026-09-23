import React from 'react';

interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'underline' | 'pill';
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'underline',
}: TabsProps) {
  if (variant === 'pill') {
    // Segmented control — bordered, no fill background
    return (
      <div className={`flex items-center gap-0 border border-[#D8D2C8] rounded-[2px] overflow-hidden overflow-x-auto ${className}`}>
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer ${idx > 0 ? 'border-l border-[#D8D2C8]' : ''
                } ${isActive
                  ? 'bg-[#1C2B35] text-white font-semibold'
                  : 'bg-white text-[#6B7A87] hover:bg-[#F0EDE6] hover:text-[#1E2A32]'
                }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-[1px] font-semibold ${isActive ? 'bg-white/20 text-white' : 'bg-[#F0EDE6] text-[#6B7A87]'
                    }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Underline variant — charcoal active underline, heavy type weight on active
  return (
    <div className={`border-b border-[#E2DDD6] flex items-center gap-6 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 py-2.5 text-xs border-b-2 transition-all duration-150 whitespace-nowrap cursor-pointer -mb-px ${isActive
                ? 'border-[#1E2A32] text-[#1E2A32] font-bold'
                : 'border-transparent text-[#6B7A87] font-medium hover:text-[#1E2A32] hover:border-[#CEC9C1]'
              }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span className="tracking-wide">{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-[2px] font-semibold ${isActive ? 'bg-[#1E2A32] text-white' : 'bg-[#F0EDE6] text-[#6B7A87]'
                  }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
