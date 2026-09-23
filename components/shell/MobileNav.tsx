'use client';

import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  PhoneCall,
  Building2,
  Menu,
} from 'lucide-react';
import { NavigationModule } from './Sidebar';
import { useERP } from '@/context/ERPContext';

interface MobileNavProps {
  currentModule: NavigationModule;
  onSelectModule: (module: NavigationModule) => void;
  onOpenMoreMenu: () => void;
}

export function MobileNav({
  currentModule,
  onSelectModule,
  onOpenMoreMenu,
}: MobileNavProps) {
  const { followUps } = useERP();
  const overdueCount = followUps.filter((f) => f.status === 'Overdue').length;

  const navItems = [
    {
      id: 'dashboard' as NavigationModule,
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4.5 h-4.5" />,
    },
    {
      id: 'reservations' as NavigationModule,
      label: 'Bookings',
      icon: <Calendar className="w-4.5 h-4.5" />,
    },
    {
      id: 'follow-ups' as NavigationModule,
      label: 'Follow-ups',
      icon: <PhoneCall className="w-4.5 h-4.5" />,
      badge: overdueCount > 0 ? overdueCount : undefined,
    },
    {
      id: 'properties' as NavigationModule,
      label: 'Properties',
      icon: <Building2 className="w-4.5 h-4.5" />,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1C2B35] border-t border-[#28394A] px-2 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const isActive = currentModule === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectModule(item.id)}
            className={`flex flex-col items-center py-1 px-3 relative transition-colors ${isActive ? 'text-[#A0C8E0]' : 'text-[#4A6070] hover:text-[#8AA0B0]'
              }`}
          >
            <div className="relative">
              {item.icon}
              {typeof item.badge === 'number' && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#8B3A3A] text-white text-[9px] font-bold flex items-center justify-center rounded-[2px]">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[9px] mt-1 uppercase tracking-wider font-semibold">
              {item.label}
            </span>
          </button>
        );
      })}

      <button
        onClick={onOpenMoreMenu}
        className="flex flex-col items-center py-1 px-3 text-[#4A6070] hover:text-[#8AA0B0] transition-colors"
      >
        <Menu className="w-4.5 h-4.5" />
        <span className="text-[9px] mt-1 uppercase tracking-wider font-semibold">More</span>
      </button>
    </nav>
  );
}
