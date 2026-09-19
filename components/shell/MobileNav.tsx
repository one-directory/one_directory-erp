'use client';

import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  PhoneCall,
  Users,
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
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'reservations' as NavigationModule,
      label: 'Bookings',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'follow-ups' as NavigationModule,
      label: 'Follow-ups',
      icon: <PhoneCall className="w-5 h-5" />,
      badge: overdueCount > 0 ? overdueCount : undefined,
    },
    {
      id: 'guests' as NavigationModule,
      label: 'Guests',
      icon: <Users className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const isActive = currentModule === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectModule(item.id)}
            className={`flex flex-col items-center py-1 px-3 rounded-lg relative transition-colors ${
              isActive ? 'text-teal-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              {item.icon}
              {typeof item.badge === 'number' && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}

      <button
        onClick={onOpenMoreMenu}
        className="flex flex-col items-center py-1 px-3 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">More</span>
      </button>
    </nav>
  );
}
