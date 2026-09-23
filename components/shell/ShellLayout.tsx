'use client';

import React, { useState } from 'react';
import { ERPProvider } from '@/context/ERPContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { hasModuleAccess } from '@/lib/rbac';
import { Sidebar, NavigationModule } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { CommandPalette } from './CommandPalette';
import { DetailDrawerManager } from './DetailDrawerManager';
import { GlobalModals } from './GlobalModals';
import { ToastContainer } from '@/components/ui/Toast';
import { LoginView } from '@/components/auth/LoginView';
import { AccessDeniedView } from '@/components/auth/AccessDeniedView';

// Modules
import { DashboardView } from '@/components/modules/dashboard/DashboardView';
import { FollowUpCenterView } from '@/components/modules/crm/FollowUpCenterView';
import { QuotationsView } from '@/components/modules/crm/QuotationsView';
import { CommunicationsView } from '@/components/modules/crm/CommunicationsView';
import { ReservationCalendarView } from '@/components/modules/reservations/ReservationCalendarView';
import { ReservationsListView } from '@/components/modules/reservations/ReservationsListView';
import { PropertiesListView } from '@/components/modules/properties/PropertiesListView';
import { PropertyDetailView } from '@/components/modules/properties/PropertyDetailView';
import { UnitsInventoryView } from '@/components/modules/properties/UnitsInventoryView';
import { HousekeepingView } from '@/components/modules/operations/HousekeepingView';
import { MaintenanceView } from '@/components/modules/operations/MaintenanceView';
import { FinanceOverviewView } from '@/components/modules/finance/FinanceOverviewView';
import { ReviewsView } from '@/components/modules/reviews/ReviewsView';
import { ReportsView } from '@/components/modules/reports/ReportsView';
import { SettingsView } from '@/components/modules/settings/SettingsView';
import { ChannelManagerView } from '@/components/modules/channels/ChannelManagerView';

function ShellInner() {
  const { user, isLoading } = useAuth();
  const [currentModule, setCurrentModule] = useState<NavigationModule>('dashboard');
  const [selectedPropertyDetailId, setSelectedPropertyDetailId] = useState<string | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Loading state — warm on-brand
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F6F1]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2E6E8E] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#9AAAB6] text-xs uppercase tracking-widest font-semibold">
            One Directory ERP
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const handleSelectModule = (mod: NavigationModule) => {
    setCurrentModule(mod);
    setSelectedPropertyDetailId(null);
  };

  const handleSelectProperty = (propId: string) => {
    setSelectedPropertyDetailId(propId);
  };

  const renderCurrentModule = () => {
    if (currentModule !== 'dashboard' && !hasModuleAccess(user.role, currentModule)) {
      return (
        <AccessDeniedView
          module={currentModule}
          onBack={() => setCurrentModule('dashboard')}
        />
      );
    }

    if (currentModule === 'properties' && selectedPropertyDetailId) {
      return (
        <PropertyDetailView
          propertyId={selectedPropertyDetailId}
          onBack={() => setSelectedPropertyDetailId(null)}
        />
      );
    }

    switch (currentModule) {
      case 'dashboard': return <DashboardView />;
      case 'follow-ups': return <FollowUpCenterView />;
      case 'quotations': return <QuotationsView />;
      case 'communications': return <CommunicationsView />;
      case 'calendar': return <ReservationCalendarView />;
      case 'reservations': return <ReservationsListView />;
      case 'properties': return <PropertiesListView onSelectProperty={handleSelectProperty} />;
      case 'units': return <UnitsInventoryView />;
      case 'housekeeping': return <HousekeepingView />;
      case 'maintenance': return <MaintenanceView />;
      case 'finance':
      case 'payments': return <FinanceOverviewView initialTab="payments" />;
      case 'invoices': return <FinanceOverviewView initialTab="invoices" />;
      case 'expenses': return <FinanceOverviewView initialTab="expenses" />;
      case 'owner-settlements': return <FinanceOverviewView initialTab="settlements" />;
      case 'reviews': return <ReviewsView />;
      case 'reports': return <ReportsView />;
      case 'settings': return <SettingsView />;
      case 'channels': return <ChannelManagerView />;
      default: return <DashboardView />;
    }
  };

  return (
    <ERPProvider>
      {/* Root: warm off-white background, charcoal text */}
      <div className="flex h-screen w-screen overflow-hidden bg-[#F8F6F1] text-[#1E2A32] antialiased">
        {/* Left Sidebar */}
        <Sidebar
          currentModule={currentModule}
          onSelectModule={handleSelectModule}
          isOpenMobile={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top Bar — h-12 minimal */}
          <TopBar onOpenMobileMenu={() => setIsMobileDrawerOpen(true)} />

          {/* Page Content — generous padding, warm bg */}
          <main className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8 pb-20 md:pb-8">
            <div className="max-w-[1400px] mx-auto">
              {renderCurrentModule()}
            </div>
          </main>

          {/* Mobile Bottom Nav */}
          <MobileNav
            currentModule={currentModule}
            onSelectModule={handleSelectModule}
            onOpenMoreMenu={() => setIsMobileDrawerOpen(true)}
          />
        </div>

        {/* Global Overlays */}
        <CommandPalette onNavigate={handleSelectModule} />
        <DetailDrawerManager />
        <GlobalModals />
        <ToastContainer />
      </div>
    </ERPProvider>
  );
}

export function ShellLayout() {
  return (
    <AuthProvider>
      <ShellInner />
    </AuthProvider>
  );
}
